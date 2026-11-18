const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/jwt");

// Everything a user sends us has to be plain text.
// Without this check a request can send an object instead, and it goes
// straight into the database query as an operator. Sending
// { "identifier": { "$ne": null } } found a real account, and
// { "identifier": { "$regex": "^a" } } let someone read the whole user
// list a letter at a time.
const isText = (value) => typeof value === "string" && value.trim().length > 0;

// A login for a name that does not exist used to come back instantly, while a
// real one waited for bcrypt to check the password. That difference in timing
// answers "does this account exist" on its own. We check the password against
// this throwaway hash when there is no user, so both take about as long.
const noSuchUserHash = bcrypt.hashSync("there is no user with this name", 10);

// Register User
const registerUser = async (req, res) => {
    try {
        const { fullName, username, email, password, branch, year, division } = req.body;

        // Validate required fields. They must be text, not just present,
        // otherwise an object slips through into the query below.
        if (![fullName, username, email, password, branch, year, division].every(isText)) {
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
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Login User
const loginUser = async (req, res) => {
    try {
        const { identifier, password } = req.body; // Accepts email or username

        if (!isText(identifier) || !isText(password)) {
            return res.status(400).json({ message: "Email or username and password are required." });
        }

        // Find user by email or username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        // One answer for both "no such user" and "wrong password".
        // Two different answers told anyone asking whether an account exists,
        // which turns the login into a way of reading the user list.
        const isMatch = await bcrypt.compare(password, user ? user.password : noSuchUserHash);
        if (!user || !isMatch) {
            return res.status(401).json({ message: "Invalid email, username or password" });
        }

        // Generate JWT
        const token = generateToken(user);

        res.json({ message: "User logged in successfully", token });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
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
        console.error("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, getUserProfile };
