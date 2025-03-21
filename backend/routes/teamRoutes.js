const express = require("express");
const { createTeam, getUserTeams, deleteTeam } = require("../controllers/teamController");

const router = express.Router();

router.post("/create", createTeam); // Create team
router.get("/:userId", getUserTeams); // Get user's teams
router.delete("/:teamId", deleteTeam); // Delete a team

module.exports = router;
