const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
    name: String,
    team: String,
    role: String, //Batsman/Bowler/All-Rounder/Wicket-Keeper
    price: String,
    type: String, // Domestic/International
    status: String, // Sold/Unsold
});

module.exports = mongoose.model("Player", playerSchema);
