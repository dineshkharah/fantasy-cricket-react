const Match = require("../models/MatchModel");

// ✅ Fetch match stats (from JSON or API)
const fetchMatchStats = async (req, res) => {
    try {
        const matchId = req.params.matchId;

        // TODO: Replace with API call or use JSON for testing
        const matchData = {}; // Load from API or JSON

        res.json(matchData);
    } catch (error) {
        res.status(500).json({ message: "Error fetching match stats", error });
    }
};

// ✅ Save match stats to the database
const saveMatchStats = async (req, res) => {
    try {
        const matchData = req.body; // JSON input for testing

        const newMatch = new Match(matchData);
        await newMatch.save();

        res.status(201).json({ message: "Match data saved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving match data", error });
    }
};

// ✅ Get match by ID
const getMatchById = async (req, res) => {
    try {
        const match = await Match.findOne({ matchID: req.params.matchId });

        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }

        res.json(match);
    } catch (error) {
        res.status(500).json({ message: "Error fetching match", error });
    }
};

// ✅ Get all matches
const getAllMatches = async (req, res) => {
    try {
        const matches = await Match.find();
        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: "Error fetching matches", error });
    }
};

module.exports = { fetchMatchStats, saveMatchStats, getMatchById, getAllMatches };
