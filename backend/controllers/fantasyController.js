const { updateFantasyPoints } = require("../services/fantasyPointsUpdater");
const { recomputeAllScores } = require("../services/recomputeScores");

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

// Sets every score back to zero and works them all out again.
// Needed after a scorecard name is corrected, because the totals are running
// sums and will not fix themselves.
const recomputeAllPoints = async (req, res) => {
    try {
        const result = await recomputeAllScores();

        if (result.busy) {
            return res.status(409).json({ message: result.message });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Error recomputing fantasy points:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { updateFantasyPointsForMatch, recomputeAllPoints };
