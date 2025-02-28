import { apiClient } from './api';

/**
 * Set user's mood for today
 * @param {('happy' | 'sad' | 'upset')} mood - User inputted mood
 */
export async function setMood({ content }) {
  // Retrieve authentication token from sessionStorage (more secure than localStorage)
  const token = sessionStorage.getItem('token');
  console.log('Token from sessionStorage:', token); // Debug log

  // Ensure user is authenticated before proceeding
  if (!token) {
    console.error('No token found in sessionStorage');
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
    // Retrieve authentication token for API request
    const token = sessionStorage.getItem('token');
    console.log('Fetching weekly mood summary with token:', token); // Debug log

    if (!token) {
      console.error('No token found in sessionStorage');
      throw new Error('Not authenticated');
    }

    // Fetch weekly mood data with authentication
    const response = await apiClient.request('/api/mood/summary/weekly', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Weekly mood response:', response); // Debug log
    return response;  // Return the direct response, not response.data

  } catch (error) {
    console.error('Failed to fetch weekly mood summary:', error);
    return null;
  }
}
