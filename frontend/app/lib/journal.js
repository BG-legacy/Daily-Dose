import { apiClient } from './api';

/**
 * Configuration for database URL based on environment
 * @const {string} db - Database URL for the environment
 */
const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

const sampleSummary = [true, false, true, false, true, true, true];

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
 * Gets the weekly summary of journal entries
 * @returns {Promise<Array>} Weekly journal entry summary
 */
export async function getWeeklyJournalSummary() {
  // Get auth token with improved fallback mechanism
  const token = getAuthToken();
  
  if (!token) {
    console.error('No authentication token found for journal summary request');
    return { summary: Array(7).fill(false) }; // Return default empty summary
  }
  
  try {
  // Use the new refreshRequest method for proper cache busting
  return await apiClient.refreshRequest('/api/journal/summary/weekly', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  } catch (error) {
    console.error('Error fetching weekly journal summary:', error);
    // Return fallback data so the UI doesn't break
    return { summary: Array(7).fill(false) };
  }
}

/**
 * Creates a new journal entry
 * @param {Object} params - The entry parameters
 * @param {string} params.content - The content of the journal entry
 * @returns {Promise<Object>} The created journal entry
 */
export async function createEntry({ content }) {
  // Get auth token with improved fallback mechanism
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  console.log('Creating new journal entry with content:', content.substring(0, 50) + '...');
  const response = await apiClient.request('/api/journal/thoughts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ thought: content })
  });
  
  console.log('Journal entry created successfully, refreshing journal summary');
  
  // Update journal summary data to refresh streak - use refreshRequest to bypass cache
  try {
    const summaryResponse = await apiClient.refreshRequest('/api/journal/summary/weekly', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Journal summary refreshed after creating entry:', summaryResponse);
  } catch (error) {
    console.error('Error refreshing journal summary:', error);
  }
  
  return response;
}

/**
 * Get a specific journal entry
 * @param {Object} params - Request parameters
 * @param {string} params.entryID - ID of the journal entry to fetch
 * @returns {Promise<Object>} Journal entry data
 */
export async function getEntry({ entryID }) {
    try {
        // Get auth token with improved fallback mechanism
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Ensure the entryID is properly encoded in the URL
        const endpoint = `/api/journal/thoughts/${encodeURIComponent(entryID)}`;
        const response = await apiClient.request(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        return response;
    } catch (error) {
        console.error('Error fetching journal entry:', error);
        throw error;
    }
}

/**
 * Retrieves all journal entries for the authenticated user
 * @returns {Promise<Array>} Array of journal entries
 */
export async function getAllJournalEntries() {
  // Get auth token with improved fallback mechanism
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  return await apiClient.request('/api/journal/history', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

/**
 * Deletes a specific journal entry
 * @param {Object} params - The entry parameters
 * @param {string} params.entryID - The ID of the journal entry to delete
 * @returns {Promise<Object>} Result of the deletion operation
 */
export async function deleteEntry({ entryID }) {
  // Get auth token with improved fallback mechanism
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  return await apiClient.request(`/api/journal/thoughts/${entryID}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
