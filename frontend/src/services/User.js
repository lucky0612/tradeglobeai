import api from './api';

export const userService = {
    getCurrentUser: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/users/profile', profileData);
        return response.data;
    },

    updatePassword: async (passwordData) => {
        const response = await api.put('/users/password', passwordData);
        return response.data;
    },

    updatePreferences: async (preferences) => {
        const response = await api.put('/users/preferences', preferences);
        return response.data;
    },

    getApiKeys: async () => {
        const response = await api.get('/users/api-keys');
        return response.data;
    },

    generateApiKey: async (description) => {
        const response = await api.post('/users/api-keys', { description });
        return response.data;
    },

    revokeApiKey: async (keyId) => {
        const response = await api.delete(`/users/api-keys/${keyId}`);
        return response.data;
    }
};