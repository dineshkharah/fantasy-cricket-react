import React from "react";

const TotalPoints = ({ teams }) => {
    if (!teams || teams.length === 0) return null;

    const pointsArray = teams.map(t => t.totalPoints || 0);

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <h2 className="text-lg font-semibold text-blue-300">Total Points</h2>
            <p className="text-xl font-bold text-green-400 mt-2">{pointsArray.join(" | ")}</p>
        </div>
    );
};

export default TotalPoints;
