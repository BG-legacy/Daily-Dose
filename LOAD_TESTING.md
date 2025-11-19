# Daily-Dose Load Testing Guide

This document provides instructions for load testing the Daily-Dose application to ensure it performs well under high user load.

## Overview

The load testing toolkit includes several scripts:

- `check_api.sh` - Quick API endpoint verification
- `create_test_users.sh` - Create test users for load testing
- `loadtest.sh` - Run the actual load test with simulated users
- `analyze_performance.sh` - Analyze performance metrics from the load test

## Prerequisites

- Bash shell environment
- curl command-line tool
- bc (basic calculator) for math operations
- The Daily-Dose backend server running

## Quick Start

1. **Verify API endpoints**:
   ```
   ./check_api.sh [base_url]
   ```
   Default base_url is http://localhost:3011

2. **Create test users**:
   ```
   ./create_test_users.sh [base_url] [num_users]
   ```
   Default is 100 users and base_url is http://localhost:3011

3. **Run load test**:
   ```
   ./loadtest.sh [base_url]
   ```
   Default base_url is http://localhost:3011

4. **Analyze results**:
   ```
   ./analyze_performance.sh [log_file]
   ```
   Default log_file is server.log

## Configuration Options

### Test User Creation

The `create_test_users.sh` script creates test users for load testing:

```
./create_test_users.sh [base_url] [num_users]
```

- `base_url`: The base URL of the backend API (default: http://localhost:3011)
- `num_users`: Number of test users to create (default: 100)

The script:
1. Creates unique users with email pattern test-user-{n}@example.com
2. Logs in each user to obtain an auth token
3. Stores tokens in a directory for reuse during load testing

### Load Testing

The `loadtest.sh` script simulates multiple users performing typical actions:

```
./loadtest.sh [base_url]
```

- `base_url`: The base URL of the backend API (default: http://localhost:3011)

The script simulates users:
1. Authenticating with their tokens
2. Tracking their mood
3. Viewing mood summaries
4. Creating journal entries
5. Requesting AI insights

You can adjust the parallelism by modifying the `PARALLEL_USERS` variable in the script.

### Performance Analysis

The `analyze_performance.sh` script provides metrics for server performance:

```
./analyze_performance.sh [log_file]
```

- `log_file`: The server log file to analyze (default: server.log)

The script analyzes:
- API response times
- Error rates
- Endpoint usage patterns
- Database operation performance
- Authentication issues
- Concurrency metrics

## Troubleshooting

### "Cannot POST /register" Error
- Ensure the backend server is running
- Check if the API endpoint is correctly configured in index.js
- Verify that the request body format matches what the server expects

### Authentication Failures
- Check if tokens are being properly stored and retrieved
- Ensure the authentication middleware is working correctly
- Verify the token format is compatible with your auth system

### High Error Rates
- Look for patterns in the errors using analyze_performance.sh
- Check server logs for specific error messages
- Verify that database connections are working properly

## Extending the Load Test

To add new test scenarios:
1. Modify the `simulate_user()` function in loadtest.sh
2. Add new API calls to test additional endpoints
3. Update analyze_performance.sh to track metrics for the new endpoints

## Performance Optimization Tips

Based on load test results, consider:
- Adding caching for frequently accessed data
- Optimizing database queries
- Using connection pooling
- Implementing rate limiting for abuse prevention
- Scaling horizontally with multiple server instances
- Adding CDN for static content 