import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APIUtility } from '../services/Api';
import VideoAnalysis from './VideoAnalysis';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Button,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircleOutline,
  ErrorOutline,
  PlayArrow,
  Delete,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const VideoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { exerciseType } = useParams();
  const navigate = useNavigate();

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError(null);
      setAnalysisId(null);
    } else {
      setError('Please select a valid video file');
      setSelectedFile(null);
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedFile(file);
      setError(null);
      setAnalysisId(null);
    } else {
      setError('Please select a valid video file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !exerciseType) return;

    const allowedExerciseTypes = ['bicep_curls', 'squats', 'lunges', 'planks'];
    if (!allowedExerciseTypes.includes(exerciseType)) {
      setError('Invalid exercise type');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('exercise_type', exerciseType);

    try {
      const uploadResponse = await APIUtility.uploadVideo(exerciseType, formData);
      console.log('Upload successful:', uploadResponse);
      
      if (uploadResponse.id) {
        setIsAnalyzing(true);
        const analysisResponse = await APIUtility.startAnalysis(
          uploadResponse.id,
          formData,
          exerciseType
        );
        
        if (analysisResponse.id) {
          setAnalysisId(analysisResponse.id);
        }
      }
    } catch (err) {
      console.error('Upload/Analysis failed:', err);
      setError(err.response?.data?.error || 'Process failed. Please try again.');
    } finally {
      setUploading(false);
      setIsAnalyzing(false);
    }
  };

  if (analysisId) {
    return <VideoAnalysis exerciseId={analysisId} exerciseType={exerciseType} />;
  }

  return (
    <Box className="min-h-screen bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper 
          elevation={3} 
          className="max-w-xl mx-auto p-8 rounded-xl"
          sx={{ 
            bgcolor: 'background.paper',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography variant="h4" className="text-center mb-6 font-bold">
            Upload Exercise Video
          </Typography>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-4 bg-red-900/30 rounded-lg flex items-center gap-2"
            >
              <ErrorOutline color="error" />
              <Typography color="error">{error}</Typography>
            </motion.div>
          )}

          <Box className="space-y-6">
            <Box 
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              component="label"
              sx={{
                position: 'relative',
                height: '240px',
                border: '2px dashed',
                borderColor: isDragging ? 'primary.main' : 'grey.600',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                bgcolor: isDragging ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(63, 81, 181, 0.08)'
                }
              }}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <motion.div
                animate={{ scale: isDragging ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <CloudUpload 
                  sx={{ 
                    fontSize: 64, 
                    color: isDragging ? 'primary.main' : 'grey.500',
                    mb: 2 
                  }} 
                />
                <Typography variant="h6" gutterBottom color={isDragging ? 'primary' : 'text.primary'}>
                  {isDragging ? 'Drop your video here' : 'Drag and drop your video here'}
                </Typography>
                <Typography color="text.secondary">
                  or click to browse files
                </Typography>
              </motion.div>
            </Box>

            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <Box className="flex items-center gap-3">
                  <PlayArrow color="primary" />
                  <Typography>{selectedFile.name}</Typography>
                </Box>
                <IconButton 
                  onClick={() => setSelectedFile(null)}
                  size="small"
                >
                  <Delete />
                </IconButton>
              </motion.div>
            )}

            {(uploading || isAnalyzing) && (
              <Box className="space-y-2">
                <LinearProgress 
                  variant="determinate" 
                  value={progress}
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4
                    }
                  }}
                />
                <Typography align="center" color="text.secondary">
                  {isAnalyzing ? 'Analyzing video...' : `Uploading: ${progress}%`}
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!selectedFile || uploading || isAnalyzing}
              onClick={handleUpload}
              startIcon={uploading || isAnalyzing ? <CloudUpload /> : <CheckCircleOutline />}
              sx={{ 
                py: 2,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&.Mui-disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.12)'
                }
              }}
            >
              {uploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Upload & Analyze Video'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default VideoUpload;