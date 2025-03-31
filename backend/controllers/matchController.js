const Match = require("../models/MatchModel");

// ✅ Save match stats to the database (Prevents Duplicates)
const saveMatchStats = async (req, res) => {
    try {
        const matchData = req.body; // JSON input from scraper

        // Check if the match already exists based on metadata.title
        const existingMatch = await Match.findOne({ title: matchData.metadata.title });

        if (existingMatch) {
            return res.status(400).json({ message: "Match already exists in the database" });
        }

        // Transform JSON to match the schema
        const newMatch = new Match({
            title: matchData.metadata.title,
            series: matchData.metadata.series,
            venue: matchData.metadata.venue,
            dateTime: matchData.metadata.dateTime,
            matchSummary: matchData.metadata.matchSummary,
            innings: matchData.innings.map(inning => ({
                team: inning.team,
                batting: inning.batting.map(player => ({
                    playerName: player.playerName,
                    runs: parseInt(player.runs) || 0,
                    balls: parseInt(player.balls) || 0,
                    fours: parseInt(player.fours) || 0,
                    sixes: parseInt(player.sixes) || 0,
                    strikeRate: parseFloat(player.strikeRate) || 0,
                    how_out: player.how_out
                })),
                bowling: inning.bowling.map(player => ({
                    playerName: player.playerName,
                    overs: parseFloat(player.overs) || 0,
                    maidens: parseInt(player.maidens) || 0,
                    runsConceded: parseInt(player.runsConceded) || 0,
                    wickets: parseInt(player.wickets) || 0,
                    noBall: parseInt(player.noBall) || 0,
                    wide: parseInt(player.wide) || 0,
                    economy: parseFloat(player.economy) || 0
                }))
            }))
        });

        await newMatch.save();
        res.status(201).json({ message: "Match data saved successfully", newMatch });

    } catch (error) {
        res.status(500).json({ message: "Error saving match data", error });
    }
};

// ✅ Get match by ID (Using title as identifier)
const getMatchById = async (req, res) => {
    try {
        const match = await Match.findOne({ title: req.params.matchTitle });

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

module.exports = { saveMatchStats, getMatchById, getAllMatches };
