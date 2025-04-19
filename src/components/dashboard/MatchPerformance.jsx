import React from "react";

const MatchPerformance = ({ matches }) => {
    if (!matches || matches.length === 0) return null;

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Recent Match Performance</h2>
            <ul className="space-y-2 text-sm text-gray-200">
                {matches.map((m, i) => (
                    <li key={i} className="border-b border-gray-700 pb-2">
                        <div className="font-medium">{m.match}</div>
                        <div className="text-gray-400">
                            MVP: <span className="font-semibold text-white">{m.mvp}</span> | Points: <span className="font-semibold text-white">{m.points}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MatchPerformance;