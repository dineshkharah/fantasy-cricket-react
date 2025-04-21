import React, { useState, useEffect } from "react";
import PlayerSelection from "../components/PlayerSelection/PlayerSelection";
import TeamSelection from "../components/TeamSelection/TeamSelection";

const TeamPage = () => {
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [selectedPlayerCount, setSelectedPlayerCount] = useState(0);
    const [canSelectPlayers, setCanSelectPlayers] = useState(false);

    // 🔁 Hydrate from localStorage on first mount
    useEffect(() => {
        const savedPlayers = localStorage.getItem("selectedPlayers");
        if (savedPlayers) {
            const parsedPlayers = JSON.parse(savedPlayers);
            setSelectedPlayers(parsedPlayers);
            setSelectedPlayerCount(parsedPlayers.length);
        }
    }, []);

    // ✅ Update localStorage + count when players are selected
    const handleSelectPlayer = (newPlayers) => {
        setSelectedPlayers((prevSelected) => {
            let updatedPlayers = [...prevSelected];

            newPlayers.forEach((player) => {
                const isAlreadySelected = updatedPlayers.some((p) => p._id === player._id);

                if (isAlreadySelected) {
                    // Remove player
                    updatedPlayers = updatedPlayers.filter((p) => p._id !== player._id);
                } else if (updatedPlayers.length < 15) {
                    // Add player
                    updatedPlayers.push(player);
                }
            });

            // Save to localStorage
            localStorage.setItem("selectedPlayers", JSON.stringify(updatedPlayers));
            localStorage.setItem("selectedPlayerCount", updatedPlayers.length.toString());

            // Update count
            setSelectedPlayerCount(updatedPlayers.length);

            return updatedPlayers;
        });
    };

    // 🔁 Sync count whenever selectedPlayers change
    useEffect(() => {
        setSelectedPlayerCount(selectedPlayers.length);
    }, [selectedPlayers]);

    // 🛠 Debug
    useEffect(() => {
        console.log("TeamPage rendered. Current selectedPlayers:", selectedPlayers);
    }, [selectedPlayers]);

    return (
        <div className="flex flex-col lg:flex-row w-full h-full gap-4 p-4 overflow-hidden pt-16 px-4">
            <div className="w-full lg:w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <PlayerSelection
                    onPlayerSelect={handleSelectPlayer}
                    selectedPlayers={selectedPlayers}
                    canSelectPlayers={canSelectPlayers}
                />
            </div>
            <div className="w-full lg:w-1/2 border border-gray-600 rounded-2xl p-4 flex flex-col overflow-hidden">
                <TeamSelection
                    selectedPlayers={selectedPlayers}
                    setSelectedPlayers={setSelectedPlayers}
                    selectedPlayerCount={selectedPlayerCount}
                    setSelectedPlayerCount={setSelectedPlayerCount}
                    setCanSelectPlayers={setCanSelectPlayers}
                />
            </div>
        </div>
    );

};

export default TeamPage;
