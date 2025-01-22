'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/authContext/authIndex';

export default function ProtectedRoute({ children }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !loading && !user) {
      console.log('Protected route: redirecting to login');
      router.replace('/login');
    }
  }, [user, loading, initialized, router]);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
} 