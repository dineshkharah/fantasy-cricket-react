const express = require("express");
const { updateFantasyPointsForMatch } = require("../controllers/fantasyController");
const verifyToken = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/update/:matchTitle", verifyToken, requireAdmin, updateFantasyPointsForMatch); // admins only

module.exports = router;
