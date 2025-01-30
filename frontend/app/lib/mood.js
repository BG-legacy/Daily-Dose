import { apiClient } from './api';

// Set API base URL based on environment
const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

/** @todo create helper functions to set mood
 */

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
    console.log('Token from sessionStorage:', token); // Debug log
    
    // Verify authentication status
    if (!token) {
      console.error('No token found in sessionStorage');
      throw new Error('Not authenticated');
    }

    // Fetch weekly mood data with authentication
    const response = await apiClient.request('/api/mood/summary/weekly', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    // Handle any errors during the fetch operation
    console.error('Failed to fetch weekly mood summary:', error);
    return null; // Return null if request fails
  }
}
