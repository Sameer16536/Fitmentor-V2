import React, { useState, useEffect, useRef } from 'react';
import { APIUtility } from '../services/Api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Divider,
} from '@mui/material';

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
                
                if (videoRef.current) {
                    videoElement = videoRef.current;
                    videoElement.src = response.video_url;
                    await videoElement.play();
                    
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
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default',
            py: 4,
            px: { xs: 2, md: 4 }
        }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    maxWidth: '1200px', 
                    mx: 'auto',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    overflow: 'hidden'
                }}
            >
                <Box sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
                        Exercise Analysis
                    </Typography>
                    <Divider sx={{ mb: 4 }} />

                    {error && (
                        <Box sx={{ 
                            mb: 3, 
                            p: 2, 
                            bgcolor: 'error.dark',
                            borderRadius: 1,
                            color: 'error.contrastText'
                        }}>
                            <Typography>{error}</Typography>
                        </Box>
                    )}

                    {loading ? (
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            minHeight: '300px'
                        }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={4}>
                            {/* Video Display Section */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ 
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'background.default'
                                }}>
                                    <video 
                                        ref={videoRef}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            display: 'block'
                                        }}
                                        controls
                                        playsInline
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <canvas 
                                        ref={canvasRef}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </Box>
                            </Grid>

                            {/* Analysis Results Section */}
                            <Grid item xs={12} md={6}>
                                <Box sx={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 3
                                }}>
                                    {/* Performance Metrics */}
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.default',
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Performance Metrics
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Typography>
                                                Total Reps: {analysis?.total_reps || 0}
                                            </Typography>
                                            <Typography>
                                                Form Accuracy: {analysis?.form_accuracy ? `${(analysis.form_accuracy).toFixed(1)}%` : '0%'}
                                            </Typography>
                                            <Typography>
                                                Overall Feedback: {analysis?.feedback || 'No feedback available'}
                                            </Typography>
                                        </Box>
                                    </Paper>

                                    {/* Form Analysis */}
                                    <Paper sx={{ 
                                        p: 3, 
                                        bgcolor: 'background.default',
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="h6" gutterBottom color="primary">
                                            Form Analysis
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {analysis?.form_details?.map((detail, index) => (
                                                <Box 
                                                    key={index} 
                                                    sx={{ 
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1
                                                    }}
                                                >
                                                    <Box 
                                                        sx={{ 
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            bgcolor: detail.correct ? 'success.main' : 'error.main'
                                                        }} 
                                                    />
                                                    <Typography>
                                                        {detail.message}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Paper>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default VideoAnalysis;