import React from "react";

const UserTeam = () => {
    const team = {
        name: "Team 3",
        captain: "Virat Kohli",
        viceCaptain: "Kuldeep Yadav",
        players: [
            "Virat Kohli",
            "Kuldeep Yadav",
            "David Miller",
            "Jasprit Bumrah",
            "Rashid Khan",
            "Ruturaj Gaikwad",
        ],
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-4">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Your Team - {team.name}</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
                {team.players.map((player) => (
                    <li key={player}>
                        {player}
                        {player === team.captain && " 🧢 (C)"}
                        {player === team.viceCaptain && " 🧢 (VC)"}
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default UserTeam;
