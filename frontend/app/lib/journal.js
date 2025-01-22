import { apiClient } from './api';

const db =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.DB_URL;

const sampleSummary = [true, false, true, false, true, true, true];

export async function getWeeklyJournalSummary() {
  return await apiClient.request('/api/journal/summary/weekly');
}

export async function createEntry({ content }) {
  return await apiClient.request('/api/journal/thoughts', {
    method: 'POST',
    body: JSON.stringify({ content })
  });
}

export async function getEntry({ entryID }) {
  return await apiClient.request(`/api/journal/thoughts/${entryID}`);
}

export async function getAllJournalEntries() {
  return await apiClient.request('/api/journal/history');
}
