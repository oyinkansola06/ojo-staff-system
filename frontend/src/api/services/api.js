const API_URL = 'http://localhost:3001/api';

export const api = {
    // Health check
    checkHealth: async () => {
        const response = await fetch(`${API_URL}/health`);
        return response.json();
    },

    // Get all staff
    getStaff: async () => {
        const response = await fetch(`${API_URL}/staff`);
        return response.json();
    },

    // Record attendance
    recordAttendance: async (data) => {
        const response = await fetch(`${API_URL}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};