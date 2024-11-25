import api from './api';

export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markAsRead: async (notificationId) => {
        const response = await api.post(`/notifications/${notificationId}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.post('/notifications/read-all');
        return response.data;
    },

    updatePreferences: async (preferences) => {
        const response = await api.put('/notifications/preferences', preferences);
        return response.data;
    },

    subscribe: (onNotification) => {
        // WebSocket connection for real-time notifications
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URL}/notifications`);

        ws.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            onNotification(notification);
        };

        return () => {
            ws.close();
        };
    },
};