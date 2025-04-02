
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
import NavBar from './components/Navbar';
import ExercisesList from './pages/ExercisesList';
import Guide from './pages/Guide';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPassword';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

// Protected Route with NavBar Component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem("authToken");
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  return <NavBar>{children}</NavBar>;
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
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
              path="/guide"
              element={
                <ProtectedRoute>
                  <Guide/>
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
            <Route path="/exercises" element={
              <ProtectedRoute>
                <ExercisesList />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;