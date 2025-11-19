#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=${2:-1000}
TOKEN_DIR="test_tokens"
MAX_RETRIES=5     # Increased to 5 retries
RETRY_DELAY=3      # Increased initial delay
CONCURRENT_USERS=5 # Reduced to 5 concurrent users
BATCH_DELAY=5      # Increased batch delay

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Creating Test Users for Daily-Dose Load Testing (with retry) ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}"
echo -e "${BLUE}Creating ${NUM_USERS} test users${NC}"

# Clean up old tokens if directory exists
if [ -d "$TOKEN_DIR" ]; then
  echo -e "${YELLOW}Cleaning up old token files...${NC}"
  rm -f ${TOKEN_DIR}/token_test-user-*
else
  # Create token directory if it doesn't exist
  mkdir -p $TOKEN_DIR
fi

# Function to make an API request with retry logic
make_request_with_retry() {
  local method=$1
  local url=$2
  local data=$3
  local description=$4
  local retry_count=0
  local response=""
  local delay=$RETRY_DELAY
  
  while [ $retry_count -lt $MAX_RETRIES ]; do
    response=$(curl -s -X $method -H "Content-Type: application/json" -d "$data" $url)
    
    # Check for throttling errors
    if [[ $response == *"ProvisionedThroughput"* ]] || [[ $response == *"throughput"* ]] || [[ $response == *"exceeded"* ]]; then
      retry_count=$((retry_count + 1))
      if [ $retry_count -lt $MAX_RETRIES ]; then
        echo -e "${YELLOW}${description} throttled, retrying in ${delay}s (${retry_count}/${MAX_RETRIES})${NC}"
        sleep $delay
        delay=$((delay * 2))  # Exponential backoff
      else
        echo -e "${RED}${description} failed after ${MAX_RETRIES} retries: ${response}${NC}"
        echo "$response"
        return 1
      fi
    else
      echo "$response"
      return 0
    fi
  done
}

# Function to create a single test user
create_user() {
  local user_num=$1
  local USER_ID="test-user-${user_num}"
  local EMAIL="test-user-${user_num}@example.com"
  local PASSWORD="password123"
  local NAME="Test User ${user_num}"
  
  echo -e "${YELLOW}Creating user ${user_num}/${NUM_USERS}: ${EMAIL}${NC}"
  
  # Try registration first
  RESPONSE=$(make_request_with_retry "POST" \
    "${BASE_URL}/register" \
    "{\"userID\":\"${USER_ID}\",\"displayName\":\"${NAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
    "User registration for ${EMAIL}")
  
  # Check if registration was successful or user already exists
  if [[ $RESPONSE == *"success"* ]] || [[ $RESPONSE == *"created"* ]] || [[ $RESPONSE == *"already exists"* ]] || [[ $RESPONSE == *"email-already-in-use"* ]]; then
    # Either registration succeeded or user already exists - try login
    echo -e "${GREEN}User ${EMAIL} registration processed, attempting login${NC}"
    
    # Try login with retry
    LOGIN_RESPONSE=$(make_request_with_retry "POST" \
      "${BASE_URL}/auth/login" \
      "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
      "User login for ${EMAIL}")
    
    # Extract token from login response
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
      # Save token to file
      echo $TOKEN > "${TOKEN_DIR}/token_${USER_ID}"
      echo -e "${GREEN}Token saved for ${EMAIL}${NC}"
      return 0
    else
      echo -e "${RED}Failed to get token for ${EMAIL}: ${LOGIN_RESPONSE}${NC}"
      return 1
    fi
  else
    echo -e "${RED}Failed to create user ${EMAIL}: ${RESPONSE}${NC}"
    return 1
  fi
}

# Create users in batches
success_count=0
failure_count=0

for ((i=1; i<=$NUM_USERS; i+=$CONCURRENT_USERS)); do
  # Calculate end of this batch
  end=$((i+CONCURRENT_USERS-1))
  if [ $end -gt $NUM_USERS ]; then
    end=$NUM_USERS
  fi
  
  echo -e "${BLUE}Processing batch of users $i to $end${NC}"
  
  # Start a batch of user creations
  for ((j=i; j<=end; j++)); do
    create_user $j &
  done
  
  # Wait for this batch to complete
  wait
  
  # Pause briefly between batches to reduce throttling
  if [ $end -lt $NUM_USERS ]; then
    echo -e "${YELLOW}Batch completed. Waiting before starting next batch...${NC}"
    sleep $BATCH_DELAY
  fi
done

# Count actual tokens created
ACTUAL_TOKENS=$(ls -1 ${TOKEN_DIR} 2>/dev/null | wc -l | tr -d ' ')
echo -e "${GREEN}Created ${ACTUAL_TOKENS} test users for load testing${NC}"
echo -e "${YELLOW}Tokens stored in ${TOKEN_DIR} directory${NC}"
echo -e "${YELLOW}You can now run ./loadtest_with_retry.sh to start the load test${NC}" 