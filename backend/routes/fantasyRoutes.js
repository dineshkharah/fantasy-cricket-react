const express = require("express");
const { updateFantasyPointsForMatch, recomputeAllPoints } = require("../controllers/fantasyController");
const verifyToken = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/update/:matchTitle", verifyToken, requireAdmin, updateFantasyPointsForMatch); // admins only

router.post("/recompute", verifyToken, requireAdmin, recomputeAllPoints); // admins only

module.exports = router;
