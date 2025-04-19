import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";


const Login = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState(""); // Can be email OR username
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await login(identifier, password);
            alert("Login successful!");
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || "Something went wrong";
            setError(errorMsg);
        }
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700">Email or Username</label>
                        <input
                            type="text"
                            placeholder="Enter your email or username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent p-1"
                            >
                                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
                    >
                        Login
                    </button>
                </form>

                {error && <p className="text-red-500 mt-3 text-center">{error}</p>}

                <p className="mt-4 text-center">
                    Don't have an account?{" "}
                    <a href="/signup" className="text-blue-500 hover:underline">
                        Sign Up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
