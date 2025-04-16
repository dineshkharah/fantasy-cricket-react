import React from "react";

const PlayerFilters = ({ setSelectedTeam, setSelectedRole, setSearchQuery }) => {
    const teams = ["MI", "CSK", "RCB", "KKR", "SRH", "DC", "RR", "PBKS", "LSG", "GT"];
    const roles = [
        { label: "Batter", value: "Batter" },
        { label: "Bowler", value: "Bowler" },
        { label: "All-Rounder", value: "allRounder" },
        { label: "Wicket-Keeper", value: "wicketKeeper" },
    ];

    return (
        <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {/* Team Filter */}
            <select
                className="border p-2 rounded-md bg-white text-black"
                onChange={(e) => setSelectedTeam(e.target.value)}
            >
                <option value="">All Teams</option>
                {teams.map((team) => (
                    <option key={team} value={team}>
                        {team}
                    </option>
                ))}
            </select>

            {/* Role Filter */}
            <select
                className="border p-2 rounded-md bg-white text-black"
                onChange={(e) => setSelectedRole(e.target.value)}
            >
                <option value="">All Roles</option>
                {roles.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search player..."
                className="border p-2 rounded-md bg-white text-black"
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
};

export default PlayerFilters;
