const Team = require("../models/TeamModel");

// Create a new team
const createTeam = async (req, res) => {
    try {
        const { teamName, players, userId } = req.body;

        // Validate input
        if (!teamName || !players || !userId) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Check if user already has 3 teams
        const existingTeams = await Team.find({ userId });
        if (existingTeams.length >= 3) {
            return res.status(400).json({ message: "You can create up to 3 teams only." });
        }

        // Check if exactly 15 players are selected
        if (!Array.isArray(players) || players.length !== 15) {
            return res.status(400).json({ message: `Each team must have exactly 15 players. You provided ${players.length}` });
        }

        // Check for at least 6 different IPL teams
        const teamSet = new Set(players.map(player => player.team));
        if (teamSet.size < 6) {
            return res.status(400).json({ message: "Your team must have players from at least 6 different IPL teams." });
        }

        // Check for duplicate players using `playerID`
        const playerIDs = new Set(players.map(player => player.playerID));
        if (playerIDs.size !== players.length) {
            return res.status(400).json({ message: "Duplicate players found in the team." });
        }

        // Save team in database
        const newTeam = new Team({ teamName, players, userId });
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get teams of a user
const getUserTeams = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }

        const teams = await Team.find({ userId });
        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete a team
const deleteTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        if (!teamId) {
            return res.status(400).json({ message: "Team ID is required." });
        }

        const deletedTeam = await Team.findByIdAndDelete(teamId);
        if (!deletedTeam) {
            return res.status(404).json({ message: "Team not found." });
        }

        res.json({ message: "Team deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { createTeam, getUserTeams, deleteTeam };
