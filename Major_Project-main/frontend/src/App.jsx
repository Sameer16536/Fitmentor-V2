import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Exercise from './components/Exercise';
import Dashboard from './pages/Dashboard';
import VideoUpload from './components/VideoUpload';



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/dashboard"
            element={
             
                <Dashboard />
              
            }
          />
          <Route
            path="/exercise/:exerciseType/realtime"
            element={
              
                <Exercise />
             
            }
          />
          <Route
            path="/exercise/:exerciseType/upload"
            element={
             
                <VideoUpload />
              
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;