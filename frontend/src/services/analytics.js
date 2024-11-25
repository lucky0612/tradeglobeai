import api from './api';

export const analyticsService = {
    getDashboardMetrics: async (timeframe) => {
        const response = await api.get('/analytics/dashboard', { params: { timeframe } });
        return response.data;
    },

    getProcessingMetrics: async (filters) => {
        const response = await api.get('/analytics/processing', { params: filters });
        return response.data;
    },

    getFinancialMetrics: async (filters) => {
        const response = await api.get('/analytics/financial', { params: filters });
        return response.data;
    },

    getComplianceMetrics: async (filters) => {
        const response = await api.get('/analytics/compliance', { params: filters });
        return response.data;
    },

    exportReport: async (reportType, filters) => {
        const response = await api.get('/analytics/export', {
            params: { reportType, ...filters },
            responseType: 'blob',
        });
        return response.data;
    },
};
