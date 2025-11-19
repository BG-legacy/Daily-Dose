#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
TOKEN_DIR="test_tokens"
LOG_FILE="loadtest.log"
PARALLEL_USERS=50  # Number of simultaneous users to simulate

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Load Test ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"

# Check if token directory exists
if [ ! -d "$TOKEN_DIR" ]; then
  echo -e "${RED}Error: Token directory not found. Please run create_test_users.sh first${NC}"
  exit 1
fi

# Count actual number of test users by counting token files
if [ -d "$TOKEN_DIR" ]; then
  NUM_USERS=$(ls -1 $TOKEN_DIR | wc -l)
  NUM_USERS=$(echo $NUM_USERS | tr -d '[:space:]')  # Remove whitespace
else
  NUM_USERS=0
fi

if [ $NUM_USERS -eq 0 ]; then
  echo -e "${RED}Error: No token files found in $TOKEN_DIR. Please run create_test_users.sh first${NC}"
  exit 1
fi

echo -e "${BLUE}Simulating ${NUM_USERS} users with ${PARALLEL_USERS} in parallel${NC}"

# Function to simulate a single user's actions
simulate_user() {
  local user_id=$1
  local email="test-user-${user_id}@example.com"
  local token_file="${TOKEN_DIR}/token_test-user-${user_id}"
  
  echo -e "${GREEN}[User ${user_id}] Starting test session${NC}"
  
  # Check if token exists
  if [ ! -f "$token_file" ]; then
    echo -e "${RED}[User ${user_id}] No token found, skipping${NC}"
    return 1
  fi
  
  # Read token from file
  local token=$(cat "$token_file")
  
  if [ -z "$token" ]; then
    echo -e "${RED}[User ${user_id}] Invalid token, skipping${NC}"
    return 1
  fi
  
  # 1. Record a mood
  echo -e "${YELLOW}[User ${user_id}] Recording mood...${NC}"
  moods=("happy" "sad" "upset")
  random_mood=${moods[$((RANDOM % 3))]}
  
  mood_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -d "{\"content\":\"${random_mood}\"}" \
    ${BASE_URL}/api/mood)
  
  if [[ $mood_response == *"error"* ]]; then
    echo -e "${RED}[User ${user_id}] Failed to record mood: ${mood_response}${NC}"
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Mood recorded: ${random_mood}${NC}"
  
  # 2. Get mood summary
  echo -e "${YELLOW}[User ${user_id}] Getting mood summary...${NC}"
  summary_response=$(curl -s -H "Authorization: Bearer ${token}" \
    ${BASE_URL}/api/mood/summary/weekly)
  
  if [[ $summary_response == *"error"* ]]; then
    echo -e "${RED}[User ${user_id}] Failed to get mood summary: ${summary_response}${NC}"
    return 1
  fi
  
  # 3. Add journal entry with AI insights
  echo -e "${YELLOW}[User ${user_id}] Creating journal entry with AI...${NC}"
  
  # Generate a random journal entry
  journal_entries=(
    "Today was a productive day. I finished all my tasks and felt accomplished."
    "I'm feeling stressed about work deadlines. Need to manage my time better."
    "Had a great conversation with a friend today that lifted my spirits."
    "Struggling with motivation today. Need to find ways to stay focused."
    "Excited about starting a new project tomorrow. Looking forward to the challenge."
  )
  random_entry=${journal_entries[$((RANDOM % 5))]}
  
  journal_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${token}" \
    -d "{\"thought\":\"${random_entry}\"}" \
    ${BASE_URL}/api/journal/thoughts)
  
  if [[ $journal_response == *"error"* ]]; then
    echo -e "${RED}[User ${user_id}] Failed to create journal entry: ${journal_response}${NC}"
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Journal entry created${NC}"
  
  # 4. Request AI insights
  echo -e "${YELLOW}[User ${user_id}] Requesting AI insights...${NC}"
  ai_response=$(curl -s -H "Authorization: Bearer ${token}" \
    ${BASE_URL}/api/journal/summary/weekly)
  
  if [[ $ai_response == *"error"* ]]; then
    echo -e "${RED}[User ${user_id}] Failed to get AI insights: ${ai_response}${NC}"
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Test session completed successfully${NC}"
  return 0
}

# Create a function to run tests in parallel batches
run_tests_in_parallel() {
  local success_count=0
  local failure_count=0
  
  for ((i=1; i<=$NUM_USERS; i+=$PARALLEL_USERS)); do
    # Calculate the end of this batch
    end=$((i+PARALLEL_USERS-1))
    if [ $end -gt $NUM_USERS ]; then
      end=$NUM_USERS
    fi
    
    echo -e "${BLUE}Starting batch of users $i to $end${NC}"
    
    # Start a batch of simulations in parallel
    for ((j=i; j<=end; j++)); do
      simulate_user $j
      if [ $? -eq 0 ]; then
        ((success_count++))
      else
        ((failure_count++))
      fi
    done
    
    # Wait for this batch to complete before starting the next
    wait
  done
  
  echo -e "\n${BLUE}==== Load Test Summary ====${NC}"
  echo -e "${GREEN}Successful sessions: ${success_count}${NC}"
  echo -e "${RED}Failed sessions: ${failure_count}${NC}"
  echo -e "${YELLOW}Success rate: $(( (success_count * 100) / (success_count + failure_count) ))%${NC}"
}

# Start the test timer
start_time=$(date +%s)

# Run the tests
run_tests_in_parallel

# Calculate execution time
end_time=$(date +%s)
duration=$((end_time - start_time))

echo -e "\n${BLUE}==== Load Test Complete ====${NC}"
echo -e "${GREEN}Total execution time: ${duration} seconds${NC}"
echo -e "${GREEN}Users simulated: ${NUM_USERS}${NC}"
echo -e "${GREEN}Users per batch: ${PARALLEL_USERS}${NC}"

# Run performance analysis
if [ -f "server.log" ]; then
  echo -e "\n${YELLOW}Running performance analysis...${NC}"
  ./analyze_performance.sh "$LOG_FILE"
else
  echo -e "\n${YELLOW}No server.log file found. Skipping performance analysis.${NC}"
  echo -e "${YELLOW}To analyze server logs later, run:${NC}"
  echo -e "${YELLOW}./analyze_performance.sh <path_to_server_log>${NC}"
fi
