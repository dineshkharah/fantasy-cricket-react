const express = require("express");
const {
    saveMatchStats,
    getMatchById,
    getAllMatches
} = require("../controllers/matchController");
const verifyToken = require("../middlewares/authMiddleware");
const requireAdmin = require("../middlewares/adminMiddleware");

const router = express.Router();

router.post("/save", verifyToken, requireAdmin, saveMatchStats); // admins only

router.get("/:matchTitle", getMatchById);

router.get("/", getAllMatches);

module.exports = router;
