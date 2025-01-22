const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

class ApiClient {
  async getJournalHistory() {
    const response = await fetch('/api/journal');
    if (!response.ok) {
      throw new Error('Failed to fetch journal entries');
    }
    return response.json();
  }

  async addJournalEntry(data) {
    const response = await fetch('/api/journal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to add journal entry');
    }
    return response.json();
  }
}

export const apiClient = new ApiClient(); 