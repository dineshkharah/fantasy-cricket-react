require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const connectDB = require("../config/db");
const Player = require("../models/PlayerModel");

console.log("MONGO_URI:", process.env.MONGO_URI);

connectDB();

// Load player data
const filePath = path.join(__dirname, "playerData.json");
const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

// Function to generate `playerID`
const generatePlayerId = (name, team) => {
    return `${name.replace(/\s/g, "")}_${team.replace(/\s/g, "")}`;
};

// Transform JSON keys to match Mongoose schema and add `playerID`
const formattedData = rawData.map(player => ({
    name: player.Name,
    team: player.Team,
    role: player.Role,
    price: player.Price,
    type: player.Nationality,
    status: player.Category,
    playerID: generatePlayerId(player.Name, player.Team) // Store custom ID separately
}));

console.log("First Transformed Player:", formattedData[0]); // Debugging log

const uploadPlayers = async () => {
    try {
        await Player.deleteMany(); // Clears previous data
        await Player.insertMany(formattedData);
        console.log("Player data uploaded successfully!");
    } catch (error) {
        console.error("Error uploading player data:", error);
    } finally {
        mongoose.connection.close();
    }
};

uploadPlayers();
