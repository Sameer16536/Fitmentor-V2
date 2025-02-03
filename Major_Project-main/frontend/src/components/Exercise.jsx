import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import useWebSocket from '../hooks/useWebSocket';

const Exercise = () => {
    const { exerciseType } = useParams();
    const webcamRef = useRef(null);
    const [isActive, setIsActive] = useState(false);
    const frameIntervalRef = useRef(null);

    const {
        isConnected,
        error,
        metrics,
        sendFrame,
        startExercise,
        stopExercise,
        reconnect
    } = useWebSocket(exerciseType);

    const captureFrame = () => {
        if (webcamRef.current && isActive) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Remove the data:image/jpeg;base64, prefix
                const base64Frame = imageSrc.split(',')[1];
                sendFrame(base64Frame);
            }
        }
    };

    useEffect(() => {
        if (isActive && isConnected) {
            startExercise();
            frameIntervalRef.current = setInterval(captureFrame, 100);
        } else {
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
            }
            if (isConnected) {
                stopExercise();
            }
        }

        return () => {
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
            }
        };
    }, [isActive, isConnected, startExercise, stopExercise]);

    // Show connection status
    useEffect(() => {
        if (!isConnected) {
            console.log('Waiting for connection...');
        }
    }, [isConnected]);

    // Handle errors
    useEffect(() => {
        if (error) {
            console.error('WebSocket error:', error);
            // Optionally show error to user
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center p-4">
            {/* Connection Status */}
            {!isConnected && (
                <div className="bg-yellow-100 text-yellow-700 p-3 rounded mb-4">
                    Connecting to exercise service...
                </div>
            )}
            
            {/* Error Display */}
            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                    {error}
                    <button 
                        onClick={reconnect}
                        className="ml-2 underline"
                    >
                        Try Again
                    </button>
                </div>
            )}
            
            <div className="relative">
                <Webcam
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="rounded-lg shadow-lg"
                    width={640}
                    height={480}
                />
                
                {metrics && (
                    <div className="absolute top-4 left-4 bg-black/50 text-white p-4 rounded">
                        <p>Reps: {metrics.counter}</p>
                        <p>Form: {metrics.form_accuracy}%</p>
                        <p>Stage: {metrics.stage}</p>
                        {metrics.form_feedback && (
                            <p>Feedback: {metrics.form_feedback}</p>
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsActive(!isActive)}
                disabled={!isConnected}
                className={`mt-4 px-6 py-2 rounded-full font-semibold ${
                    !isConnected 
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isActive 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-green-500 hover:bg-green-600'
                } text-white transition-colors`}
            >
                {!isConnected 
                    ? 'Connecting...' 
                    : isActive 
                        ? 'Stop Exercise' 
                        : 'Start Exercise'}
            </button>
        </div>
    );
};

export default Exercise;