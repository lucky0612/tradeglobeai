import api from './api';

export const drawbackService = {
    submitClaim: async (claimData) => {
        const response = await api.post('/drawback/claims', claimData);
        return response.data;
    },

    listClaims: async (filters) => {
        const response = await api.get('/drawback/claims', { params: filters });
        return response.data;
    },

    getClaimById: async (id) => {
        const response = await api.get(`/drawback/claims/${id}`);
        return response.data;
    },

    updateClaim: async (id, updateData) => {
        const response = await api.patch(`/drawback/claims/${id}`, updateData);
        return response.data;
    },
};
