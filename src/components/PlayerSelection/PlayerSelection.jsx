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

    return (
        <div className="flex flex-col items-center w-full min-h-screen overflow-hidden pt-16 pb-4">
            {/* Filters */}
            <PlayerFilters
                setSearchQuery={setSearchQuery}
                setSelectedTeam={setSelectedTeam}
                setSelectedRole={setSelectedRole}
            />

            {/* Player Cards Container */}
            <div className="flex flex-wrap justify-center gap-3 w-full px-4 overflow-y-auto max-h-[80vh]">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                        <PlayerCard
                            key={player.playerID}
                            player={player}
                            onSelect={onPlayerSelect}
                            isSelected={selectedPlayers.includes(player.playerID)}
                        />
                    ))
                ) : (
                    <p className="text-gray-400">No players match the filter criteria.</p>
                )}
            </div>
        </div>
    );
};

export default PlayerSelection;
