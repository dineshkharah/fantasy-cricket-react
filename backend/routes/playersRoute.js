const express = require("express");
const router = express.Router();
const Player = require("../models/PlayerModel");

// Get all players
router.get("/", async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({ message: "Error fetching players" });
    }
});


module.exports = router;
