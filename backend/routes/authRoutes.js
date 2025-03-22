const express = require("express");
const { registerUser, loginUser, getUserProfile } = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser); // No token needed
router.post("/login", loginUser); // No token needed
router.get("/profile", verifyToken, getUserProfile); // Protected route

module.exports = router;
