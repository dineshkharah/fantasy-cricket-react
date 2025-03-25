import React, { useState, useEffect } from "react";
import PlayerCard from "../PlayerSelection/PlayerCard";
import axios from "axios";

const TeamSelection = ({ selectedPlayers }) => {
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [confirmedPlayers, setConfirmedPlayers] = useState([]);

    // 🛠 Fetch teams from the backend
    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("Token missing. User might not be logged in.");
                    return;
                }

                const res = await axios.get("http://localhost:5000/api/v1/teams/", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setTeams(res.data);

                // ✅ Auto-select the last created team OR default to Team 1
                if (res.data.length > 0) {
                    setSelectedTeam(res.data[res.data.length - 1]); // Always select the latest team
                }
            } catch (error) {
                console.error("Error fetching team data:", error);
            }
        };

        fetchTeamData();
    }, []);

    // ✅ Reset `confirmedPlayers` when switching teams
    useEffect(() => {
        if (selectedTeam) {
            setConfirmedPlayers(selectedTeam.players || []);
        }
    }, [selectedTeam]);

    // ✅ Ensure `selectedPlayers` are added correctly to the **currently selected team**
    useEffect(() => {
        if (!selectedTeam || selectedPlayers.length === 0) return;

        setConfirmedPlayers((prevConfirmed) => {
            const newSelections = selectedPlayers.filter(
                (player) => !prevConfirmed.some((p) => p._id === player._id)
            );

            return [...prevConfirmed, ...newSelections]; // ✅ Merge, avoiding duplicates
        });
    }, [selectedPlayers, selectedTeam]);

    const handleCreateNewTeam = () => {
        if (teams.length >= 3) return; // Restrict to max 3 teams

        // ✅ Create a blank new team in frontend before API call
        const newTeam = {
            _id: `temp-${Date.now()}`, // Temporary ID for rendering
            name: `Team ${teams.length + 1}`,
            players: [],
        };

        setTeams([...teams, newTeam]);
        setSelectedTeam(newTeam);
        setConfirmedPlayers([]); // Reset player selection
    };

    const handleConfirmTeam = async () => {
        if (confirmedPlayers.length !== 15) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/v1/teams/create",
                { teamName: selectedTeam.name, players: confirmedPlayers },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const newTeam = res.data;

            // ✅ Replace temporary team with backend response
            setTeams(teams.map(team => (team._id === selectedTeam._id ? newTeam : team)));
            setSelectedTeam(newTeam);
            setConfirmedPlayers([]); // ✅ Reset after saving
        } catch (error) {
            console.error("Error saving team:", error);
        }
    };

    return (
        <div className="flex flex-col w-full p-4 text-white rounded-lg shadow-md overflow-auto">
            <h2 className="text-lg font-semibold mb-4">Select Your Team</h2>

            {/* ✅ Team Selection Buttons */}
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
                {teams.length < 3 && (
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded-md"
                        onClick={handleCreateNewTeam}
                    >
                        + Create New Team
                    </button>
                )}
            </div>

            {/* ✅ Confirm Team Button */}
            <button
                className={`w-full py-2 my-4 rounded-md text-lg font-bold transition ${confirmedPlayers.length === 15 ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 cursor-not-allowed"
                    }`}
                disabled={confirmedPlayers.length !== 15}
                onClick={handleConfirmTeam}
            >
                Confirm Team
            </button>

            {/* ✅ Player Grid */}
            <div className="flex flex-wrap justify-center gap-3 w-full px-4 overflow-y-auto max-h-[80vh]">
                {selectedTeam ? (
                    confirmedPlayers.length > 0 ? (
                        confirmedPlayers.map((player) => (
                            <PlayerCard key={player._id} player={player} />
                        ))
                    ) : (
                        <p className="text-gray-400">No players in this team.</p>
                    )
                ) : (
                    <p className="text-gray-400">No teams available.</p>
                )}
            </div>
        </div>
    );
};

export default TeamSelection;
