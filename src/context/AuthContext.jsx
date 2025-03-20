import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";  // ✅ Corrected import
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

// Create AuthContext
const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Signup function
    const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);

    // Login function
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    // Logout function
    const logout = () => signOut(auth);

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {!loading && children}  {/* ✅ Prevents UI from rendering until auth state is determined */}
        </AuthContext.Provider>
    );
};
