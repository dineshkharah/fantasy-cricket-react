import React, { useState } from "react";
import PlayerSelection from "../components/PlayerSelection/PlayerSelection";
import TeamSelection from "../components/TeamSelection/TeamSelection";

const TeamPage = () => {
    // State to manage selected players
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    // Function to handle player selection
    const handleSelectPlayer = (player) => {
        if (selectedPlayers.some((p) => p.id === player.id)) {
            // Remove player if already selected
            setSelectedPlayers(selectedPlayers.filter((p) => p.id !== player.id));
        } else if (selectedPlayers.length < 15) {
            // Add player if not already selected (limit: 15)
            setSelectedPlayers([...selectedPlayers, player]);
        }
    };

    return (
        <div className="flex w-full h-screen gap-4 p-4 overflow-hidden">
            {/* Left: Team Selection */}
            <div className="w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <PlayerSelection onSelectPlayer={handleSelectPlayer} selectedPlayers={selectedPlayers} />
            </div>

            {/* Right: Player Selection */}
            <div className="w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <TeamSelection selectedPlayers={selectedPlayers} />
            </div>
        </div>
    );

};

export default TeamPage;
