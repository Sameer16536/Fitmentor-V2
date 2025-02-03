import { useState, useEffect, useCallback, useRef } from 'react';

const RECONNECT_TIMEOUT = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

const useWebSocket = (exerciseType) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const wsRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        try {
            if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
                setError('Maximum reconnection attempts reached');
                return;
            }

            // Get the token from localStorage
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            // Create WebSocket connection with token
            wsRef.current = new WebSocket(
                `ws://localhost:8000/ws/exercise/${exerciseType}/?token=${token}`
            );

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                
                // Don't reconnect if it was a normal closure
                if (event.code !== 1000) {
                    reconnectAttemptsRef.current += 1;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        connect();
                    }, RECONNECT_TIMEOUT);
                }
            };

            wsRef.current.onerror = (error) => {
                console.error('WebSocket error:', error);
                setError('Connection error');
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    switch (data.type) {
                        case 'frame_processed':
                            setMetrics(data.metrics);
                            break;
                        case 'error':
                            setError(data.message);
                            break;
                        case 'connection_established':
                            console.log('Connection established with backend');
                            break;
                        default:
                            console.log('Received message:', data);
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };
        } catch (err) {
            setError(err.message);
        }
    }, [exerciseType]);

    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close(1000, 'Normal closure');
        }
        setIsConnected(false);
        reconnectAttemptsRef.current = 0;
    }, []);

    const sendFrame = useCallback((frameData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'frame',
                frame: frameData,
                timestamp: Date.now(),
                exercise_type: exerciseType
            };
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not connected');
        }
    }, [exerciseType]);

    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        error,
        metrics,
        sendFrame,
        reconnect: connect,
        disconnect
    };
};

export default useWebSocket;