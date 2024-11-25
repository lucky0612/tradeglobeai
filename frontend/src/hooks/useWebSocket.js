import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { websocketService } from '../services/websocket';

export const useWebSocket = () => {
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            websocketService.connect(token);
            return () => websocketService.disconnect();
        }
    }, [token]);

    const subscribe = useCallback((type, callback) => {
        return websocketService.subscribe(type, callback);
    }, []);

    return { subscribe };
};