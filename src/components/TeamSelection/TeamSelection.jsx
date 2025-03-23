import React, { useState, useEffect } from "react";
import PlayerCard from "../PlayerSelection/PlayerCard";
import axios from "axios";

const TeamSelection = () => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("Token missing. User might not be logged in.");
                    return;
                }

                const res = await axios.get(`http://localhost:5000/api/v1/teams/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTeams(res.data);
                setSelectedTeam(res.data[0] || null); // Select the first team by default
            } catch (error) {
                console.error("Error fetching team data:", error);
            }
        };

        fetchTeamData();
    }, []);

    return (
        <div className="flex flex-col w-full p-4  text-white rounded-lg shadow-md overflow-auto">

            <h2 className="text-lg font-semibold mb-4">Select Your Team</h2>

            {/* Team Selection Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                {teams.map((team) => (
                    <button
                        key={team._id}
                        className={`px-4 py-2 border rounded-md transition ${selectedTeam?._id === team._id ? "bg-blue-500 text-white" : "bg-gray-700"
                            }`}
                        onClick={() => setSelectedTeam(team)}
                    >
                        {team.name}
                    </button>
                ))}
            </div>

            {/* Player Grid (Same Responsive Behavior as PlayerSelection) */}
            <div className="flex flex-wrap justify-center gap-3 w-full px-4 overflow-y-auto max-h-[80vh] ">
                {selectedTeam ? (
                    selectedTeam.players.length > 0 ? (
                        selectedTeam.players.map((player) => (
                            <PlayerCard key={player._id} player={player} />
                        ))
                    ) : (
                        <p className="text-gray-400">No players selected in this team.</p>
                    )
                ) : (
                    <p className="text-gray-400">No teams available.</p>
                )}
            </div>
        </div>
    );
};

export default TeamSelection;
