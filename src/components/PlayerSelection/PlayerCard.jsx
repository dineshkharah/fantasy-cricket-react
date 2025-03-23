import React from "react";

// Reverse Mapping: Convert full team name to short form
const teamShortForms = {
    "Chennai Super Kings": "CSK",
    "Mumbai Indians": "MI",
    "Royal Challengers Bengaluru": "RCB",
    "Kolkata Knight Riders": "KKR",
    "Sunrisers Hyderabad": "SRH",
    "Delhi Capitals": "DC",
    "Rajasthan Royals": "RR",
    "Punjab Kings": "PBKS",
    "Lucknow Super Giants": "LSG",
    "Gujarat Titans": "GT",
};

const PlayerCard = ({ player, onSelect, isSelected }) => {
    return (
        <div
            className={`flex items-center w-[260px] h-[80px] bg-gray-800 text-white p-4 
            rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105
            ${isSelected ? "border-2 border-green-400" : ""}`}
            onClick={() => onSelect(player)}
        >
            {/* Player Image */}
            <div className="w-12 h-12 flex-shrink-0">
                <img
                    src="/assets/stock-player.png"
                    alt="Player"
                    className="w-full h-full rounded-full border-2 border-green-400"
                />
            </div>

            {/* Player Details */}
            <div className="ml-4 overflow-hidden">
                <h2 className="text-sm font-semibold truncate">{player.name}</h2>
                <p className="text-xs text-gray-400 truncate">
                    {teamShortForms[player.team] || player.team} • {player.role} • {player.status}
                </p>
            </div>
        </div>
    );
};

export default PlayerCard;
