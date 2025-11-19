import { apiClient } from './api';

/**
 * Helper function to get the auth token from storage
 * @returns {string|null} The authentication token or null if not found
 */
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first, then sessionStorage as fallback
  const localToken = localStorage.getItem('authToken');
  const sessionToken = sessionStorage.getItem('token');
  
  // Return whichever token is available, preferring localStorage
  return localToken || sessionToken || null;
}

/**
 * Set user's mood for today
 * @param {('happy' | 'sad' | 'upset')} mood - User inputted mood
 */
export async function setMood({ content }) {
  // Get auth token with improved fallback mechanism
  const token = getAuthToken();
  console.log('Token retrieved for mood setting:', token ? 'Found' : 'Not found'); // Debug log

  // Ensure user is authenticated before proceeding
  if (!token) {
    console.error('No authentication token found');
    throw new Error('Not authenticated');
  }

  // Make authenticated POST request to store user's mood
  return await apiClient.request('/api/mood', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}` // Include auth token in request header
    },
    body: JSON.stringify({ content }) // Send mood content in request body
  });
}

export async function getWeeklyMoodSummary() {
  try {
    // Get auth token with improved fallback mechanism
    const token = getAuthToken();
    console.log('Fetching weekly mood summary with token:', token ? 'Found' : 'Not found'); // Debug log

    if (!token) {
      console.error('No authentication token found');
      // Return default data so UI doesn't break
      return { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], data: Array(7).fill(null) };
    }

    // Fetch weekly mood data with authentication
    const response = await apiClient.refreshRequest('/api/mood/summary/weekly', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Weekly mood response:', response); // Debug log
    return response;  // Return the direct response, not response.data

  } catch (error) {
    console.error('Failed to fetch weekly mood summary:', error);
    // Return default data so UI doesn't break
    return { labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], data: Array(7).fill(null) };
  }
}
