#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=${2:-100}
LOG_FILE="loadtest_$(date +%Y%m%d_%H%M%S).log"
SERVER_LOG_FILE="server.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}= Daily-Dose Complete Load Test Process =${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Number of users: ${NUM_USERS}${NC}"
echo -e "${BLUE}Log file: ${LOG_FILE}${NC}"

# Step 1: Check API endpoints
echo -e "\n${YELLOW}STEP 1: Checking API endpoints${NC}"
echo -e "${YELLOW}===================${NC}"
./check_api.sh $BASE_URL | tee -a $LOG_FILE

# Check if API check was successful
if [[ $? -ne 0 ]]; then
  echo -e "\n${RED}API check failed. Please fix API issues before continuing.${NC}"
  exit 1
fi

# Step 2: Create test users
echo -e "\n${YELLOW}STEP 2: Creating test users${NC}"
echo -e "${YELLOW}======================${NC}"
./create_test_users.sh $BASE_URL $NUM_USERS | tee -a $LOG_FILE

# Check if test users directory exists
if [ ! -d "test_tokens" ] || [ -z "$(ls -A test_tokens 2>/dev/null)" ]; then
  echo -e "\n${RED}Test user creation failed or no tokens were generated.${NC}"
  echo -e "${RED}Please check the server logs for more information.${NC}"
  exit 1
fi

# Step 3: Run load test
echo -e "\n${YELLOW}STEP 3: Running load test${NC}"
echo -e "${YELLOW}=====================${NC}"
./loadtest.sh $BASE_URL | tee -a $LOG_FILE

# Step 4: Check if we have a server log file
echo -e "\n${YELLOW}STEP 4: Analyzing performance${NC}"
echo -e "${YELLOW}=========================${NC}"

if [ -f "$SERVER_LOG_FILE" ]; then
  ./analyze_performance.sh $SERVER_LOG_FILE | tee -a $LOG_FILE
else
  echo -e "${RED}Warning: Server log file '$SERVER_LOG_FILE' not found. Skipping performance analysis.${NC}" | tee -a $LOG_FILE
  echo -e "${YELLOW}To analyze server logs, run:${NC}" | tee -a $LOG_FILE
  echo -e "${YELLOW}./analyze_performance.sh <path_to_server_log>${NC}" | tee -a $LOG_FILE
fi

echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}Complete load test process finished.${NC}"
echo -e "${GREEN}Results saved to: ${LOG_FILE}${NC}"
echo -e "${BLUE}=========================================${NC}"

# Provide a summary of findings
echo -e "\n${YELLOW}SUMMARY${NC}"
echo -e "${YELLOW}=======${NC}"

# Use conditional checks to avoid errors if metrics aren't found
AVG_RESPONSE_TIME=$(grep "Average response time" $LOG_FILE | tail -1 | awk '{print $4}' 2>/dev/null)
if [ -n "$AVG_RESPONSE_TIME" ]; then
  echo -e "Average response time: $AVG_RESPONSE_TIME"
else
  echo -e "Average response time: Not available"
fi

SUCCESSFUL_USERS=$(grep "Successful sessions" $LOG_FILE | tail -1 | awk '{print $3}' 2>/dev/null)
if [ -n "$SUCCESSFUL_USERS" ]; then
  echo -e "Successful users: $SUCCESSFUL_USERS"
else
  echo -e "Successful users: Not available"
fi

FAILED_USERS=$(grep "Failed sessions" $LOG_FILE | tail -1 | awk '{print $3}' 2>/dev/null)
if [ -n "$FAILED_USERS" ]; then
  echo -e "Failed users: $FAILED_USERS"
else
  echo -e "Failed users: Not available"
fi

SUCCESS_RATE=$(grep "Success rate" $LOG_FILE | tail -1 | awk '{print $3}' 2>/dev/null)
if [ -n "$SUCCESS_RATE" ]; then
  echo -e "Success rate: $SUCCESS_RATE"
else
  echo -e "Success rate: Not available"
fi

exit 0 