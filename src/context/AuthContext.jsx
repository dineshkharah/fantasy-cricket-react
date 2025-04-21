import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "../utils/axios";

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
            const response = await axios.get("/api/v1/auth/profile", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUser(response.data);
        } catch (error) {
            console.error(error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    // Signup function
    const signup = async ({ fullName, username, email, password, branch, year, division }) => {
        const response = await axios.post("/api/v1/auth/register", {
            fullName,
            username,
            email,
            password,
            branch,
            year,
            division,
        });

        localStorage.setItem("token", response.data.token);
        fetchUserProfile(response.data.token);
    };


    // Login function
    const login = async (identifier, password) => {
        const response = await axios.post("/api/v1/auth/login", {
            identifier,
            password,
        });

        localStorage.setItem("token", response.data.token);
        await fetchUserProfile(response.data.token);
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
