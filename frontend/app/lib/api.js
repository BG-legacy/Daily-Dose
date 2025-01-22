const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011'; // Match backend port

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/+$/, '');
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async checkServerHealth() {
    try {
      const response = await this.request('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async signInWithGoogle() {
    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      window.location.href = `${this.baseUrl}/auth/google?callback=${encodeURIComponent(callbackUrl)}`;
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// Test connection on load
apiClient.checkServerHealth().then(isHealthy => {
  console.log('Server health check:', isHealthy ? 'OK' : 'Failed');
}); 