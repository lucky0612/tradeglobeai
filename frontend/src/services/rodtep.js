import api from './api';

export const rodtepService = {
    submitClaim: async (claimData) => {
        const response = await api.post('/rodtep/claims', claimData);
        return response.data;
    },

    listClaims: async (filters) => {
        const response = await api.get('/rodtep/claims', { params: filters });
        return response.data;
    },

    getClaimById: async (id) => {
        const response = await api.get(`/rodtep/claims/${id}`);
        return response.data;
    },

    generateScrip: async (id) => {
        const response = await api.post(`/rodtep/claims/${id}/generate-scrip`);
        return response.data;
    },
};
