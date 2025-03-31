const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const { calculatePlayerFantasyPoints } = require("./scoringSystem"); // Importing the scoring logic

/**
 * Updates fantasy points after a match.
 * @param {String} matchId - The match ID to process.
 */
const updateFantasyPoints = async (matchId) => {
    try {
        // Fetch the match data
        const match = await Match.findOne({ matchID: matchId });
        if (!match) {
            console.log(`Match ${matchId} not found.`);
            return;
        }

        console.log(`Processing fantasy points for match ${matchId}`);

        // Step 1: Update fantasy points for individual players
        for (let playerPerformance of match.playerPerformances) {
            const { playerID, stats } = playerPerformance;
            const fantasyPoints = calculatePlayerFantasyPoints(stats);

            // Update player's total fantasy points
            await Player.findOneAndUpdate(
                { playerID },
                { $inc: { fantasyPoints } }, // Increment the player's total points
                { new: true }
            );
        }

        // Step 2: Update fantasy points for all teams (only for teams created before this match)
        const teams = await Team.find({ createdAt: { $lt: match.date } });

        for (let team of teams) {
            let totalTeamPoints = 0;

            team.players.forEach(player => {
                const playerPerformance = match.playerPerformances.find(p => p.playerID === player.playerID);
                if (playerPerformance) {
                    totalTeamPoints += calculatePlayerFantasyPoints(playerPerformance.stats);
                }
            });

            // Update the total fantasy points of the team
            await Team.findByIdAndUpdate(team._id, { totalPoints: totalTeamPoints }, { new: true });
        }

        console.log(`Fantasy points updated for match ${matchId}`);
    } catch (error) {
        console.error("Error updating fantasy points:", error);
    }
};

module.exports = { updateFantasyPoints };
