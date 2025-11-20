#!/bin/bash

# This script runs the optimized load test with AWS credentials from command line
# Usage: AWS_ACCESS_KEY_ID=your_key AWS_SECRET_ACCESS_KEY=your_secret AWS_REGION=your_region ./run_with_credentials.sh

# Check if AWS credentials are provided
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_REGION" ]; then
  echo "Error: AWS credentials must be provided as environment variables."
  echo "Usage: AWS_ACCESS_KEY_ID=your_key AWS_SECRET_ACCESS_KEY=your_secret AWS_REGION=your_region ./run_with_credentials.sh"
  exit 1
fi

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=200       # Starting with 200 users
TOKEN_DIR="test_tokens"
LOG_FILE="optimized_loadtest_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Optimized Load Test with AWS Credentials ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Using AWS credentials from environment variables${NC}"

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

# Get mood distribution
echo -e "\n${BLUE}==== Mood Distribution ====${NC}"
HAPPY_COUNT=$(grep -c "Mood recorded: happy" $LOG_FILE 2>/dev/null || echo 0)
SAD_COUNT=$(grep -c "Mood recorded: sad" $LOG_FILE 2>/dev/null || echo 0)
UPSET_COUNT=$(grep -c "Mood recorded: upset" $LOG_FILE 2>/dev/null || echo 0)

TOTAL_MOODS=$((HAPPY_COUNT + SAD_COUNT + UPSET_COUNT))

if [ $TOTAL_MOODS -gt 0 ]; then
  HAPPY_PERCENT=$(echo "scale=2; ($HAPPY_COUNT / $TOTAL_MOODS) * 100" | bc)
  SAD_PERCENT=$(echo "scale=2; ($SAD_COUNT / $TOTAL_MOODS) * 100" | bc)
  UPSET_PERCENT=$(echo "scale=2; ($UPSET_COUNT / $TOTAL_MOODS) * 100" | bc)
  
  echo -e "${GREEN}Happy: ${HAPPY_COUNT} (${HAPPY_PERCENT}%)${NC}"
  echo -e "${BLUE}Sad: ${SAD_COUNT} (${SAD_PERCENT}%)${NC}"
  echo -e "${RED}Upset: ${UPSET_COUNT} (${UPSET_PERCENT}%)${NC}"
fi

# Summary
echo -e "\n${BLUE}==== Test Summary ====${NC}"
echo -e "${GREEN}Test completed in ${duration} seconds${NC}"
echo -e "${GREEN}${SUCCESSFUL_REQUESTS} successful requests out of ${TOTAL_REQUESTS} total${NC}"
echo -e "${GREEN}Test log saved to: ${LOG_FILE}${NC}"
echo -e "\n${YELLOW}To run with more users, adjust the NUM_USERS variable in this script${NC}" 