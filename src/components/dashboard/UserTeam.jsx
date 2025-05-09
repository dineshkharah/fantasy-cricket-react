import React from "react";

const UserTeam = ({ teams, onDelete }) => {
    if (!teams || teams.length === 0) return null;

    const sortedTeams = [...teams].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Your Teams</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedTeams.map((team, index) => (
                    <div key={team._id} className="bg-gray-800 rounded-xl shadow-md p-4 relative">
                        <button
                            onClick={() => onDelete(team._id)}
                            className="absolute top-2 right-2 text-red-400 hover:text-red-600 text-sm"
                        >
                            🗑️
                        </button>

                        <h3 className="text-md font-semibold text-blue-200 mb-2">
                            Team {index + 1}
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
                            {[...team.players]
                                .sort((a, b) => {
                                    if (a.playerID === team.captainID) return -1;
                                    if (b.playerID === team.captainID) return 1;
                                    if (a.playerID === team.viceCaptainID) return -1;
                                    if (b.playerID === team.viceCaptainID) return 1;
                                    return 0;
                                })
                                .map((player) => (
                                    <li key={player.playerID}>
                                        {player.name}
                                        {player.playerID === team.captainID && " 🧢 (C)"}
                                        {player.playerID === team.viceCaptainID && " 🧢 (VC)"}
                                    </li>
                                ))}

                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default UserTeam;
