const express = require("express");
const { updateFantasyPointsForMatch } = require("../controllers/fantasyController");

const router = express.Router();

router.post("/update/:matchTitle", updateFantasyPointsForMatch);

module.exports = router;
