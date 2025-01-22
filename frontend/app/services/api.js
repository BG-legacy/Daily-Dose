const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011';

export const api = {
    // Journal endpoints
    async createJournalEntry(data) {
        const response = await fetch(`${API_BASE_URL}/journal/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Mood endpoints
    async recordMood(mood) {
        const response = await fetch(`${API_BASE_URL}/mood/inputMood`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ mood })
        });
        return response.json();
    },

    async getMoodChart(period = 7) {
        const response = await fetch(`${API_BASE_URL}/mood/view-mood-chart?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    }
}; 