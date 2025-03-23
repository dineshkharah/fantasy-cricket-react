import React from "react";

const PlayerFilters = ({ setSelectedTeam, setSelectedRole, setSearchQuery }) => {
    const teams = ["MI", "CSK", "RCB", "KKR", "SRH", "DC", "RR", "PBKS", "LSG", "GT"];
    const roles = ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"];

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
                {roles.map((role) => (
                    <option key={role} value={role}>
                        {role}
                    </option>
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
