import api from './api';

export const documentService = {
    upload: async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await api.post('/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    list: async (filters) => {
        const response = await api.get('/documents', { params: filters });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/documents/${id}`);
        return response.data;
    },

    process: async (id) => {
        const response = await api.post(`/documents/${id}/process`);
        return response.data;
    },
};
