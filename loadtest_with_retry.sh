#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
TOKEN_DIR="test_tokens"
LOG_FILE="loadtest_with_retry.log"
PARALLEL_USERS=10  # Reduced parallel users to 10 to minimize throttling
MAX_RETRIES=5      # Increased to 5 retries for failed operations
RETRY_DELAY=3      # Increased initial delay
BATCH_DELAY=5      # Delay between batches

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Load Test with Retry Logic ====${NC}"
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
echo -e "${YELLOW}Will retry failed operations up to ${MAX_RETRIES} times${NC}"

# Function to make API request with retry logic
make_request_with_retry() {
  local method=$1
  local url=$2
  local token=$3
  local data=$4
  local description=$5
  local user_id=$6
  local retry_count=0
  local response=""
  
  while [ $retry_count -lt $MAX_RETRIES ]; do
    if [ "$method" == "GET" ]; then
      response=$(curl -s -H "Authorization: Bearer ${token}" ${url})
    else
      response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d "${data}" ${url})
    fi
    
    # Check if response contains error related to throttling
    if [[ $response == *"ProvisionedThroughput"* ]] || [[ $response == *"throughput"* ]] || [[ $response == *"exceeded"* ]]; then
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt $MAX_RETRIES ]; then
        echo -e "${YELLOW}[User ${user_id}] ${description} throttled, retrying in ${RETRY_DELAY}s (${retry_count}/${MAX_RETRIES})${NC}"
        sleep $RETRY_DELAY
        # Increase delay exponentially to allow for backoff
        RETRY_DELAY=$((RETRY_DELAY * 2))
      else
        echo -e "${RED}[User ${user_id}] ${description} failed after ${MAX_RETRIES} retries: ${response}${NC}"
        return 1
      fi
    elif [[ $response == *"error"* ]]; then
      echo -e "${RED}[User ${user_id}] ${description} failed: ${response}${NC}"
      return 1
    else
      echo -e "${GREEN}[User ${user_id}] ${description} succeeded${NC}"
      break
    fi
  done
  
  echo "$response"
  return 0
}

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
  
  mood_data="{\"content\":\"${random_mood}\"}"
  mood_response=$(make_request_with_retry "POST" "${BASE_URL}/api/mood" "$token" "$mood_data" "Mood recording" "$user_id")
  
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Mood recorded: ${random_mood}${NC}"
  
  # Wait a bit before next request to reduce throttling
  sleep 0.5
  
  # 2. Get mood summary
  echo -e "${YELLOW}[User ${user_id}] Getting mood summary...${NC}"
  summary_response=$(make_request_with_retry "GET" "${BASE_URL}/api/mood/summary/weekly" "$token" "" "Mood summary" "$user_id")
  
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  # Wait a bit before next request
  sleep 0.5
  
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
  
  journal_data="{\"thought\":\"${random_entry}\"}"
  journal_response=$(make_request_with_retry "POST" "${BASE_URL}/api/journal/thoughts" "$token" "$journal_data" "Journal creation" "$user_id")
  
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Journal entry created${NC}"
  
  # Wait a bit before next request
  sleep 0.5
  
  # 4. Request AI insights
  echo -e "${YELLOW}[User ${user_id}] Requesting AI insights...${NC}"
  ai_response=$(make_request_with_retry "GET" "${BASE_URL}/api/journal/summary/weekly" "$token" "" "AI insights" "$user_id")
  
  if [ $? -ne 0 ]; then
    return 1
  fi
  
  echo -e "${GREEN}[User ${user_id}] Test session completed successfully${NC}"
  return 0
}

# Run tests in smaller batches with delay between batches
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
    pids=()  # Array to store PIDs
    
    for ((j=i; j<=end; j++)); do
      # Run each user simulation in background
      simulate_user $j &
      pids+=($!)
    done
    
    # Wait for all processes in this batch to complete
    for pid in ${pids[@]}; do
      wait $pid
      exit_code=$?
      if [ $exit_code -eq 0 ]; then
        ((success_count++))
      else
        ((failure_count++))
      fi
    done
    
    # Add a short delay between batches to reduce throttling
    if [ $end -lt $NUM_USERS ]; then
      echo -e "${YELLOW}Batch completed. Waiting before starting next batch...${NC}"
      sleep $BATCH_DELAY
    fi
  done
  
  echo -e "\n${BLUE}==== Load Test Summary ====${NC}"
  echo -e "${GREEN}Successful sessions: ${success_count}${NC}"
  echo -e "${RED}Failed sessions: ${failure_count}${NC}"
  
  if [ $((success_count + failure_count)) -gt 0 ]; then
    success_rate=$(( (success_count * 100) / (success_count + failure_count) ))
    echo -e "${YELLOW}Success rate: ${success_rate}%${NC}"
  else
    echo -e "${RED}No sessions were completed${NC}"
  fi
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