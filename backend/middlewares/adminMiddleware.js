const User = require("../models/User");

// Runs after verifyToken, which puts the token contents on req.user.
// Looks the user up fresh each time so a role change takes effect at once,
// instead of waiting for an old token to run out.
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized: no token provided" });
        }

        const user = await User.findById(req.user.userId).select("role");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: user not found" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: admins only" });
        }

        next();
    } catch (error) {
        console.error("requireAdmin failed:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = requireAdmin;
