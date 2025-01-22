import { apiClient } from './api';

const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

/** @todo create helper functions to set mood
 */

/**
 * Set user's mood for today
 * @param {('happy' | 'sad' | 'upset')} mood - User inputted mood
 * @param {string} userId - User ID
 */
export async function setMood({ content }) {
  return await apiClient.request('/api/mood', {
    method: 'POST',
    body: JSON.stringify({ content })
  });
}

export async function getWeeklyMoodSummary() {
  try {
    const response = await apiClient.request('/api/mood/summary/weekly');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch weekly mood summary:', error);
    return null;
  }
}
