const express = require("express");
const {
    saveMatchStats,
    getMatchById,
    getAllMatches
} = require("../controllers/matchController");

const router = express.Router();

router.post("/save", saveMatchStats);

router.get("/:matchTitle", getMatchById);

router.get("/", getAllMatches);

module.exports = router;
