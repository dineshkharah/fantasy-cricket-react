import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on initial render
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    // Fetch user details from backend
    const fetchUserProfile = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/profile`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user profile");
            }

            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error(error);
            logout(); // If token is invalid, log out the user
        } finally {
            setLoading(false);
        }
    };

    // Signup function
    const signup = async ({ fullName, username, email, password, branch, year, division }) => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ fullName, username, email, password, branch, year, division }),
        });

        if (!response.ok) {
            throw new Error("Signup failed");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        fetchUserProfile(data.token);
    };

    // Login function
    const login = async (identifier, password) => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ identifier, password }),
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);

        await fetchUserProfile(data.token); //User profile fetch hone tak wait karega
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
