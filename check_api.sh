#!/bin/bash

# Configuration
BASE_URL=${1:-"http://localhost:3011"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose API Check ====${NC}"
echo -e "${BLUE}Base URL: ${BASE_URL}${NC}\n"

# Check server health
echo -e "${YELLOW}Checking server health...${NC}"
HEALTH_RESPONSE=$(curl -s ${BASE_URL}/health)

if [[ $HEALTH_RESPONSE == *"status"*"ok"* ]]; then
  echo -e "${GREEN}✓ Server is healthy${NC}"
else
  echo -e "${RED}✗ Server health check failed: ${HEALTH_RESPONSE}${NC}"
fi

# Test user registration
echo -e "\n${YELLOW}Testing user registration...${NC}"
REG_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test User","email":"apitest@example.com","password":"password123"}' \
  ${BASE_URL}/register)

if [[ $REG_RESPONSE == *"success"* ]] || [[ $REG_RESPONSE == *"email-already-in-use"* ]]; then
  echo -e "${GREEN}✓ Registration endpoint working${NC}"
  echo -e "${GREEN}Response: ${REG_RESPONSE}${NC}"
else
  echo -e "${RED}✗ Registration endpoint failed: ${REG_RESPONSE}${NC}"
fi

# Test user login
echo -e "\n${YELLOW}Testing user login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"apitest@example.com","password":"password123"}' \
  ${BASE_URL}/auth/login)

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo -e "${GREEN}✓ Login endpoint working${NC}"
  
  # Extract token for further tests
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}Got token: ${TOKEN}${NC}"
  
  # Test authenticated endpoint
  if [ -n "$TOKEN" ]; then
    echo -e "\n${YELLOW}Testing authenticated endpoint (mood summary)...${NC}"
    AUTH_RESPONSE=$(curl -s -H "Authorization: Bearer ${TOKEN}" ${BASE_URL}/api/mood/summary/weekly)
    
    if [[ $AUTH_RESPONSE != *"error"* ]]; then
      echo -e "${GREEN}✓ Authenticated endpoint working${NC}"
    else
      echo -e "${RED}✗ Authenticated endpoint failed: ${AUTH_RESPONSE}${NC}"
    fi
  fi
else
  echo -e "${RED}✗ Login endpoint failed: ${LOGIN_RESPONSE}${NC}"
fi

echo -e "\n${BLUE}==== API Check Complete ====${NC}"
echo -e "${YELLOW}If all checks passed, you can run:${NC}"
echo -e "${GREEN}./create_test_users.sh${NC}"
echo -e "${GREEN}./loadtest.sh${NC}" 