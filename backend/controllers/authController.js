const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");

// Register User
const registerUser = async (req, res) => {
    try {
        const { fullName, username, email, password, branch, year, division } = req.body;

        // Validate required fields
        if (!fullName || !username || !email || !password || !branch || !year || !division) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if user exists
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            fullName,
            username,
            email,
            password: hashedPassword,
            branch,
            year,
            division,
        });

        await user.save();

        // Generate JWT
        const token = generateToken(user);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = generateToken(user);

        res.json({ message: "User logged in successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
