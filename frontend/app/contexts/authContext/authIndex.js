'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

const AuthContext = createContext({ user: null });

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        console.log('Checking session with token:', token ? 'exists' : 'none');
        
        if (token) {
          try {
            const response = await apiClient.request('/auth/session', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('Session check response:', response);
            
            if (response.authenticated && response.user) {
              setUser(response.user);
            } else {
              console.log('Session not authenticated or no user data');
              localStorage.removeItem('authToken');
              setUser(null);
            }
          } catch (apiError) {
            console.error('API request failed:', apiError.message);
            if (apiError.message.includes('redirect_uri_mismatch')) {
              console.error('OAuth redirect URI mismatch detected');
              localStorage.removeItem('authToken');
              setUser(null);
            }
            throw apiError;
          }
        } else {
          console.log('No auth token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    checkSession();
  }, []);

  const login = async (userData, token) => {
    console.log('Login called with:', { userData, token });
    try {
      if (!userData || !token) {
        throw new Error('Invalid login data');
      }

      // Store token first
      localStorage.setItem('authToken', token);
      
      // Verify the session immediately
      const response = await apiClient.request('/auth/session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.authenticated) {
        console.log('Setting user after verification:', userData);
        setUser(userData);
        return true;
      } else {
        throw new Error('Session verification failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    initialized
  };

  console.log('Auth context state:', { user, loading, initialized });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
