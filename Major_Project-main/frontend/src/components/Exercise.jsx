import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import useWebSocket from '../hooks/useWebSocket';
import { APIUtility } from '../services/Api';
import { toast } from 'react-hot-toast';

const Exercise = () => {
    const { exerciseType } = useParams();
    const webcamRef = useRef(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const lastFrameTimeRef = useRef(0);
    const exerciseStartTimeRef = useRef(null);
    const FPS = 15; // Limit to 15 frames per second
    const frameInterval = 1000 / FPS;
    
    const { isConnected, error, metrics, sendFrame, connect, disconnect, processedImage } = useWebSocket(exerciseType);

    const [exerciseMetrics, setExerciseMetrics] = useState({
        counter: 0,
        form_accuracy: 0,
        stage: null
    });

    // Define calories per rep for each exercise
    const CALORIES_PER_REP = {
        'bicep_curls': 0.3,
        'pushups': 0.5,
        'squats': 0.7,
        'planks': 0.4  // per minute
    };

    // Update metrics when received from WebSocket
    useEffect(() => {
        if (metrics) {
            setExerciseMetrics(metrics);
        }
    }, [metrics]);

    const captureAndSendFrame = useCallback(() => {
        if (!isAnalyzing || !webcamRef.current?.video) return;

        const now = Date.now();
        if (now - lastFrameTimeRef.current < frameInterval) {
            // Skip frame if not enough time has passed
            requestAnimationFrame(captureAndSendFrame);
            return;
        }

        const video = webcamRef.current.video;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = canvas.toDataURL('image/jpeg', 0.8);
            sendFrame(frame);
            lastFrameTimeRef.current = now;
        }
        
        if (isAnalyzing) {
            requestAnimationFrame(captureAndSendFrame);
        }
    }, [isAnalyzing, sendFrame, frameInterval]);

    const handleStopAnalysis = async () => {
        setIsAnalyzing(false);
        
        try {
            if (exerciseMetrics && exerciseStartTimeRef.current) {
                const duration = Math.floor((Date.now() - exerciseStartTimeRef.current) / 1000);
                const reps = exerciseMetrics.counter || 0;
                
                // Calculate calories
                let caloriesBurned;
                if (exerciseType === 'planks') {
                    caloriesBurned = (duration / 60) * CALORIES_PER_REP[exerciseType];
                } else {
                    caloriesBurned = reps * (CALORIES_PER_REP[exerciseType] || 0.3);
                }
                
                const statsPayload = {
                    exercise_type: exerciseType,
                    reps: reps,
                    form_accuracy: exerciseMetrics.form_accuracy || 0,
                    duration: duration,
                    calories_burned: Math.round(caloriesBurned * 100) / 100
                };
                
                console.log('Sending stats payload:', statsPayload);
                
                const response = await APIUtility.updateUserStats(statsPayload);
                console.log('Received response:', response);
                
                if (response.stats) {
                    toast.success(
                        `Exercise completed!\n` +
                        `Reps: ${reps}\n` +
                        `Calories: ${Math.round(caloriesBurned * 100) / 100}\n` +
                        `Total Exercises: ${response.stats.total_exercises}\n` +
                        `Weekly Workouts: ${response.stats.weekly_workouts}\n` +
                        `Monthly Progress: ${response.stats.monthly_progress}%\n` +
                        `Current Streak: ${response.current_streak} days`
                    );
                }
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            toast.error('Failed to update exercise stats');
        } finally {
            // Reset everything
            exerciseStartTimeRef.current = null;
            setStartTime(null);
            setExerciseMetrics({ counter: 0, form_accuracy: 0, stage: null });
        }
    };

    const toggleAnalysis = () => {
        if (!isAnalyzing) {
            const currentTime = Date.now();
            setIsAnalyzing(true);
            setStartTime(currentTime);
            exerciseStartTimeRef.current = currentTime;
        } else {
            handleStopAnalysis();
        }
    };

    // Effect for frame capture
    useEffect(() => {
        if (isAnalyzing) {
            captureAndSendFrame();
        }
    }, [isAnalyzing, captureAndSendFrame]);

    // Effect for WebSocket connection
    useEffect(() => {
        connect(); // Connect when component mounts
        return () => {
            disconnect(); // Disconnect when component unmounts
        };
    }, [connect, disconnect]);

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-2xl font-bold mb-4">{exerciseType} Analysis</h2>
            
            <div className="relative w-full max-w-3xl">
                {/* Original Webcam Feed */}
                <Webcam
                    ref={webcamRef}
                    className="w-full rounded-lg shadow-lg"
                    mirrored={true}
                />
                
                {/* Processed Frame Overlay */}
                {processedImage && (
                    <img 
                        src={processedImage} 
                        alt="Processed" 
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                    />
                )}
            </div>

            <button
                onClick={toggleAnalysis}
                disabled={!isConnected}
                className={`mt-4 px-6 py-2 rounded-full font-semibold ${
                    !isConnected ? 'bg-gray-400' :
                    isAnalyzing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors`}
            >
                {!isConnected ? 'Connecting...' : isAnalyzing ? 'Stop' : 'Start'} Analysis
            </button>

            {/* Metrics Display */}
            {metrics && (
                <div className="mt-6 p-4 bg-white rounded-lg shadow-lg w-full max-w-3xl">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-gray-600">Form Accuracy</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {Math.round(metrics.form_accuracy)}%
                            </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                            <p className="text-gray-600">Reps</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {metrics.counter || 0}
                            </p>
                        </div>
                    </div>
                    {metrics.feedback && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded">
                            <p className="text-gray-700">
                                <span className="font-semibold">Stage: </span>
                                {metrics.stage || 'Not started'}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Feedback: </span>
                                {metrics.feedback}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Exercise;