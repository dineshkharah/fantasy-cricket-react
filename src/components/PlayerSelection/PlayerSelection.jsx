import React, { useState, useEffect } from "react";
import PlayerCard from "./PlayerCard";
import PlayerFilters from "./PlayerFilters";
import axios from "../../utils/axios"

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

const PlayerSelection = ({
    onPlayerSelect,
    selectedPlayers,
    canSelectPlayers
}) => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTeam, setSelectedTeam] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedTempPlayers, setSelectedTempPlayers] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedCount, setSelectedCount] = useState(selectedPlayers.length || 0);


    // Load selected players from local storage on initial render
    useEffect(() => {
        const storedSelectedPlayers = localStorage.getItem("selectedPlayers");
        if (storedSelectedPlayers) {
            const parsedPlayers = JSON.parse(storedSelectedPlayers);
            onPlayerSelect(parsedPlayers); // Populate parent state
        }
    }, []);


    // Update selected player count when selected players change
    useEffect(() => {
        setSelectedCount(selectedPlayers.length);
    }, [selectedPlayers]);



    // Fetch players from backend
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await axios.get("/api/v1/players");
                setPlayers(response.data);
                setFilteredPlayers(response.data);
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
            updatedPlayers = updatedPlayers.filter(player => {
                if (selectedRole === "allRounder") {
                    return player.role === "All-rounder";
                } else if (selectedRole === "wicketKeeper") {
                    return (
                        player.role === "Batter/Wicketkeeper" ||
                        player.role === "Wicketkeeper/Batter"
                    );
                } else {
                    return player.role === selectedRole;
                }
            });
        }


        setFilteredPlayers(updatedPlayers);
    }, [searchQuery, selectedTeam, selectedRole, players]);

    // Update selected player count in local storage
    useEffect(() => {
        const interval = setInterval(() => {
            const updated = parseInt(localStorage.getItem("selectedPlayerCount") || "0", 10);
            setSelectedCount(updated);
        }, 500); // check every 500ms

        return () => clearInterval(interval);
    }, []);

    // Handle temporary player selection
    const handleTempSelect = (player) => {
        if (!canSelectPlayers) {
            alert("Click 'Create New Team' to start selecting players.");
            return;
        }

        const isAlreadySelected =
            selectedTempPlayers.some(p => p.playerID === player.playerID) ||
            selectedPlayers.some(p => p.playerID === player.playerID);

        if (isAlreadySelected) {
            setSelectedTempPlayers(prev =>
                prev.filter(p => p.playerID !== player.playerID)
            );
        } else {
            const combinedCount = [...selectedPlayers, ...selectedTempPlayers, player]
                .filter((p, index, self) =>
                    index === self.findIndex(q => q.playerID === p.playerID)
                ).length;

            if (combinedCount > 15) {
                alert("You can only select 15 players in total.");
            } else {
                setSelectedTempPlayers(prev => [...prev, player]);
            }
        }
    };



    // Handle adding to final team
    const handleConfirmSelection = () => {
        const combined = [...selectedPlayers, ...selectedTempPlayers];

        const deduped = combined.filter(
            (player, index, self) =>
                index === self.findIndex((p) => p.playerID === player.playerID)
        );

        if (deduped.length > 15) {
            alert("You can only have a maximum of 15 unique players.");
            return;
        }

        // Only update if within valid limit
        onPlayerSelect(deduped);
        localStorage.setItem("selectedPlayers", JSON.stringify(deduped));
        localStorage.setItem("selectedPlayerCount", deduped.length);
        setSelectedCount(deduped.length);

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
