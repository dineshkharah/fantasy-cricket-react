const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request object
        next();
    } catch (error) {
        // 401, not 403. A token we cannot read means we do not know who this is,
        // which is different from knowing and saying no.
        // The reason is logged, not sent, so it cannot help someone forge one.
        console.error("token check failed:", error.message);
        res.status(401).json({ message: "Unauthorized: invalid token" });
    }
};

module.exports = verifyToken;
