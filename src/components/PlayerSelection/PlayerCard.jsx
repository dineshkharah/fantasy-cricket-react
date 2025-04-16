import React from "react";

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

const PlayerCard = ({ player, onSelect, isSelected, highlight }) => {
    let borderClass = "border-transparent";

    if (highlight === "captain") borderClass = "border-yellow-400";
    else if (highlight === "vice-captain") borderClass = "border-gray-400";
    else if (isSelected) borderClass = "border-green-400";

    return (
        <div
            className={`flex items-center w-[260px] h-[80px] bg-gray-800 text-white p-4 
                rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105
                border-2 ${borderClass}`}
            onClick={() => onSelect(player)}
        >
            <div className="w-12 h-12 flex-shrink-0">
                <img
                    src="/assets/stock-player.png"
                    alt="Player"
                    className="w-full h-full rounded-full border-2 border-green-400"
                />
            </div>
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
