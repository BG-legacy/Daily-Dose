// Base URL for API requests - defaults to localhost in development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011'; // Match backend port

/**
 * API Client class for handling all server requests
 * Provides a centralized way to manage API calls with consistent error handling
 */
class ApiClient {
  constructor() {
    // Remove trailing slashes from base URL for consistency
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  // Add method to get auth token
  getAuthToken() {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
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
    const token = options.headers?.Authorization || `Bearer ${this.getAuthToken()}`;
    
    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
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
      const response = await this.request('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
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
}

// Create a singleton instance of the API client
export const apiClient = new ApiClient();

// Test server connection on load
apiClient.checkServerHealth().then(isHealthy => {
  console.log('Server health check:', isHealthy ? 'OK' : 'Failed');
}); 