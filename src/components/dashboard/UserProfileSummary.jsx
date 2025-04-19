import React from "react";

const UserProfileSummary = ({ user }) => {
    if (!user) return null;

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4 text-sm text-gray-200">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Profile Summary</h2>
            <p><strong>Name:</strong> {user.fullName}</p>
            <p><strong>Year:</strong> {user.year}</p>
            <p><strong>Branch:</strong> {user.branch}</p>
            <p><strong>Class:</strong> {user.division}</p>
        </div>
    );
};

export default UserProfileSummary;