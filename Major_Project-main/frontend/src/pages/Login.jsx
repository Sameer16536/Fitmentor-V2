import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { APIUtility } from "../services/Api";
import { Google as GoogleIcon } from '@mui/icons-material';
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Divider,
    Alert,
} from '@mui/material';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        const payload = {
            email: formData.email,
            password: formData.password
        };

        try {
            const response = await APIUtility.loginUser(payload);
            if (!response.access) {
                throw new Error("Invalid credentials");
            }

            localStorage.setItem("authToken", response.access);
            localStorage.setItem("refreshToken", response.refresh);

            if (response.user) {
                localStorage.setItem("user", JSON.stringify(response.user));
            }

            navigate("/dashboard");
        } catch (error) {
            console.error("Login error:", error);
            setError(error.response?.data?.error || error.message || "Invalid credentials");
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = "http://localhost:5000/api/auth/google";
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                >
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: 'white', mb: 3 }}>
                        Welcome Back
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSignIn}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mb: 2,
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            Sign In
                        </Button>

                        <Button 
                            fullWidth
                            variant="text"
                            size="small"
                            sx={{ color: 'text.secondary', mb: 2 }}
                            component={Link}
                            to="/forgot-password"
                            onClick={() => setError("")}
                        >
                            Forgot Password?
                        </Button>
                    </form>


                    <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.12)' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            OR
                        </Typography>
                    </Divider>
                    

                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleAuth}
                        sx={{
                            mb: 3,
                            borderColor: 'error.main',
                            color: 'error.main',
                            '&:hover': {
                                borderColor: 'error.dark',
                                bgcolor: 'rgba(211, 47, 47, 0.04)'
                            }
                        }}
                    >
                        Sign In with Google
                    </Button>

                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: '#90caf9', textDecoration: 'none' }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;