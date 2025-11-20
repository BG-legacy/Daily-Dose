#!/bin/bash

# This script runs load tests with a gradual increase in user count to avoid exceeding DynamoDB capacity

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
START_USERS=10      # Start with just 10 users
MAX_USERS=1000      # Maximum users to test
STEP_SIZE=10        # Increase by this many users each step
TOKEN_DIR="test_tokens"
LOG_DIR="incremental_logs"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Incremental Load Testing ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Starting with ${START_USERS} users, adding ${STEP_SIZE} at a time, up to ${MAX_USERS} users${NC}"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Clean up token directory
if [ -d "$TOKEN_DIR" ]; then
  echo -e "${YELLOW}Cleaning up old token files...${NC}"
  rm -f ${TOKEN_DIR}/token_test-user-*
else
  # Create token directory if it doesn't exist
  mkdir -p $TOKEN_DIR
fi

# Create a summary file
SUMMARY_FILE="${LOG_DIR}/summary_$(date +%Y%m%d_%H%M%S).csv"
echo "users,success_rate,requests_per_second,duration,total_requests,successful_requests,failed_requests" > "$SUMMARY_FILE"

# Function to run a test with N users
run_test_with_n_users() {
  local num_users=$1
  local log_file="${LOG_DIR}/loadtest_${num_users}_users_$(date +%Y%m%d_%H%M%S).log"
  
  echo -e "\n${BLUE}===== Testing with ${num_users} users =====${NC}"
  
  # Step 1: Create test users for this batch
  echo -e "${YELLOW}Creating ${num_users} test users...${NC}"
  ./create_test_users_with_retry.sh "$BASE_URL" $num_users
  
  # Wait briefly to allow system to stabilize
  sleep 5
  
  # Step 2: Reset server log for clean metrics
  echo -e "${YELLOW}Resetting server logs...${NC}"
  > server.log
  
  # Step 3: Run load test
  echo -e "${YELLOW}Running load test...${NC}"
  start_time=$(date +%s)
  
  ./loadtest_with_retry.sh "$BASE_URL" > "$log_file" 2>&1
  
  # Calculate execution time
  end_time=$(date +%s)
  duration=$((end_time - start_time))
  
  # Get test results
  TOTAL_REQUESTS=$(grep -c "\[User" "$log_file" 2>/dev/null || echo 0)
  SUCCESSFUL_REQUESTS=$(grep -c "completed successfully" "$log_file" 2>/dev/null || echo 0)
  FAILED_REQUESTS=$(grep -c "failed" "$log_file" 2>/dev/null || echo 0)
  
  # Calculate success rate and requests per second
  if [ $TOTAL_REQUESTS -gt 0 ]; then
    SUCCESS_RATE=$(echo "scale=2; ($SUCCESSFUL_REQUESTS / $TOTAL_REQUESTS) * 100" | bc)
  else
    SUCCESS_RATE=0
  fi
  
  if [ $duration -gt 0 ]; then
    RPS=$(echo "scale=2; $TOTAL_REQUESTS / $duration" | bc)
  else
    RPS=0
  fi
  
  # Print results
  echo -e "\n${BLUE}==== Test Results (${num_users} users) ====${NC}"
  echo -e "${GREEN}Duration: ${duration} seconds${NC}"
  echo -e "${GREEN}Total Requests: ${TOTAL_REQUESTS}${NC}"
  echo -e "${GREEN}Successful: ${SUCCESSFUL_REQUESTS}${NC}"
  echo -e "${RED}Failed: ${FAILED_REQUESTS}${NC}"
  echo -e "${YELLOW}Success Rate: ${SUCCESS_RATE}%${NC}"
  echo -e "${YELLOW}Requests/sec: ${RPS}${NC}"
  
  # Add to summary
  echo "${num_users},${SUCCESS_RATE},${RPS},${duration},${TOTAL_REQUESTS},${SUCCESSFUL_REQUESTS},${FAILED_REQUESTS}" >> "$SUMMARY_FILE"
  
  # Check if we should continue
  if (( $(echo "$SUCCESS_RATE < 80" | bc -l) )); then
    echo -e "${RED}Success rate dropped below 80% - stopping tests${NC}"
    return 1
  fi
  
  return 0
}

# Run tests with incrementally increasing user counts
for ((users=START_USERS; users<=MAX_USERS; users+=STEP_SIZE)); do
  run_test_with_n_users $users
  
  # Check if the test failed
  if [ $? -ne 0 ]; then
    echo -e "${RED}Test failed with ${users} users, stopping incremental testing${NC}"
    break
  fi
  
  # Wait between tests to let system recover
  if [ $users -lt $MAX_USERS ]; then
    echo -e "${YELLOW}Waiting 30 seconds before next test...${NC}"
    sleep 30
  fi
done

# Final summary
echo -e "\n${BLUE}==== Incremental Load Test Summary ====${NC}"
echo -e "${GREEN}Results saved to ${SUMMARY_FILE}${NC}"
echo -e "${YELLOW}Maximum users tested: ${users}${NC}"

# Display the point at which performance started to degrade
MAX_SUCCESSFUL_USERS=$(tail -n 1 "$SUMMARY_FILE" | cut -d',' -f1)
MAX_SUCCESS_RATE=$(tail -n 1 "$SUMMARY_FILE" | cut -d',' -f2)
MAX_RPS=$(tail -n 1 "$SUMMARY_FILE" | cut -d',' -f3)

echo -e "${BLUE}Best performance: ${MAX_SUCCESSFUL_USERS} users with ${MAX_SUCCESS_RATE}% success rate at ${MAX_RPS} requests/sec${NC}" 