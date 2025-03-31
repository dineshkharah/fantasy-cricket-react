const express = require("express");
const {
    fetchMatchStats,
    saveMatchStats,
    getMatchById,
    getAllMatches
} = require("../controllers/matchController");

const router = express.Router();

router.get("/fetch/:matchId", fetchMatchStats);

router.post("/save", saveMatchStats);

//Get match data from the database
router.get("/:matchId", getMatchById);
router.get("/", getAllMatches);

module.exports = router;
