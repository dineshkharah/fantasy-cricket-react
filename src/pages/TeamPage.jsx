import React, { useState, useEffect } from "react";
import PlayerSelection from "../components/PlayerSelection/PlayerSelection";
import TeamSelection from "../components/TeamSelection/TeamSelection";

const TeamPage = () => {
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const handleSelectPlayer = (newPlayers) => {
        setSelectedPlayers((prevSelected) => {
            let updatedPlayers = [...prevSelected];

            newPlayers.forEach((player) => {
                const isAlreadySelected = updatedPlayers.some((p) => p._id === player._id);

                if (isAlreadySelected) {
                    // Remove player if they already exist
                    updatedPlayers = updatedPlayers.filter((p) => p._id !== player._id);
                } else if (updatedPlayers.length < 15) {
                    // Add player if limit is not reached
                    updatedPlayers.push(player);
                }
            });

            return updatedPlayers;
        });
    };


    // 🛠 Log updated selectedPlayers when state changes
    useEffect(() => {
        console.log("TeamPage rendered. Current selectedPlayers:", selectedPlayers);
    }, [selectedPlayers]);


    return (
        <div className="flex w-full h-screen gap-4 p-4 overflow-hidden">
            <div className="w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <PlayerSelection onPlayerSelect={handleSelectPlayer} selectedPlayers={selectedPlayers} />
            </div>
            <div className="w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <TeamSelection selectedPlayers={selectedPlayers} />
            </div>
        </div>
    );
};

export default TeamPage;
