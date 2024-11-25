import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Handle token expiration
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/token', credentials),
    refreshToken: () => api.post('/auth/refresh'),
    logout: () => api.post('/auth/logout'),
};

export const documentsAPI = {
    upload: (formData) => api.post('/documents/upload', formData),
    list: (filters) => api.get('/documents', { params: filters }),
    getDocument: (id) => api.get(`/documents/${id}`),
};

export const drawbackAPI = {
    submitClaim: (data) => api.post('/drawback/claims', data),
    listClaims: (filters) => api.get('/drawback/claims', { params: filters }),
    getClaim: (id) => api.get(`/drawback/claims/${id}`),
};

export const rodtepAPI = {
    submitClaim: (data) => api.post('/rodtep/claims', data),
    listClaims: (filters) => api.get('/rodtep/claims', { params: filters }),
    getClaim: (id) => api.get(`/rodtep/claims/${id}`),
    generateScrip: (id) => api.post(`/rodtep/claims/${id}/generate-scrip`),
};

export const analyticsAPI = {
    getDashboard: (timeframe) => api.get('/analytics/dashboard', { params: { timeframe } }),
    getProcessingMetrics: () => api.get('/analytics/processing-metrics'),
    getFinancialMetrics: () => api.get('/analytics/financial-metrics'),
};

export default api;