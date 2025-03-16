'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../contexts/authContext/authIndex';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const userStr = searchParams.get('user');

      if (!token || !userStr) {
        console.error('Missing token or user data');
        setError('Authentication failed');
        setTimeout(() => router.replace('/login'), 2000);
        return;
      }

      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        console.log('Processing callback with:', { user, token });
        
        await login(user, token);
        console.log('Login successful, redirecting to home');
        router.replace('/home');
      } catch (error) {
        console.error('Callback error:', error);
        setError(error.message);
        setTimeout(() => router.replace('/login'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, login, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-500">Error: {error}</p>
        <p className="text-sm">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Completing sign in...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <CallbackContent />
    </Suspense>
  );
} 