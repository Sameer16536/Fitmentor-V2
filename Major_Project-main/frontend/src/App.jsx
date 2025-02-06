import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Exercise from './components/Exercise';
import Dashboard from './pages/Dashboard';
import VideoUpload from './components/VideoUpload';
import Profile from './pages/Profile';
import VideoAnalysis from './components/VideoAnalysis';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise/:exerciseType/realtime"
              element={
                <ProtectedRoute>
                  <Exercise />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise/:exerciseType/upload"
              element={
                <ProtectedRoute>
                  <VideoUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise/:exerciseId/analysis"
              element={
                <ProtectedRoute>
                  <VideoAnalysis />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;