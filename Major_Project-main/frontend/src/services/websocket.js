class WebSocketService {
    constructor(exerciseType) {
        this.ws = null;
        this.exerciseType = exerciseType;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = 1000; // Start with 1 second
        this.messageCallbacks = new Map();
        this.isConnected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`ws://localhost:8000/ws/exercise/${this.exerciseType}/`);
                
                this.ws.onopen = () => {
                    console.log('Connected to exercise analysis service');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve(this.ws);
                };

                this.ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    this.isConnected = false;
                    this.handleReconnect();
                };

                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

            } catch (error) {
                console.error('Error creating WebSocket connection:', error);
                reject(error);
            }
        });
    }

    handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect()
                    .catch(error => {
                        console.error('Reconnection failed:', error);
                    });
            }, this.reconnectTimeout * this.reconnectAttempts);
        } else {
            console.error('Max reconnection attempts reached');
            this.triggerCallback('error', { 
                message: 'Connection lost. Please refresh the page.' 
            });
        }
    }

    on(eventType, callback) {
        this.messageCallbacks.set(eventType, callback);
    }

    handleMessage(data) {
        const callback = this.messageCallbacks.get(data.type);
        if (callback) {
            callback(data);
        }
    }

    startExercise() {
        if (this.isConnected) {
            this.ws.send(JSON.stringify({ type: 'start_exercise' }));
        } else {
            console.error('WebSocket not connected');
        }
    }

    sendFrame(frameData) {
        if (this.isConnected) {
            const message = {
                type: 'frame',
                frame: frameData,
                timestamp: Date.now(),
                exerciseType: this.exerciseType
            };
            this.ws.send(JSON.stringify(message));
        }
    }

    stopExercise() {
        if (this.isConnected) {
            this.ws.send(JSON.stringify({ type: 'stop_exercise' }));
        }
    }

    disconnect() {
        if (this.ws) {
            this.isConnected = false;
            this.ws.close();
        }
    }
}

export default WebSocketService;