import React from "react";

const MatchPerformance = () => {
    const recentMatches = [
        {
            match: "Match 12: CSK vs MI",
            points: 110,
            mvp: "David Miller",
        },
        {
            match: "Match 11: RCB vs LSG",
            points: 55,
            mvp: "Nicholas Pooran",
        },
        {
            match: "Match 10: RR vs GT",
            points: 85,
            mvp: "Sanju Samson",
        },
    ];

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Recent Match Performance</h2>
            <ul className="space-y-2 text-sm text-gray-200">
                {recentMatches.map((match, index) => (
                    <li key={index} className="border-b border-gray-700 pb-2">
                        <div className="font-medium">{match.match}</div>
                        <div className="text-gray-400">
                            Points: <span className="font-semibold text-white">{match.points}</span> | MVP:{" "}
                            <span className="font-semibold text-white">{match.mvp}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default MatchPerformance;
