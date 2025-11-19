/**
 * Frontend Performance Monitoring
 * 
 * This module provides utilities for tracking and reporting frontend performance metrics
 * including load times, API calls, and web vitals.
 */

// Store metrics in memory
const metrics = {
  pageLoads: {},
  apiCalls: [],
  vitals: {},
  interactions: {},
  errors: []
};

// Track page load times
export const trackPageLoad = (route, timing) => {
  const { startTime, endTime, redirectCount } = timing;
  const loadTime = endTime - startTime;
  
  // Initialize route if not exists
  if (!metrics.pageLoads[route]) {
    metrics.pageLoads[route] = {
      visits: 0,
      totalLoadTime: 0,
      minLoadTime: Number.MAX_SAFE_INTEGER,
      maxLoadTime: 0,
      redirects: 0
    };
  }
  
  // Update metrics
  metrics.pageLoads[route].visits++;
  metrics.pageLoads[route].totalLoadTime += loadTime;
  metrics.pageLoads[route].minLoadTime = Math.min(metrics.pageLoads[route].minLoadTime, loadTime);
  metrics.pageLoads[route].maxLoadTime = Math.max(metrics.pageLoads[route].maxLoadTime, loadTime);
  metrics.pageLoads[route].redirects += redirectCount;
  
  // Log metrics
  console.log(`[Performance] Page load: ${route} - ${loadTime}ms`);
  
  // In development, show in console with styling
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%cPage Load: ${route}%c\nLoad Time: ${loadTime}ms\nRedirects: ${redirectCount}`,
      'font-weight: bold; color: blue;',
      'font-weight: normal; color: black;'
    );
  }
  
  // Return metrics for immediate use
  return {
    route,
    loadTime,
    redirectCount
  };
};

// Track API call performance
export const trackApiCall = (endpoint, method, timing, status, error = null) => {
  const { startTime, endTime } = timing;
  const duration = endTime - startTime;
  
  const apiCall = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    duration,
    status,
    error
  };
  
  // Add to metrics
  metrics.apiCalls.push(apiCall);
  
  // Log metrics
  const statusColor = status >= 400 ? 'red' : status >= 300 ? 'orange' : 'green';
  console.log(`[Performance] API ${method}: ${endpoint} - ${duration}ms (${status})`);
  
  // In development, show in console with styling
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `%cAPI Call: ${method} ${endpoint}%c\nDuration: ${duration}ms\nStatus: %c${status}`,
      'font-weight: bold; color: blue;',
      'font-weight: normal; color: black;',
      `color: ${statusColor}; font-weight: bold;`
    );
  }
  
  return apiCall;
};

// Track Web Vitals metrics
export const trackWebVitals = (metric) => {
  const { name, value, id } = metric;
  
  if (!metrics.vitals[name]) {
    metrics.vitals[name] = [];
  }
  
  metrics.vitals[name].push({
    value,
    id,
    timestamp: new Date().toISOString()
  });
  
  // Log metrics
  console.log(`[Performance] Web Vital: ${name} - ${value}`);
  
  // Also send to analytics service if available
  if (window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      metric_id: id,
      metric_value: value,
      metric_delta: 0, // Calculate if tracking trends
    });
  }
  
  return { name, value };
};

// Track user interactions
export const trackInteraction = (action, target, timing) => {
  const { startTime, endTime } = timing;
  const responseTime = endTime - startTime;
  
  // Initialize category if not exists
  if (!metrics.interactions[action]) {
    metrics.interactions[action] = {
      count: 0,
      totalTime: 0,
      targets: {}
    };
  }
  
  // Update metrics
  metrics.interactions[action].count++;
  metrics.interactions[action].totalTime += responseTime;
  
  // Track by target
  if (!metrics.interactions[action].targets[target]) {
    metrics.interactions[action].targets[target] = {
      count: 0,
      totalTime: 0
    };
  }
  
  metrics.interactions[action].targets[target].count++;
  metrics.interactions[action].targets[target].totalTime += responseTime;
  
  // Log metrics
  console.log(`[Performance] Interaction: ${action} on ${target} - ${responseTime}ms`);
  
  return {
    action,
    target,
    responseTime
  };
};

// Track frontend errors
export const trackError = (error, context) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    message: error.message || 'Unknown error',
    stack: error.stack,
    context
  };
  
  metrics.errors.push(errorData);
  
  // Log error
  console.error(`[Performance] Error in ${context}:`, error);
  
  return errorData;
};

// Get all performance metrics
export const getPerformanceMetrics = () => {
  // Calculate averages and other derived metrics
  const pageLoadMetrics = Object.entries(metrics.pageLoads).map(
    ([route, data]) => ({
      route,
      visits: data.visits,
      avgLoadTime: data.visits > 0 ? Math.round(data.totalLoadTime / data.visits) : 0,
      minLoadTime: data.minLoadTime === Number.MAX_SAFE_INTEGER ? 0 : data.minLoadTime,
      maxLoadTime: data.maxLoadTime,
      redirects: data.redirects
    })
  );
  
  const apiMetrics = {
    totalCalls: metrics.apiCalls.length,
    avgDuration: metrics.apiCalls.length > 0 
      ? Math.round(metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0) / metrics.apiCalls.length) 
      : 0,
    errorRate: metrics.apiCalls.length > 0
      ? metrics.apiCalls.filter(call => call.status >= 400).length / metrics.apiCalls.length
      : 0,
    slowestCalls: [...metrics.apiCalls]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
  };
  
  return {
    timestamp: new Date().toISOString(),
    pageLoads: pageLoadMetrics,
    api: apiMetrics,
    webVitals: metrics.vitals,
    interactions: metrics.interactions,
    errors: metrics.errors.slice(0, 10) // Only return the most recent errors
  };
};

// Create enhanced fetch function with performance tracking
export const createTrackedFetch = (originalFetch) => {
  return async (url, options = {}) => {
    const startTime = performance.now();
    let status = 0;
    let error = null;
    
    try {
      const response = await originalFetch(url, options);
      status = response.status;
      
      // Clone response to avoid consuming the body
      const clonedResponse = response.clone();
      
      // Track API call
      trackApiCall(
        url, 
        options.method || 'GET',
        { startTime, endTime: performance.now() },
        status
      );
      
      return clonedResponse;
    } catch (e) {
      error = e.message;
      
      // Track failed API call
      trackApiCall(
        url,
        options.method || 'GET',
        { startTime, endTime: performance.now() },
        0,
        error
      );
      
      throw e;
    }
  };
}; 