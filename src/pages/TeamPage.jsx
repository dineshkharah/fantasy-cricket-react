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
        const uniquePlayers = newPlayers.filter(
            (player, index, self) =>
                index === self.findIndex((p) => p._id === player._id)
        );

        const cappedPlayers = uniquePlayers.slice(0, 15); // Safety cap, in case
        setSelectedPlayers(cappedPlayers);
        setSelectedPlayerCount(cappedPlayers.length);

        localStorage.setItem("selectedPlayers", JSON.stringify(cappedPlayers));
        localStorage.setItem("selectedPlayerCount", cappedPlayers.length.toString());
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
