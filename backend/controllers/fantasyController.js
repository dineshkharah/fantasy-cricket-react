const { updateFantasyPoints } = require("../services/fantasyPointsUpdater");

const updateFantasyPointsForMatch = async (req, res) => {
    try {
        const { matchTitle } = req.params;

        if (!matchTitle) {
            return res.status(400).json({ message: "Match title is required" });
        }

        await updateFantasyPoints(matchTitle);
        return res.status(200).json({ message: `Fantasy points updated for match ${matchTitle}` });
    } catch (error) {
        console.error("Error updating fantasy points:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { updateFantasyPointsForMatch };
