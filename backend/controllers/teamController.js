const Team = require("../models/TeamModel");

// Create a new team
const createTeam = async (req, res) => {
    try {
        console.log("Decoded User from JWT:", req.user); // Debugging

        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }

        const { teamName, players } = req.body;
        const userId = req.user.userId; // ✅ Corrected from `req.user.id`

        if (!teamName || !players) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Check if user already has 3 teams
        const existingTeams = await Team.find({ userId });
        if (existingTeams.length >= 3) {
            return res.status(400).json({ message: "You can create up to 3 teams only." });
        }

        // Validate team constraints
        if (!Array.isArray(players) || players.length !== 15) {
            return res.status(400).json({ message: `Each team must have exactly 15 players. You provided ${players.length}` });
        }

        // Enforce IPL team diversity
        const teamSet = new Set(players.map(player => player.team));
        if (teamSet.size < 6) {
            return res.status(400).json({ message: "Your team must have players from at least 6 different IPL teams." });
        }

        // Prevent duplicate players
        const playerIDs = new Set(players.map(player => player.playerID));
        if (playerIDs.size !== players.length) {
            return res.status(400).json({ message: "Duplicate players found in the team." });
        }

        // Save the new team
        const newTeam = new Team({ teamName, players, userId });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        console.error("Error in createTeam:", error); // Debugging
        res.status(500).json({ message: "Server error", error });
    }
};

// Get all teams of a user 
const getUserTeams = async (req, res) => {
    try {
        const userId = req.user.userId; // Fix `req.user.id` → `req.user.userId`
        const teams = await Team.find({ userId });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get a specific team by teamId 
const getTeamById = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { teamId } = req.params;

        const team = await Team.findOne({ _id: teamId, userId });

        if (!team) {
            return res.status(404).json({ message: "Team not found or unauthorized" });
        }

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete a team
const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.userId;

        const deletedTeam = await Team.findOneAndDelete({ _id: teamId, userId });

        if (!deletedTeam) {
            return res.status(404).json({ message: "Team not found or unauthorized." });
        }

        res.json({ message: "Team deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { createTeam, getUserTeams, getTeamById, deleteTeam };
