class WebSocketService {
    constructor() {
        this.callbacks = new Map();
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(token) {
        const wsUrl = `${process.env.REACT_APP_WS_URL}/ws?token=${token}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };

        this.socket.onclose = () => {
            this.handleDisconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleMessage(data) {
        if (data.type && this.callbacks.has(data.type)) {
            this.callbacks.get(data.type).forEach(callback => callback(data));
        }
    }

    handleDisconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
    }

    subscribe(type, callback) {
        if (!this.callbacks.has(type)) {
            this.callbacks.set(type, new Set());
        }
        this.callbacks.get(type).add(callback);

        return () => {
            const callbacks = this.callbacks.get(type);
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                this.callbacks.delete(type);
            }
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.callbacks.clear();
        this.reconnectAttempts = 0;
    }
}

export const websocketService = new WebSocketService();
