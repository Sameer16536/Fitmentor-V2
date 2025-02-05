import React, { useState } from "react";
import { APIUtility } from "../services/Api";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        height:"",
        weight:"",
        fitness_goal:"weight_loss"
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
            console.log("Signup Response:", response);
    
            if (!response.token) {
                throw new Error("Sign-up failed!");
            }
    
            localStorage.setItem("authToken", response.access);
            navigate("/dashboard");
            // alert("Sign-up successful!");

        } catch (error) {
            console.error("Sign-up error:", error);
            setError(error.response?.data?.error || "Sign-up failed!");
        }

    };
    

    const handleGoogleAuth = () => {
        window.location.href = "http://localhost:5000/api/auth/google"; // Redirect to your backend's Google OAuth endpoint
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
                {error && (
                    <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSignUp}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
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
                    <div className="mb-4">
                        <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                            Height (in meters)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="height"
                            id="height"
                            value={formData.height}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                            Weight (in kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            name="weight"
                            id="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="fitness_goal" className="block text-sm font-medium text-gray-700">
                            Fitness Goal
                        </label>
                        <select
                            name="fitness_goal"
                            id="fitness_goal"
                            value={formData.fitness_goal}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                        >
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="endurance">Endurance</option>
                            <option value="flexibility">Flexibility</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Sign Up
                    </button>
                </form>
                <div className="mt-6">
                    <button
                        onClick={handleGoogleAuth}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                    >
                        Sign Up with Google
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-600 hover:underline">
                        Sign In
                    </a>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;