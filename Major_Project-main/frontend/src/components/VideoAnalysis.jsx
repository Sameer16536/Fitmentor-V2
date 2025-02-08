import React, { useState, useEffect, useRef } from 'react';
import { APIUtility } from '../services/Api';
import NavBar from './Navbar';

const VideoAnalysis = ({ exerciseId, exerciseType }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        let videoElement = null;

        const fetchAnalysis = async () => {
            try {
                const response = await APIUtility.getVideoAnalysis(exerciseId, exerciseType);
                setAnalysis(response.metrics);
                
                // Load and play the uploaded video
                if (videoRef.current) {
                    videoElement = videoRef.current;
                    videoElement.src = response.video_url;
                    await videoElement.play();
                    
                    // Set up canvas for pose overlay
                    const canvas = canvasRef.current;
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                }
            } catch (err) {
                setError('Failed to load analysis');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalysis();

        return () => {
            if (videoElement) {
                videoElement.pause();
            }
        };
    }, [exerciseId, exerciseType]);

    return (
        <NavBar>
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-6">Exercise Analysis</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Video Display Section */}
                            <div className="relative">
                                <video 
                                    ref={videoRef}
                                    className="w-full rounded-lg"
                                    controls
                                    playsInline
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <canvas 
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                />
                            </div>

                            {/* Analysis Results Section */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
                                    <div className="space-y-2">
                                        <p>Total Reps: {analysis?.total_reps || 0}</p>
                                        <p>Form Accuracy: {analysis?.form_accuracy ? `${(analysis.form_accuracy ).toFixed(1)}%` : '0%'}</p>
                                        <p>Overall Feedback: {analysis?.feedback || 'No feedback available'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-lg font-semibold mb-2">Form Analysis</h3>
                                    <div className="space-y-2">
                                        {analysis?.form_details?.map((detail, index) => (
                                            <div key={index} className="flex items-center">
                                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                                    detail.correct ? 'bg-green-500' : 'bg-red-500'
                                                }`}></span>
                                                <p>{detail.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </NavBar>
    );
};

export default VideoAnalysis;