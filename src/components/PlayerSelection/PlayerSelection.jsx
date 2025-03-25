import React, { useState, useEffect } from "react";
import PlayerCard from "./PlayerCard";
import PlayerFilters from "./PlayerFilters";

const teamMapping = {
    "CSK": "Chennai Super Kings",
    "MI": "Mumbai Indians",
    "RCB": "Royal Challengers Bengaluru",
    "KKR": "Kolkata Knight Riders",
    "SRH": "Sunrisers Hyderabad",
    "DC": "Delhi Capitals",
    "RR": "Rajasthan Royals",
    "PBKS": "Punjab Kings",
    "LSG": "Lucknow Super Giants",
    "GT": "Gujarat Titans",
};

const PlayerSelection = ({ onPlayerSelect, selectedPlayers }) => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedTempPlayers, setSelectedTempPlayers] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Fetch players from backend
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/players`);
                const data = await response.json();
                setPlayers(data);
                setFilteredPlayers(data);
            } catch (error) {
                console.error("Error fetching players:", error);
            }
        };

        fetchPlayers();
    }, []);

    // Apply filters dynamically
    useEffect(() => {
        let updatedPlayers = players;

        if (searchQuery) {
            updatedPlayers = updatedPlayers.filter(player =>
                player.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        if (selectedTeam) {
            const fullTeamName = teamMapping[selectedTeam]; // Convert short form to full form
            updatedPlayers = updatedPlayers.filter(player => player.team === fullTeamName);
        }
        if (selectedRole) {
            updatedPlayers = updatedPlayers.filter(player => player.role === selectedRole);
        }

        setFilteredPlayers(updatedPlayers);
    }, [searchQuery, selectedTeam, selectedRole, players]);

    // Handle temporary player selection
    const handleTempSelect = (player) => {
        if (selectedTempPlayers.some(p => p.playerID === player.playerID)) {
            // Remove from temp selection
            setSelectedTempPlayers(selectedTempPlayers.filter(p => p.playerID !== player.playerID));
        } else if (selectedTempPlayers.length < 15) {
            // Add to temp selection (limit 15)
            setSelectedTempPlayers([...selectedTempPlayers, player]);
        }
    };

    // Handle adding to final team
    const handleConfirmSelection = () => {
        console.log("Confirming Selection:", selectedTempPlayers);

        const updatedPlayers = [...selectedPlayers, ...selectedTempPlayers].filter(
            (player, index, self) =>
                index === self.findIndex((p) => p.playerID === player.playerID)
        );

        onPlayerSelect(updatedPlayers);
        setSelectedTempPlayers([]);
        setShowConfirmModal(false);
    };

    return (
        <div className="flex flex-col w-full p-4 rounded-lg shadow-md overflow-auto">
            {/* Filters */}
            <PlayerFilters
                setSearchQuery={setSearchQuery}
                setSelectedTeam={setSelectedTeam}
                setSelectedRole={setSelectedRole}
            />

            {/* Player Cards Container */}
            <div className="flex flex-wrap justify-center gap-3 w-full px-4 overflow-y-auto max-h-[70vh]">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                        <PlayerCard
                            key={player.playerID}
                            player={player}
                            onSelect={() => handleTempSelect(player)}
                            isSelected={selectedTempPlayers.some((p) => p.playerID === player.playerID) || selectedPlayers.some((p) => p.playerID === player.playerID)}
                        />
                    ))
                ) : (
                    <p className="text-gray-400">No players match the filter criteria.</p>
                )}
            </div>

            {/* Add to Team Button */}
            <button
                className={`mt-4 p-2 rounded-md text-white w-full ${selectedTempPlayers.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                onClick={() => setShowConfirmModal(true)}
                disabled={selectedTempPlayers.length === 0}
            >
                {selectedTempPlayers.length > 0 ? `Add ${selectedTempPlayers.length} to Team` : "Select Players"}
            </button>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
                        <p className="mb-4">Confirm adding {selectedTempPlayers.length} players to your team?</p>
                        <div className="flex justify-between">
                            <button className="bg-red-500 px-4 py-2 rounded-md" onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            <button className="bg-green-500 px-4 py-2 rounded-md" onClick={handleConfirmSelection}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerSelection;
