const mongoose = require("mongoose");

const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const { calculatePlayerFantasyPoints } = require("./scoringService"); // Importing the scoring logic

/**
 * Updates fantasy points after a match.
 * @param {String} matchId - The match ID to process.
 */

const updateFantasyPoints = async (matchId) => {
    try {
        // Fetch the match 
        console.log(`Searching for match with title or ID: ${matchId}`);

        const isObjectId = mongoose.Types.ObjectId.isValid(matchId);
        if (!mongoose.Types.ObjectId.isValid(matchId)) {
            console.log(`Invalid Match ID: ${matchId}`);
            return;
        }

        const match = await Match.findById(matchId);


        if (!match) {
            return res.status(404).json({ message: `Match '${matchId}' not found in database.` });
        }

        // Check if fantasy points are already updated for this match
        if (match.fantasyPointsProcessed) {
            console.log(`Fantasy points already updated for match ${matchId}`);
            return;
        }
        console.log(`Processing fantasy points for match ${matchId}`);

        // Create a map to store fantasy points for each player
        const playerFantasyPoints = {};

        // Step 1: Process Batting Stats
        for (let inning of match.innings) {
            for (let batting of inning.batting) {
                const playerName = batting.playerName;
                const player = await Player.findOne({ name: new RegExp(`^${playerName}$`, "i") });

                if (!player) continue; // Skip if player is not found in DB

                const playerStats = {
                    runs: batting.runs || 0,
                    ballsFaced: batting.balls || 0,
                    fours: batting.fours || 0,
                    sixes: batting.sixes || 0,
                    strikeRate: batting.strikeRate || 0,
                    dismissed: batting.how_out ? true : false, // Check if player got out
                };

                const isUncapped = player.status === "Uncapped";
                const fantasyPoints = calculatePlayerFantasyPoints(playerStats, false, false, isUncapped);
                console.log(`🟢 Player: ${player.name} - Fantasy Points: ${fantasyPoints}`);

                batting.fantasyPoints = isNaN(fantasyPoints) ? 0 : fantasyPoints;
                playerFantasyPoints[player.playerID] = (playerFantasyPoints[player.playerID] || 0) + fantasyPoints;
            }
        }

        // Step 2: Process Bowling Stats
        for (let inning of match.innings) {
            for (let bowling of inning.bowling) {
                const player = await Player.findOne({
                    name: new RegExp(`^${bowling.playerName}$`, "i"),
                });
                if (!player) continue;

                const playerStats = {
                    wickets: bowling.wickets || 0,
                    lbwBowled: bowling.lbwBowled || 0,
                    dotBalls: bowling.dotBalls || 0,
                    maidenOvers: bowling.maidens || 0,
                    oversBowled: bowling.overs || 0,
                    runsConceded: bowling.runsConceded || 0,
                    economy: bowling.economy || 0,
                };

                const isUncapped = player.status === "Uncapped";
                const fantasyPoints = calculatePlayerFantasyPoints(playerStats, false, false, isUncapped);
                console.log(`🟢 Player: ${player.name} - Fantasy Points: ${fantasyPoints}`);

                bowling.fantasyPoints = fantasyPoints;
                playerFantasyPoints[player.playerID] = (playerFantasyPoints[player.playerID] || 0) + fantasyPoints;
            }
        }

        // Step 3: Update Fantasy Points for Players in the Database
        for (const [playerId, points] of Object.entries(playerFantasyPoints)) {
            await Player.findOneAndUpdate(
                { playerID: playerId },
                { $inc: { fantasyPoints: points } },
                { new: true }
            );
        }

        await match.save(); // Save updated match

        // Step 4: Update Fantasy Points for Teams (Only for Teams Created Before Match)
        const teams = await Team.find({ createdAt: { $lte: match.createdAt } });
        console.log(`Teams found before match: ${teams.length}`);

        for (let team of teams) {
            let totalTeamPoints = 0;

            for (let teamPlayer of team.players) {
                const player = await Player.findOne({ playerID: teamPlayer.playerID });
                if (!player) continue;

                let isCaptain = player.playerID === team.captainID;
                let isViceCaptain = player.playerID === team.viceCaptainID;
                let isUncapped = player.status === "Uncapped";

                let playerFantasyPointsValue = playerFantasyPoints[player.playerID] || 0;

                // Apply captain/vice-captain multipliers
                if (isCaptain) playerFantasyPointsValue *= 2;
                if (isViceCaptain) playerFantasyPointsValue *= 1.5;

                totalTeamPoints += playerFantasyPointsValue;
            }

            await Team.findByIdAndUpdate(team._id, { $inc: { totalPoints: totalTeamPoints } }, { new: true });
        }

        // Mark Match as Processed
        await Match.findByIdAndUpdate(match._id, { fantasyPointsProcessed: true }, { new: true });

        console.log(`Fantasy points updated for match ${matchId}`);
    } catch (error) {
        console.error("Error updating fantasy points:", error);
    }
};

module.exports = { updateFantasyPoints };