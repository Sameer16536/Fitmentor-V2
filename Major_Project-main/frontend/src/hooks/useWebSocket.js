import { useState, useEffect, useCallback, useRef } from 'react';

const RECONNECT_TIMEOUT = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

const useWebSocket = (exerciseType) => {
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const lastProcessedTimeRef = useRef(0);
    const DISPLAY_FPS = 10; // Limit display updates to 10 FPS
    const displayInterval = 1000 / DISPLAY_FPS;
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;
        
        try {
            wsRef.current = new WebSocket(`ws://localhost:8000/ws/exercise/${exerciseType}/`);

            wsRef.current.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
                reconnectAttemptsRef.current = 0;
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log('Received data:', data); // Debug log
                    if (data.type === 'frame_processed') {
                        const now = Date.now();
                        // Update metrics always
                        setMetrics(data.metrics);
                        // But limit processed image updates
                        if (now - lastProcessedTimeRef.current >= displayInterval) {
                            setProcessedImage(data.frame);
                            lastProcessedTimeRef.current = now;
                        }
                    } else if (data.type === 'error') {
                        console.error('Server error:', data.message);
                        setError(data.message);
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('WebSocket disconnected', event.code, event.reason);
                setIsConnected(false);
                setMetrics(null);
                setProcessedImage(null);
            };

        } catch (err) {
            setError(err.message);
        }
    }, [exerciseType, displayInterval]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close(1000, 'Analysis stopped');
            wsRef.current = null;
        }
        setIsConnected(false);
        setMetrics(null);
        setProcessedImage(null);
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const sendFrame = useCallback((frame) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            try {
                wsRef.current.send(JSON.stringify({
                    type: 'frame',
                    frame: frame
                }));
            } catch (err) {
                console.error('Error sending frame:', err);
            }
        }
    }, []);

    return { 
        isConnected, 
        error, 
        metrics, 
        processedImage,
        sendFrame, 
        connect, 
        disconnect 
    };
};

export default useWebSocket;