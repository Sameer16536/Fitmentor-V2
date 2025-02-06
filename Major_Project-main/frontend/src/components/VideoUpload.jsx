import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { APIUtility } from '../services/Api';
import VideoAnalysis from './VideoAnalysis';
import NavBar from '../components/Navbar';

const VideoUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { exerciseType } = useParams();
  const navigate = useNavigate();

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

    // Validate exercise type against allowed types
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
        // First upload the video
        const uploadResponse = await APIUtility.uploadVideo(exerciseType, formData);
        console.log('Upload successful:', uploadResponse);
        
        if (uploadResponse.id) {
            setIsAnalyzing(true);
            
            // Start the analysis
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
    <NavBar>
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Upload Exercise Video</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
          </div>

          {selectedFile && (
            <div className="mb-4 text-sm text-gray-600">
              Selected file: {selectedFile.name}
            </div>
          )}

          {uploading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Uploading: {progress}%
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="mt-4 p-4 bg-blue-50 text-blue-700 rounded-md">
              <div className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing video...
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || isAnalyzing}
            className={`w-full py-2 px-4 rounded-md text-white font-medium
              ${!selectedFile || uploading || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
          >
            {uploading ? 'Uploading...' : isAnalyzing ? 'Analyzing...' : 'Upload & Analyze Video'}
          </button>
        </div>
      </div>
    </NavBar>
  );
};

export default VideoUpload;