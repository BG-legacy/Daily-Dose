#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=1000
PARALLEL_USERS=50
TOKEN_DIR="test_tokens"
LOG_FILE="large_loadtest.log"
PERF_LOG="performance_metrics.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Large-Scale Load Test (${NUM_USERS} Users) ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"

# Create test users if they don't exist
echo -e "${YELLOW}Checking for test users...${NC}"
if [ ! -d "$TOKEN_DIR" ] || [ $(ls -1 $TOKEN_DIR 2>/dev/null | wc -l | tr -d ' ') -lt $NUM_USERS ]; then
  echo -e "${YELLOW}Creating test users...${NC}"
  ./create_test_users.sh "$BASE_URL" $NUM_USERS
else
  echo -e "${GREEN}Test users already exist.${NC}"
fi

# Count actual number of test users
ACTUAL_USERS=$(ls -1 $TOKEN_DIR 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}Found ${ACTUAL_USERS} test users${NC}"

# Start server monitoring
echo -e "${YELLOW}Starting performance monitoring...${NC}"
# Reset server log file for fresh metrics
> server.log

# Start the test timer
start_time=$(date +%s)
echo -e "${BLUE}Test started at: $(date)${NC}"

# Run the load test with the specified number of parallel users
echo -e "${YELLOW}Running load test with ${NUM_USERS} users (${PARALLEL_USERS} in parallel)...${NC}"
./loadtest.sh "$BASE_URL" > $LOG_FILE 2>&1

# Calculate execution time
end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "${BLUE}==== Large-Scale Load Test Complete ====${NC}"
echo -e "${GREEN}Test ended at: $(date)${NC}"
echo -e "${GREEN}Total execution time: ${duration} seconds${NC}"

# Parse results from log file
TOTAL_REQUESTS=$(grep -c "\[User" $LOG_FILE 2>/dev/null || echo 0)
SUCCESSFUL_REQUESTS=$(grep -c "completed successfully" $LOG_FILE 2>/dev/null || echo 0)
FAILED_REQUESTS=$(grep -c "Failed to" $LOG_FILE 2>/dev/null || echo 0)

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

# Run performance analysis
echo -e "\n${YELLOW}Running detailed performance analysis...${NC}"
./analyze_performance.sh "server.log" > $PERF_LOG

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

echo -e "\n${GREEN}Complete performance report saved to ${PERF_LOG}${NC}"
echo -e "${GREEN}Raw test logs saved to ${LOG_FILE}${NC}"
echo -e "${YELLOW}To analyze database performance: grep \"\[PERF-DB\]\" server.log | sort -nrk3,3 | head -10${NC}" 