'use client';

import { useState, useEffect } from 'react';
import { getPerformanceMetrics } from '../../../lib/performance';
import Layout from '../../../components/Layout';
import { useAuth } from '../../contexts/authContext/authIndex';
import Link from 'next/link';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useAuth();
  const [backendMetrics, setBackendMetrics] = useState(null);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  // Fetch frontend metrics
  useEffect(() => {
    setMetrics(getPerformanceMetrics());
    setLoading(false);
  }, [refreshTrigger]);

  // Fetch backend metrics if admin
  useEffect(() => {
    if (user?.email && user.email.endsWith('@daily-dose.me')) {
      setBackendLoading(true);
      setBackendError(null);
      
      const fetchBackendMetrics = async () => {
        try {
          // Use basic auth with admin credentials
          // Note: In production, use a more secure approach
          const password = prompt('Enter metrics password:');
          if (!password) {
            setBackendLoading(false);
            return;
          }
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics`, {
            headers: {
              'Authorization': `Basic ${btoa(`admin:${password}`)}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch metrics: ${response.status}`);
          }
          
          const data = await response.json();
          setBackendMetrics(data);
        } catch (error) {
          console.error('Error fetching backend metrics:', error);
          setBackendError(error.message);
        } finally {
          setBackendLoading(false);
        }
      };
      
      fetchBackendMetrics();
    }
  }, [user, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Layout route="performance">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <button 
            onClick={handleRefresh}
            className="bg-yellow-950 text-white px-4 py-2 rounded-lg"
          >
            Refresh Metrics
          </button>
        </div>

        {loading ? (
          <p>Loading metrics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Page Loads Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Page Load Performance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left border-b">Route</th>
                      <th className="py-2 px-4 text-left border-b">Visits</th>
                      <th className="py-2 px-4 text-left border-b">Avg Load (ms)</th>
                      <th className="py-2 px-4 text-left border-b">Min (ms)</th>
                      <th className="py-2 px-4 text-left border-b">Max (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.pageLoads?.length ? (
                      metrics.pageLoads.map((page, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4 border-b">{page.route}</td>
                          <td className="py-2 px-4 border-b">{page.visits}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={page.avgLoadTime > 1000 ? 'text-red-500' : 'text-green-500'}>
                              {page.avgLoadTime}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">{page.minLoadTime}</td>
                          <td className="py-2 px-4 border-b">{page.maxLoadTime}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 text-center">No page load data available yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* API Calls Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">API Performance</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total API Calls</p>
                  <p className="text-2xl font-bold">{metrics?.api?.totalCalls || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold">{metrics?.api?.avgDuration || 0} ms</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Error Rate</p>
                  <p className="text-2xl font-bold">
                    {((metrics?.api?.errorRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">Slowest API Calls</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left border-b">Endpoint</th>
                      <th className="py-2 px-4 text-left border-b">Method</th>
                      <th className="py-2 px-4 text-left border-b">Duration (ms)</th>
                      <th className="py-2 px-4 text-left border-b">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics?.api?.slowestCalls?.length ? (
                      metrics.api.slowestCalls.map((call, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="py-2 px-4 border-b">{call.endpoint}</td>
                          <td className="py-2 px-4 border-b">{call.method}</td>
                          <td className="py-2 px-4 border-b">
                            <span className={call.duration > 500 ? 'text-red-500' : 'text-green-500'}>
                              {call.duration.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b">
                            <span className={call.status >= 400 ? 'text-red-500' : 'text-green-500'}>
                              {call.status || 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center">No API call data available yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Web Vitals Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Web Vitals</h2>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(metrics?.webVitals || {}).length > 0 ? (
                  Object.entries(metrics.webVitals).map(([name, values]) => {
                    const latestValue = values[values.length - 1]?.value;
                    
                    // Determine if the metric is good, needs improvement, or poor
                    let status = 'text-gray-500';
                    if (name === 'CLS') {
                      status = latestValue < 0.1 ? 'text-green-500' : 
                               latestValue < 0.25 ? 'text-yellow-500' : 'text-red-500';
                    } else if (name === 'FID' || name === 'INP') {
                      status = latestValue < 100 ? 'text-green-500' : 
                               latestValue < 300 ? 'text-yellow-500' : 'text-red-500';
                    } else if (name === 'LCP') {
                      status = latestValue < 2500 ? 'text-green-500' : 
                               latestValue < 4000 ? 'text-yellow-500' : 'text-red-500';
                    } else if (name === 'FCP') {
                      status = latestValue < 1800 ? 'text-green-500' : 
                               latestValue < 3000 ? 'text-yellow-500' : 'text-red-500';
                    } else if (name === 'TTFB') {
                      status = latestValue < 800 ? 'text-green-500' : 
                               latestValue < 1800 ? 'text-yellow-500' : 'text-red-500';
                    }
                    
                    return (
                      <div key={name} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">{name}</p>
                          <p className={`text-sm font-medium ${status}`}>
                            {(latestValue || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-2 h-2 w-full bg-gray-200 rounded">
                          <div 
                            className={`h-2 rounded ${status.replace('text', 'bg')}`}
                            style={{ width: `${Math.min(100, (latestValue / (
                              name === 'CLS' ? 0.5 : 
                              name === 'FID' || name === 'INP' ? 500 : 
                              name === 'LCP' ? 5000 : 
                              name === 'FCP' ? 4000 : 
                              name === 'TTFB' ? 3000 : 1000
                            )) * 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-4">No Web Vitals data available yet</p>
                )}
              </div>
            </div>

            {/* Backend Metrics Section - Only for admins */}
            {user?.email && user.email.endsWith('@daily-dose.me') && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Backend Metrics</h2>
                
                {backendLoading ? (
                  <p>Loading backend metrics...</p>
                ) : backendError ? (
                  <div className="text-red-500 mb-4">
                    <p>Error: {backendError}</p>
                  </div>
                ) : backendMetrics ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Uptime</p>
                        <p className="text-xl font-bold">{backendMetrics.uptime} s</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Avg Response Time</p>
                        <p className="text-xl font-bold">{backendMetrics.performance?.averageResponseTime || 0} ms</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="text-xl font-bold">{backendMetrics.requests?.total || 0}</p>
                      </div>
                    </div>
                    
                    {/* API Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">AI API Performance</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">AI Calls</p>
                          <p className="text-xl font-bold">{backendMetrics.aiApi?.calls || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Avg Time</p>
                          <p className="text-xl font-bold">{backendMetrics.aiApi?.averageTime || 0} ms</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Success Rate</p>
                          <p className="text-xl font-bold">{backendMetrics.aiApi?.successRate || 0}%</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Database Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Database Performance</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Operations</p>
                          <p className="text-xl font-bold">{backendMetrics.database?.operations || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Avg Time</p>
                          <p className="text-xl font-bold">{backendMetrics.database?.averageTime || 0} ms</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Memory Usage */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">RSS</p>
                          <p className="text-xl font-bold">{backendMetrics.memory?.rss || 0} MB</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Heap Total</p>
                          <p className="text-xl font-bold">{backendMetrics.memory?.heapTotal || 0} MB</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-500">Heap Used</p>
                          <p className="text-xl font-bold">{backendMetrics.memory?.heapUsed || 0} MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No backend metrics available</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-8">
          <Link
            href="/home"
            className="text-yellow-950 hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </Layout>
  );
} 