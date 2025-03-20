const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    team: { type: String, required: true },
    role: { type: String, required: true }, // Batsman/Bowler/All-Rounder/Wicket-Keeper
    price: { type: String, required: true },
    type: { type: String, required: true }, // Domestic/International
    status: { type: String, required: true }, // Sold/Unsold
    playerID: { type: String, unique: true, required: true } // Custom identifier
}, { timestamps: true });

module.exports = mongoose.model("Player", playerSchema);
