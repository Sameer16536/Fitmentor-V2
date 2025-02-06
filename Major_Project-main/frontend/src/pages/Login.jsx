import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import { APIUtility } from "../services/Api";


const Login = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };



    const handleSignIn = async (e) => {
        e.preventDefault();
        const payload = {
            email: formData.email,
            password: formData.password
        };
        
        try {
            const response = await APIUtility.loginUser(payload);
            console.log("Login response:", response);

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
            alert(error.response?.data?.error || error.message || "Invalid credentials");
        }
    };


    const handleGoogleAuth = () => {
        window.location.href = "http://localhost:5000/api/auth/google"; 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <form onSubmit={handleSignIn}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Sign In
                    </button>
                </form>
                <div className="mt-6">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                        Sign In with Google
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;