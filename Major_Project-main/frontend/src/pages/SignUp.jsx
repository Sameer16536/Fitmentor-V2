import React, { useState } from "react";
import { APIUtility } from "../services/Api";
import { useNavigate, Link } from "react-router-dom";
import { Google as GoogleIcon } from '@mui/icons-material';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Divider,
  Alert,
} from '@mui/material';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        height: "",
        weight: "",
        fitness_goal: "weight_loss"
    });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        const payload = {
            username: formData.name,
            email: formData.email,
            password: formData.password,
            height: parseFloat(formData.height),
            weight: parseFloat(formData.weight),
            fitness_goal: formData.fitness_goal
        };

        try {
            const response = await APIUtility.registerUser(payload);
            if (!response.token) {
                throw new Error("Sign-up failed!");
            }
            localStorage.setItem("authToken", response.access);
            navigate("/dashboard");
        } catch (error) {
            console.error("Sign-up error:", error);
            setError(error.response?.data?.error || "Sign-up failed!");
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
                bgcolor: 'background.default',
                py: 3
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
                        Create Account
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSignUp}>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                            variant="outlined"
                        />
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
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Height (in meters)"
                            name="height"
                            type="number"
                            inputProps={{ step: "0.01" }}
                            value={formData.height}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Weight (in kg)"
                            name="weight"
                            type="number"
                            inputProps={{ step: "0.1" }}
                            value={formData.weight}
                            onChange={handleChange}
                            required
                            sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Fitness Goal</InputLabel>
                            <Select
                                name="fitness_goal"
                                value={formData.fitness_goal}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="weight_loss">Weight Loss</MenuItem>
                                <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                                <MenuItem value="endurance">Endurance</MenuItem>
                                <MenuItem value="flexibility">Flexibility</MenuItem>
                            </Select>
                        </FormControl>

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
                            Sign Up
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
                        Sign Up with Google
                    </Button>

                    <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#90caf9', textDecoration: 'none' }}>
                            Sign In
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default SignUpPage;