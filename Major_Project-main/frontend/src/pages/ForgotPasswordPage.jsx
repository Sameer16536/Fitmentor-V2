import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Please enter a valid email address.");
        } else {
            try {
                const response  =  await APIUtility.sendResetOTP({ email });
                setSuccess("OTP has been sent to your email.");
                console.log("OTP sent response:", response); // Log the response for debugging
                localStorage.setItem("resetEmail", email); // Store email in localStorage
                setTimeout(() => {
                    navigate("/reset-password"); // Redirect to reset password page
                }, 3000); // Redirect after 3 seconds
            } catch (err) {
                setError(err.response?.data?.error || "Failed to send OTP.");
                console.error("Error sending OTP:", err);
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
                        Forgot Password
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
                            Submit
                        </Button>
                    </form>

                    <Typography
                        variant="body2"
                        align="center"
                        sx={{ color: "text.secondary" }}
                    >
                        Remembered your password?{" "}
                        <Link
                            to="/login"
                            style={{ color: "#90caf9", textDecoration: "none" }}
                        >
                            Login
                        </Link>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};