const express = require("express");
const { createTeam, getUserTeams, getTeamById, deleteTeam } = require("../controllers/teamController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createTeam); // Protected: Create team
router.get("/", authMiddleware, getUserTeams); // ✅ Get all teams of the logged-in user
router.get("/:teamId", authMiddleware, getTeamById); // ✅ Get a specific team by ID
router.delete("/:teamId", authMiddleware, deleteTeam); // Protected: Delete team

module.exports = router;
