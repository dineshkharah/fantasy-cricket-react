import React from "react";

const LeaderboardPreview = () => {
    const topUsers = [
        { name: "Rohit Sharma", points: 550 },
        { name: "Riya Patel", points: 525 },
        { name: "Amit Singh", points: 510 },
        { name: "Tina Roy", points: 495 },
        { name: "You", points: 395.5 },
    ];

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Leaderboard (Top 5)</h2>
            <ol className="list-decimal pl-5 text-sm text-gray-200 space-y-1">
                {topUsers.map((user, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{user.name}</span>
                        <span className="font-semibold text-blue-400">{user.points}</span>
                    </li>
                ))}
            </ol>
        </div>

    );
};

export default LeaderboardPreview;
