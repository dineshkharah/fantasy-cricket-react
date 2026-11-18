import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Only lets admins through.
// Not logged in goes to login, logged in but not an admin goes to the dashboard.
// This only hides the page. The real check is on the server.
const AdminRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

export default AdminRoute;
