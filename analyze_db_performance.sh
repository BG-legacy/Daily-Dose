#!/bin/bash

# Configuration
LOG_FILE=${1:-"server.log"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==== Daily-Dose Database Performance Analysis ====${NC}"
echo -e "${BLUE}Analyzing log file: ${LOG_FILE}${NC}"

# Check if log file exists
if [ ! -f "$LOG_FILE" ]; then
  echo -e "${RED}Error: Log file '$LOG_FILE' not found${NC}"
  echo -e "${YELLOW}Usage: ./analyze_db_performance.sh [log_file]${NC}"
  exit 1
fi

# Extract all database operations
DB_OPS=$(grep "\[PERF-DB\]" "$LOG_FILE")
DB_OPS_COUNT=$(echo "$DB_OPS" | wc -l)

if [ $DB_OPS_COUNT -eq 0 ]; then
  echo -e "${RED}No database operations found in log file${NC}"
  exit 1
fi

# Get overall database performance statistics
echo -e "\n${YELLOW}Overall Database Performance:${NC}"
echo "$DB_OPS" | awk '{
  sum+=$3; count++;
  if($3 < min || min == "") min=$3;
  if($3 > max) max=$3;
  total_time+=$3;
}
END {
  if(count>0) printf "Operations: %d\nTotal Time: %.2f ms\nAvg Time: %.2f ms\nMin Time: %.2f ms\nMax Time: %.2f ms\n", 
  count, total_time, sum/count, min, max;
}'

# Performance by operation type
echo -e "\n${YELLOW}Performance by Operation Type:${NC}"
echo "$DB_OPS" | awk '{
  op=$2;
  time=$3;
  sum[op]+=time;
  count[op]++;
  if(time < min[op] || min[op] == "") min[op]=time;
  if(time > max[op]) max[op]=time;
}
END {
  printf "%-25s %-10s %-15s %-15s %-15s\n", "Operation", "Count", "Avg Time (ms)", "Min Time (ms)", "Max Time (ms)";
  for(op in count) {
    printf "%-25s %-10d %-15.2f %-15.2f %-15.2f\n", op, count[op], sum[op]/count[op], min[op], max[op];
  }
}' | sort -nrk2,2

# Identify slow operations (>100ms)
echo -e "\n${YELLOW}Slow Operations (>100ms):${NC}"
SLOW_OPS=$(echo "$DB_OPS" | awk '$3 > 100 {print}')
SLOW_COUNT=$(echo "$SLOW_OPS" | grep -v '^$' | wc -l)

if [ $SLOW_COUNT -eq 0 ]; then
  echo -e "${GREEN}No slow operations found${NC}"
else
  SLOW_PERCENT=$(echo "scale=2; ($SLOW_COUNT / $DB_OPS_COUNT) * 100" | bc)
  echo -e "${RED}Found ${SLOW_COUNT} slow operations (${SLOW_PERCENT}% of total)${NC}"
  echo -e "\n${YELLOW}Top 10 Slowest Operations:${NC}"
  echo "$DB_OPS" | sort -nrk3,3 | head -10
fi

# Operation frequency over time (operations per minute)
echo -e "\n${YELLOW}Database Activity Over Time:${NC}"
echo "$DB_OPS" | awk '{
  # Extract timestamp
  timestamp=$1;
  # Get minute from timestamp
  gsub(/\[|\]/, "", timestamp);
  minute=substr(timestamp, 1, 16);
  count[minute]++;
}
END {
  # Sort minutes chronologically
  asorti(count, minutes);
  for(i in minutes) {
    minute=minutes[i];
    printf "%s: %d operations\n", minute, count[minute];
  }
}'

# Error analysis
echo -e "\n${YELLOW}Database Error Analysis:${NC}"
DB_ERRORS=$(echo "$DB_OPS" | grep "_error")
ERROR_COUNT=$(echo "$DB_ERRORS" | grep -v '^$' | wc -l)

if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}No database errors detected${NC}"
else
  ERROR_PERCENT=$(echo "scale=2; ($ERROR_COUNT / $DB_OPS_COUNT) * 100" | bc)
  echo -e "${RED}Found ${ERROR_COUNT} database errors (${ERROR_PERCENT}% of total)${NC}"
  
  # Group errors by operation type
  echo -e "\n${YELLOW}Errors by Operation Type:${NC}"
  echo "$DB_ERRORS" | awk '{
    op=$2;
    gsub("_error", "", op);
    count[op]++;
  }
  END {
    for(op in count) {
      printf "%s: %d errors\n", op, count[op];
    }
  }' | sort -nrk2,2
fi

echo -e "\n${BLUE}==== Database Performance Analysis Complete ====${NC}" 