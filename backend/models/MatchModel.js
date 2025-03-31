const mongoose = require("mongoose");

const playerPerformanceSchema = new mongoose.Schema({
    playerID: { type: String, required: true }, // Unique player identifier
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    economyRate: { type: Number, default: 0 },
    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 }
}, { _id: false });

const matchSchema = new mongoose.Schema({
    matchID: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Upcoming", "Live", "Completed"], required: true },
    playerPerformances: { type: [playerPerformanceSchema], default: [] }
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
