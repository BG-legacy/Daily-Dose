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
 * Gets the weekly summary of journal entries
 * @returns {Promise<Array>} Weekly journal entry summary
 */
export async function getWeeklyJournalSummary() {
  // Get auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  return await apiClient.request('/api/journal/summary/weekly', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

/**
 * Creates a new journal entry
 * @param {Object} params - The entry parameters
 * @param {string} params.content - The content of the journal entry
 * @returns {Promise<Object>} The created journal entry
 */
export async function createEntry({ content }) {
  // Get auth token from localStorage on client side only
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  return await apiClient.request('/api/journal/thoughts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ thought: content })
  });
}

/**
 * Get a specific journal entry
 * @param {Object} params - Request parameters
 * @param {string} params.entryID - ID of the journal entry to fetch
 * @returns {Promise<Object>} Journal entry data
 */
export async function getEntry({ entryID }) {
    try {
        // Ensure the entryID is properly encoded in the URL
        const endpoint = `/api/journal/thoughts/${encodeURIComponent(entryID)}`;
        const response = await apiClient.request(endpoint);
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
  // Get auth token from localStorage on client side only
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
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
