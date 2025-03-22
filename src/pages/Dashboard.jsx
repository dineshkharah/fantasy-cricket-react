import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Welcome, {user?.email}!</h1>
            <button
                onClick={logout}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
