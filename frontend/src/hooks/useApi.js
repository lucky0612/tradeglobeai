import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { useAuth } from './useAuth';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
});

export const useApi = () => {
    const { token } = useAuth();
    const queryClient = useQueryClient();

    // Set auth header
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const fetchDocuments = async (filters) => {
        const { data } = await api.get('/documents', { params: filters });
        return data;
    };

    const processDocument = async (formData) => {
        const { data } = await api.post('/documents/process', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    };

    const submitDrawbackClaim = async (claimData) => {
        const { data } = await api.post('/drawback/claims', claimData);
        return data;
    };

    const submitRodtepClaim = async (claimData) => {
        const { data } = await api.post('/rodtep/claims', claimData);
        return data;
    };

    const fetchAnalytics = async (timeframe) => {
        const { data } = await api.get('/analytics/dashboard', {
            params: { timeframe },
        });
        return data;
    };

    return {
        fetchDocuments,
        processDocument,
        submitDrawbackClaim,
        submitRodtepClaim,
        fetchAnalytics,
        api,
    };
};
