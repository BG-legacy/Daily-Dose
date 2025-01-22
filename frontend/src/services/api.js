const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

export const api = {
    // Auth endpoints
    auth: {
        register: async (userData) => {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
            return response.json();
        },

        login: async (credentials) => {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials)
            });
            return response.json();
        }
    },

    // Journal endpoints
    journal: {
        add: async (thought) => {
            const response = await fetch(`${API_BASE_URL}/journal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ thought })
            });
            return response.json();
        },

        getAll: async () => {
            const response = await fetch(`${API_BASE_URL}/journal`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.json();
        },

        getOne: async (thoughtId) => {
            const response = await fetch(`${API_BASE_URL}/journal/${thoughtId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.json();
        },

        delete: async (thoughtId) => {
            const response = await fetch(`${API_BASE_URL}/journal/${thoughtId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.json();
        }
    }
}; 