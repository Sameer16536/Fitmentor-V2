import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    Alert,
} from "@mui/material";
import { APIUtility } from "../services/Api";

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState(""); // Add email input for verification
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email || !otp || !password || !confirmPassword) {
            setError("Please fill in all fields.");
        } else if (password !== confirmPassword) {
            setError("Passwords do not match.");
        } else {
            try {
                // Verify OTP
                await APIUtility.verifyResetOTP({ email, otp });

                // Reset password
                await APIUtility.resetPassword({ email, new_password: password });

                setSuccess("Password has been reset successfully.");
                setTimeout(() => {
                    navigate("/login"); // Redirect to login page
                }, 3000); // Redirect after 3 seconds
            } catch (err) {
                setError(err.response?.data?.error || "Failed to reset password.");
            }
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                    }}
                >
                    <Typography
                        variant="h4"
                        component="h1"
                        gutterBottom
                        align="center"
                        sx={{ color: "white", mb: 3 }}
                    >
                        Reset Password
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="OTP"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                bgcolor: "primary.main",
                                "&:hover": { bgcolor: "primary.dark" },
                            }}
                        >
                            Reset Password
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};