'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';

const AuthContext = createContext({ user: null }); // Initialize context with null user state

export default function AuthProvider({ children }) {
  // Core authentication states
  const [user, setUser] = useState(null);          // Stores the authenticated user data
  const [loading, setLoading] = useState(true);    // Tracks initial session check loading state
  const [initialized, setInitialized] = useState(false); // Indicates if auth system has completed initial check

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Retrieve stored authentication token from localStorage
        const token = localStorage.getItem('authToken');
        console.log('Checking session with token:', token ? 'exists' : 'none');
        
        if (token) {
          try {
            // Verify token validity with backend
            const response = await apiClient.request('/auth/session', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('Session check response:', response);
            
            if (response.authenticated && response.user) {
              setUser(response.user);
              // Store token in sessionStorage for temporary session access
              sessionStorage.setItem('token', token);
            } else {
              console.log('Session not authenticated or no user data');
              localStorage.removeItem('authToken');
              sessionStorage.removeItem('token');
              setUser(null);
            }
          } catch (apiError) {
            console.error('API request failed:', apiError.message);
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('token');
            setUser(null);
            throw apiError;
          }
        } else {
          console.log('No auth token found');
          sessionStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('token');
        setUser(null);
      } finally {
        // Update loading states after session check completes
        setLoading(false);
        setInitialized(true);
      }
    };

    checkSession();
  }, []); // Empty dependency array ensures this only runs once on mount

  const login = async (userData, token) => {
    console.log('Login called with:', { userData, token });
    try {
      // Validate login parameters
      if (!userData || !token) {
        throw new Error('Invalid login data');
      }

      // Store auth tokens in both storage types
      localStorage.setItem('authToken', token);    // Persistent storage
      sessionStorage.setItem('token', token);      // Session-only storage
      
      // Verify the session immediately after login
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
      sessionStorage.removeItem('token');
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('token');
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
