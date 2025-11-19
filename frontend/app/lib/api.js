import { createTrackedFetch } from '../../lib/performance';

// Base URL for API calls
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

// Create a performance-tracked fetch function
const trackedFetch = typeof window !== 'undefined' 
  ? createTrackedFetch(window.fetch.bind(window)) 
  : null;

// Use tracked fetch in browser, regular fetch in SSR
const performFetch = async (url, options = {}) => {
  if (typeof window !== 'undefined' && trackedFetch) {
    return trackedFetch(url, options);
  } else {
    return fetch(url, options);
  }
};

// Helper function to get auth token from storage
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first, then sessionStorage as fallback
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('token');
  
  // Return whichever token is available, preferring localStorage
  return localToken || sessionToken || null;
};

/**
 * API Client class for handling all server requests
 * Provides a centralized way to manage API calls with consistent error handling
 */
class ApiClient {
  constructor() {
    // Remove trailing slashes from base URL for consistency
    this.baseUrl = API_URL.replace(/\/+$/, '');
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  // Add method to get auth token
  getAuthToken() {
    return getAuthToken();
  }

  /**
   * Adds cache-busting to a URL
   * @param {string} url - The URL to add cache busting to
   * @returns {string} - URL with cache busting parameter
   */
  addCacheBusting(url) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  /**
   * Makes a request with cache busting enabled
   * @param {string} endpoint - The API endpoint
   * @param {object} options - Request options
   * @returns {Promise<any>} - The response
   */
  async refreshRequest(endpoint, options = {}) {
    const cacheBustedEndpoint = this.addCacheBusting(endpoint);
    const noCacheHeaders = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...options.headers
    };
    
    // If no Authorization header is provided, try to add it
    if (!options.headers?.Authorization) {
      const token = this.getAuthToken();
      if (token) {
        noCacheHeaders['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return this.request(cacheBustedEndpoint, {
      ...options,
      headers: noCacheHeaders
    });
  }

  /**
   * Generic request method that handles all API calls
   * @param {string} endpoint - The API endpoint to call (e.g., '/auth/login')
   * @param {object} options - Fetch options (method, headers, body, etc.)
   * @returns {Promise<any>} - Parsed JSON response
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Try to add authorization if not already present
    if (!options.headers?.Authorization) {
      const token = this.getAuthToken();
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
    
    try {
      console.log(`Making API request to: ${url}`);
      const response = await performFetch(url, {
        ...options,
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-200 responses with custom error messages
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Health check endpoint to verify server status
   * @returns {Promise<boolean>} - True if server is healthy
   */
  async checkServerHealth() {
    try {
      const response = await performFetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Health check error:', error);
      return false;
    }
  }

  /**
   * Initiates Google OAuth sign-in flow
   * Redirects user to Google's authentication page
   */
  async signInWithGoogle() {
    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      window.location.href = `${this.baseUrl}/auth/google?callback=${encodeURIComponent(callbackUrl)}`;
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      throw error;
    }
  }

  /**
   * Traditional email/password login
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<object>} - Response containing user data and token
   */
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  // Get authenticated user session
  async getSession(token) {
    try {
      const response = await performFetch(`${this.baseUrl}/auth/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return await response.json();
    } catch (error) {
      console.error('Session check error:', error);
      throw error;
    }
  }

  // Generic API call function with retry logic
  async call(endpoint, method = 'GET', data = null, headers = {}) {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await performFetch(`${this.baseUrl}${endpoint}`, options);
      
      // Handle unauthorized errors (potentially refresh token here)
      if (response.status === 401) {
        console.warn('Unauthorized API request');
        // Could handle token refresh here in the future
      }
      
      // Try to parse JSON
      try {
        const result = await response.json();
        
        // Add status to result for easier checking
        result._status = response.status;
        
        // Throw for error statuses
        if (!response.ok) {
          throw result;
        }
        
        return result;
      } catch (jsonError) {
        // If not JSON or empty response
        if (!response.ok) {
          throw new Error(`API call failed with status ${response.status}`);
        }
        
        return { _status: response.status, success: response.ok };
      }
    } catch (error) {
      console.error(`API call error (${endpoint}):`, error);
      throw error;
    }
  }
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();

// Test server connection on load
apiClient.checkServerHealth().then(isHealthy => {
  console.log('Server health check:', isHealthy ? 'OK' : 'Failed');
}); 