#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default log file
LOG_FILE=${1:-"server.log"}

if [ ! -f "$LOG_FILE" ]; then
  echo -e "${RED}Error: Log file '$LOG_FILE' not found${NC}"
  echo -e "${YELLOW}Usage: ./analyze_performance.sh [log_file]${NC}"
  exit 1
fi

echo -e "${BLUE}==== Daily-Dose Performance Analysis ====${NC}"
echo -e "${BLUE}Analyzing log file: ${LOG_FILE}${NC}"

# Extract performance metrics
echo -e "\n${YELLOW}API Response Time Analysis:${NC}"
grep "\[PERF\]" "$LOG_FILE" | awk '{sum+=$4; count++} END {if(count>0) printf "Average response time: %.2f ms over %d requests\n", sum/count, count}'

# API endpoints breakdown with success/failure rates
echo -e "\n${YELLOW}API Endpoint Usage and Success Rates:${NC}"
grep "\[PERF\]" "$LOG_FILE" | awk '
{
  endpoint=$3
  status=$2
  if (status ~ /^2/) success[endpoint]++
  else if (status ~ /^4|^5/) failure[endpoint]++
  total[endpoint]++
}
END {
  for (endpoint in total) {
    success_rate = (success[endpoint] / total[endpoint]) * 100
    printf "%s: %d requests (%.1f%% success)\n", endpoint, total[endpoint], success_rate
  }
}' | sort -nr -k2

# Error rate analysis
TOTAL_REQUESTS=$(grep "\[PERF\]" "$LOG_FILE" | wc -l)
ERROR_REQUESTS=$(grep "\[PERF\]" "$LOG_FILE" | grep -E " 4[0-9]{2}| 5[0-9]{2}" | wc -l)

if [ $TOTAL_REQUESTS -gt 0 ]; then
  ERROR_RATE=$(echo "scale=2; ($ERROR_REQUESTS / $TOTAL_REQUESTS) * 100" | bc)
  echo -e "\n${YELLOW}Error Analysis:${NC}"
  echo -e "Total Requests: $TOTAL_REQUESTS"
  echo -e "Error Requests: $ERROR_REQUESTS"
  echo -e "Error Rate: ${ERROR_RATE}%"
  
  if (( $(echo "$ERROR_RATE > 5" | bc -l) )); then
    echo -e "${RED}Warning: Error rate above 5%${NC}"
  else
    echo -e "${GREEN}Error rate within acceptable range${NC}"
  fi
fi

# Authentication analysis
AUTH_FAILURES=$(grep "Authentication failed" "$LOG_FILE" | wc -l)
if [ $AUTH_FAILURES -gt 0 ]; then
  echo -e "\n${YELLOW}Authentication Issues:${NC}"
  echo -e "Authentication failures: $AUTH_FAILURES"
  echo -e "${RED}Warning: High number of authentication failures detected${NC}"
fi

# AI API performance
echo -e "\n${YELLOW}AI API Performance:${NC}"
grep "\[PERF-AI\]" "$LOG_FILE" | awk '{sum+=$3; count++} END {if(count>0) printf "Average AI processing time: %.2f ms over %d requests\n", sum/count, count}'
AI_ERRORS=$(grep "\[PERF-AI\]" "$LOG_FILE" | grep "error" | wc -l)
AI_TOTAL=$(grep "\[PERF-AI\]" "$LOG_FILE" | wc -l)

if [ $AI_TOTAL -gt 0 ]; then
  AI_ERROR_RATE=$(echo "scale=2; ($AI_ERRORS / $AI_TOTAL) * 100" | bc)
  echo -e "AI API Error Rate: ${AI_ERROR_RATE}%"
  
  if (( $(echo "$AI_ERROR_RATE > 5" | bc -l) )); then
    echo -e "${RED}Warning: AI API error rate above 5%${NC}"
  fi
fi

# Database operations analysis
echo -e "\n${YELLOW}Database Performance:${NC}"
grep "\[PERF-DB\]" "$LOG_FILE" | awk '{sum+=$3; count++} END {if(count>0) printf "Average DB operation time: %.2f ms over %d operations\n", sum/count, count}'

# Extract the 5 slowest API requests
echo -e "\n${YELLOW}Top 5 Slowest API Requests:${NC}"
grep "\[PERF\]" "$LOG_FILE" | sort -nrk4,4 | head -5 | awk '{printf "%.2f ms: %s %s\n", $4, $2, $3}'

# Concurrency analysis
echo -e "\n${YELLOW}Concurrency Analysis:${NC}"
# Extract timestamps and count requests per second
grep "\[PERF\]" "$LOG_FILE" | awk '{print $1}' | sort | uniq -c | sort -nr | head -5 | awk '{printf "%s requests at timestamp %s\n", $1, $2}'

# Response time distribution
echo -e "\n${YELLOW}Response Time Distribution:${NC}"
grep "\[PERF\]" "$LOG_FILE" | awk '
{
  time=$4
  if (time < 100) bucket["<100ms"]++
  else if (time < 200) bucket["100-200ms"]++
  else if (time < 500) bucket["200-500ms"]++
  else if (time < 1000) bucket["500-1000ms"]++
  else bucket[">1000ms"]++
}
END {
  for (range in bucket) {
    printf "%s: %d requests\n", range, bucket[range]
  }
}' | sort -k2 -nr

echo -e "\n${BLUE}==== Performance Analysis Complete ====${NC}"
echo -e "${GREEN}Recommendation: For detailed analysis, consider exporting metrics to Prometheus or a similar monitoring system.${NC}" 