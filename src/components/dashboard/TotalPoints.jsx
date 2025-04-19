import React from "react";

const TotalPoints = ({ points }) => {
    if (points === undefined) return null;

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4 text-center">
            <h2 className="text-lg font-semibold text-blue-300">Total Points</h2>
            <p className="text-3xl font-bold text-green-400 mt-2">{points}</p>
        </div>
    );
};

export default TotalPoints;