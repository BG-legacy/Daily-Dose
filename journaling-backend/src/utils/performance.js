/**
 * Performance Metrics Utility
 * Provides middleware and functions for capturing and reporting performance metrics
 */

// Store metrics in memory for basic reporting
const metrics = {
  requests: {
    total: 0,
    byEndpoint: {}
  },
  responseTime: {
    total: 0,
    byEndpoint: {}
  },
  database: {
    operations: 0,
    totalTime: 0
  },
  aiApi: {
    calls: 0,
    totalTime: 0,
    errors: 0
  },
  errors: {
    total: 0,
    byType: {}
  }
};

// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  // Skip for options requests
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Record start time
  const start = process.hrtime();
  
  // Track endpoint
  const endpoint = `${req.method} ${req.path}`;
  
  // Initialize endpoint metrics if not exists
  if (!metrics.requests.byEndpoint[endpoint]) {
    metrics.requests.byEndpoint[endpoint] = 0;
    metrics.responseTime.byEndpoint[endpoint] = { 
      total: 0, 
      count: 0, 
      min: Infinity, 
      max: 0 
    };
  }
  
  // Count request
  metrics.requests.total++;
  metrics.requests.byEndpoint[endpoint]++;
  
  // Create response end listener
  const originalEnd = res.end;
  res.end = function(...args) {
    // Calculate duration in milliseconds
    const diff = process.hrtime(start);
    const time = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    
    // Add response time header
    res.setHeader('X-Response-Time', `${time}ms`);
    
    // Update metrics
    metrics.responseTime.total += parseFloat(time);
    metrics.responseTime.byEndpoint[endpoint].total += parseFloat(time);
    metrics.responseTime.byEndpoint[endpoint].count++;
    metrics.responseTime.byEndpoint[endpoint].min = Math.min(metrics.responseTime.byEndpoint[endpoint].min, parseFloat(time));
    metrics.responseTime.byEndpoint[endpoint].max = Math.max(metrics.responseTime.byEndpoint[endpoint].max, parseFloat(time));
    
    // Track errors
    if (res.statusCode >= 400) {
      metrics.errors.total++;
      const errorType = Math.floor(res.statusCode / 100) * 100;
      metrics.errors.byType[errorType] = (metrics.errors.byType[errorType] || 0) + 1;
    }
    
    // Add to logs for more permanent storage
    console.log(`[PERF] ${req.method} ${req.path} ${res.statusCode} ${time}ms`);
    
    // Call original end
    originalEnd.apply(res, args);
  };
  
  next();
};

// Track database operations
const trackDatabaseOperation = (operation, duration) => {
  metrics.database.operations++;
  metrics.database.totalTime += duration;
  
  // Log for more permanent storage
  console.log(`[PERF-DB] ${operation} ${duration}ms`);
};

// Track AI API calls
const trackAIOperation = (operation, duration, success = true) => {
  metrics.aiApi.calls++;
  metrics.aiApi.totalTime += duration;
  
  if (!success) {
    metrics.aiApi.errors++;
  }
  
  // Log for more permanent storage
  console.log(`[PERF-AI] ${operation} ${duration}ms ${success ? 'success' : 'error'}`);
};

// Get metrics summary
const getMetricsSummary = () => {
  const summary = {
    uptime: process.uptime().toFixed(2),
    timestamp: new Date().toISOString(),
    requests: {
      total: metrics.requests.total,
      topEndpoints: Object.entries(metrics.requests.byEndpoint)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([endpoint, count]) => ({ endpoint, count }))
    },
    performance: {
      averageResponseTime: metrics.requests.total ? 
        (metrics.responseTime.total / metrics.requests.total).toFixed(2) : 0,
      endpoints: Object.entries(metrics.responseTime.byEndpoint)
        .map(([endpoint, data]) => ({
          endpoint,
          avg: (data.total / data.count).toFixed(2),
          min: data.min === Infinity ? 0 : data.min,
          max: data.max
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    },
    database: {
      operations: metrics.database.operations,
      averageTime: metrics.database.operations ? 
        (metrics.database.totalTime / metrics.database.operations).toFixed(2) : 0
    },
    aiApi: {
      calls: metrics.aiApi.calls,
      averageTime: metrics.aiApi.calls ? 
        (metrics.aiApi.totalTime / metrics.aiApi.calls).toFixed(2) : 0,
      successRate: metrics.aiApi.calls ? 
        (100 - (metrics.aiApi.errors / metrics.aiApi.calls * 100)).toFixed(2) : 100
    },
    errors: {
      total: metrics.errors.total,
      byType: metrics.errors.byType
    },
    memory: {
      rss: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      heapTotal: (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
      heapUsed: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    }
  };
  
  return summary;
};

module.exports = {
  performanceMiddleware,
  trackDatabaseOperation,
  trackAIOperation,
  getMetricsSummary
}; 