import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { app } from "../firebaseConfig"; // Import Firebase app instance
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

// Sign Up Function
export const signUp = async (email, password, additionalData = {}) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Ensure userCredential is valid before proceeding
        if (!userCredential || !userCredential.user) {
            throw new Error("User signup failed.");
        }

        const user = userCredential.user;
        console.log("User signed up:", user.uid);

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            createdAt: new Date(),
            ...additionalData
        });

        return user;
    } catch (error) {
        console.error("Signup error:", error.message);
        alert(error.message); // Show error in UI
        throw error;
    }
};


// Login Function
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
};

// Logout Function
export const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Logout error:", error.message);
        throw error;
    }
};
