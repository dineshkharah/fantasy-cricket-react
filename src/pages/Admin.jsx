import React from "react";
import { useAuth } from "../context/AuthContext";
import UnmatchedNames from "../components/admin/UnmatchedNames";
import RecomputeScores from "../components/admin/RecomputeScores";

const Admin = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 pt-20 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-2xl font-bold text-blue-400">Admin</h1>
                <p className="text-gray-400 mt-1">
                    Signed in as {user?.username} ({user?.role})
                </p>

                <div className="mt-6 space-y-6 pb-12">
                    <UnmatchedNames />
                    <RecomputeScores />
                </div>
            </div>
        </div>
    );
};

export default Admin;
