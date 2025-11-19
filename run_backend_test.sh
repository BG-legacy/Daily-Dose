#!/bin/bash

# This script runs the load test using the .env file from the backend directory

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=1000       # Starting with 1000 users for the initial test
TOKEN_DIR="test_tokens"
LOG_FILE="backend_loadtest_$(date +%Y%m%d_%H%M%S).log"
BACKEND_DIR="journaling-backend"
ENV_FILE="${BACKEND_DIR}/.env"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Load Test (Using Backend Credentials) ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"

# Check if backend env file exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}Error: Backend .env file not found at ${ENV_FILE}${NC}"
  exit 1
fi

echo -e "${GREEN}Found backend .env file${NC}"

# Export environment variables from backend .env file
echo -e "${YELLOW}Loading environment variables from backend...${NC}"
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Step 1: Update DynamoDB provisioned throughput
echo -e "\n${YELLOW}Step 1: Updating DynamoDB provisioned throughput...${NC}"
node update_dynamodb_capacity.js

# Step 2: Create test users with optimized settings
echo -e "\n${YELLOW}Step 2: Creating test users...${NC}"
./create_test_users_with_retry.sh "$BASE_URL" $NUM_USERS

# Count actual test users
ACTUAL_USERS=$(ls -1 $TOKEN_DIR 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}Ready with ${ACTUAL_USERS} test users${NC}"

# Step 3: Reset server log for clean metrics
echo -e "\n${YELLOW}Step 3: Resetting server logs for clean metrics...${NC}"
> server.log

# Step 4: Run load test with optimized settings
echo -e "\n${YELLOW}Step 4: Running optimized load test...${NC}"
start_time=$(date +%s)
echo -e "${BLUE}Test started at: $(date)${NC}"

./loadtest_with_retry.sh "$BASE_URL" > $LOG_FILE 2>&1

# Calculate execution time
end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "\n${BLUE}==== Load Test Complete ====${NC}"
echo -e "${GREEN}Test ended at: $(date)${NC}"
echo -e "${GREEN}Total execution time: ${duration} seconds${NC}"

# Step 5: Analyze results
echo -e "\n${YELLOW}Step 5: Analyzing test results...${NC}"

# Parse results from log file
TOTAL_REQUESTS=$(grep -c "\[User" $LOG_FILE 2>/dev/null || echo 0)
SUCCESSFUL_REQUESTS=$(grep -c "completed successfully" $LOG_FILE 2>/dev/null || echo 0)
FAILED_REQUESTS=$(grep -c "failed" $LOG_FILE 2>/dev/null || echo 0)

echo -e "\n${BLUE}==== Test Results Summary ====${NC}"
echo -e "${GREEN}Users: ${NUM_USERS}${NC}"
echo -e "${GREEN}Total API requests: ${TOTAL_REQUESTS}${NC}"
echo -e "${GREEN}Successful requests: ${SUCCESSFUL_REQUESTS}${NC}"
echo -e "${RED}Failed requests: ${FAILED_REQUESTS}${NC}"

# Success rate calculation
if [ $TOTAL_REQUESTS -gt 0 ]; then
  SUCCESS_RATE=$(echo "scale=2; ($SUCCESSFUL_REQUESTS / $TOTAL_REQUESTS) * 100" | bc)
  echo -e "${YELLOW}Success rate: ${SUCCESS_RATE}%${NC}"
fi

# Calculate requests per second
if [ $duration -gt 0 ]; then
  RPS=$(echo "scale=2; $TOTAL_REQUESTS / $duration" | bc)
  echo -e "${YELLOW}Average requests per second: ${RPS}${NC}"
fi

# Check for database performance issues
DB_OPS=$(grep "\[PERF-DB\]" server.log | wc -l)
SLOW_DB_OPS=$(grep "\[PERF-DB\]" server.log | awk '$3 > 500 {print}' | wc -l)

echo -e "\n${BLUE}==== Database Performance ====${NC}"
echo -e "${GREEN}Total database operations: ${DB_OPS}${NC}"
echo -e "${RED}Slow database operations (>500ms): ${SLOW_DB_OPS}${NC}"

if [ $DB_OPS -gt 0 ]; then
  SLOW_PERCENT=$(echo "scale=2; ($SLOW_DB_OPS / $DB_OPS) * 100" | bc)
  echo -e "${YELLOW}Percentage of slow DB operations: ${SLOW_PERCENT}%${NC}"
  
  # List the 5 slowest DB operations
  echo -e "\n${YELLOW}Top 5 Slowest Database Operations:${NC}"
  grep "\[PERF-DB\]" server.log | sort -nrk3,3 | head -5
fi

# Summary
echo -e "\n${BLUE}==== Test Summary ====${NC}"
echo -e "${GREEN}Test completed with ${ACTUAL_USERS} users in ${duration} seconds${NC}"
echo -e "${GREEN}${SUCCESSFUL_REQUESTS} successful requests out of ${TOTAL_REQUESTS} total${NC}"
echo -e "${GREEN}Test log saved to: ${LOG_FILE}${NC}"

# Clean up environment variables to avoid leaking credentials
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_REGION OPENAI_API_KEY 