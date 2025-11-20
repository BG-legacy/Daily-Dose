#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}
NUM_USERS=${2:-1000}
TOKEN_DIR="test_tokens"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Creating Test Users for Daily-Dose Load Testing ====${NC}"
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

# Create test users
for i in $(seq 1 $NUM_USERS); do
  # Generate user data
  USER_ID="test-user-${i}"
  EMAIL="test-user-${i}@example.com"
  PASSWORD="password123"
  NAME="Test User ${i}"
  
  echo -e "${YELLOW}Creating user ${i}/${NUM_USERS}: ${EMAIL}${NC}"
  
  # Send registration request - Note: correct endpoint is /register (not /auth/register)
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"userID\":\"${USER_ID}\",\"displayName\":\"${NAME}\",\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
    ${BASE_URL}/register)
  
  # Check if registration was successful
  if [[ $RESPONSE == *"success"* ]] || [[ $RESPONSE == *"created"* ]]; then
    echo -e "${GREEN}User ${EMAIL} created successfully${NC}"
    
    # Login to get token
    LOGIN_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
      ${BASE_URL}/auth/login)
    
    # Extract token from login response
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
      # Save token to file
      echo $TOKEN > "${TOKEN_DIR}/token_${USER_ID}"
      echo -e "${GREEN}Token saved for ${EMAIL}${NC}"
    else
      echo -e "${RED}Failed to get token for ${EMAIL}${NC}"
    fi
  elif [[ $RESPONSE == *"already exists"* ]] || [[ $RESPONSE == *"email-already-in-use"* ]]; then
    echo -e "${YELLOW}User ${EMAIL} already exists, attempting login${NC}"
    
    # Try to login for existing user
    LOGIN_RESPONSE=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
      ${BASE_URL}/auth/login)
    
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
      echo $TOKEN > "${TOKEN_DIR}/token_${USER_ID}"
      echo -e "${GREEN}Token saved for existing user ${EMAIL}${NC}"
    else
      echo -e "${RED}Failed to get token for existing user ${EMAIL}${NC}"
    fi
  else
    echo -e "${RED}Failed to create user ${EMAIL}: ${RESPONSE}${NC}"
  fi
  
  # Add a slight delay to avoid overwhelming the server
  sleep 0.2
done

# Count actual tokens created
ACTUAL_TOKENS=$(ls -1 ${TOKEN_DIR} | wc -l | tr -d ' ')
echo -e "${GREEN}Created ${ACTUAL_TOKENS} test users for load testing${NC}"
echo -e "${YELLOW}Tokens stored in ${TOKEN_DIR} directory${NC}"
echo -e "${YELLOW}You can now run ./loadtest.sh to start the load test${NC}" 