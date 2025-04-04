const mongoose = require("mongoose");

const playerPerformanceSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    how_out: { type: mongoose.Schema.Types.Mixed, default: {} },  // Stores dismissal details
    fantasyPoints: { type: Number, default: 0 }
});

const bowlingPerformanceSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    noBall: { type: Number, default: 0 },
    wide: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    fantasyPoints: { type: Number, default: 0 }
});

const inningsSchema = new mongoose.Schema({
    team: { type: String, required: true },
    batting: [playerPerformanceSchema],
    bowling: [bowlingPerformanceSchema]
});

const matchSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },  // Unique Match ID
    series: { type: String, required: true },
    venue: { type: String, required: true },
    dateTime: { type: String, required: true },
    matchSummary: { type: String, required: true },
    innings: [inningsSchema]
}, { timestamps: true });

const Match = mongoose.model("Match", matchSchema);
module.exports = Match;
