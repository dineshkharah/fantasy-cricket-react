import React, { useState } from "react";
import PlayerSelection from "../components/PlayerSelection/PlayerSelection";
// import TeamSelection from "../components/TeamSelection/TeamSelection";

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
        <div className="flex flex-col md:flex-row p-4 gap-6">
            {/* Left: Team Selection */}
            {/* <div className="w-full md:w-1/2 bg-gray-100 p-4 rounded-lg">
                <TeamSelection selectedPlayers={selectedPlayers} />
            </div> */}

            {/* Right: Player Selection */}
            <div className="w-full md:w-1/2 bg-gray-100 p-4 rounded-lg">
                <PlayerSelection onSelectPlayer={handleSelectPlayer} selectedPlayers={selectedPlayers} />
            </div>
        </div>
    );
};

export default TeamPage;
