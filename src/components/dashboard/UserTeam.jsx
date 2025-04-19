import React from "react";

const UserTeam = ({ team }) => {
    if (!team) return null;

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Your Team - {team.teamName}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
                {team.players.map((player) => (
                    <li key={player.playerID}>
                        {player.name}
                        {player.playerID === team.captainID && " 🧢 (C)"}
                        {player.playerID === team.viceCaptainID && " 🧢 (VC)"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserTeam;