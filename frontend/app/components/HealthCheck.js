'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export default function HealthCheck() {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await apiClient.checkServerHealth();
        setStatus(isHealthy ? '✅ Connected to backend' : '❌ Backend unavailable');
      } catch (error) {
        setError(error.message);
        setStatus('❌ Connection failed');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
      <p className={error ? 'text-red-500' : 'text-green-500'}>{status}</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
} 