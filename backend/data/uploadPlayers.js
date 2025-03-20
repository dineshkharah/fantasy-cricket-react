const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const connectDB = require("../config/db");
const Player = require("../models/PlayerModel");

connectDB();

// Load player data
const filePath = path.join(__dirname, "playerData.json");
const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Transform JSON keys to match Mongoose schema
const formattedData = rawData.map(player => ({
    name: player.Name,   // Convert "Name" → "name"
    team: player.Team,   // Convert "Team" → "team"
    role: player.Role,   // Convert "Role" → "role"
    price: player.Price, // Convert "Price" → "price"
    type: player.Nationality, // Convert "Nationality" → "type"
    status: player.Category // Convert "Category" → "status"
}));

console.log("First Transformed Player:", formattedData[0]); // Debugging log

const uploadPlayers = async () => {
    try {
        await Player.deleteMany(); // Optional: Clears previous data
        await Player.insertMany(formattedData);
        console.log("Player data uploaded successfully!");
        mongoose.connection.close();
    } catch (error) {
        console.error("Error uploading player data:", error);
    }
};

uploadPlayers();
