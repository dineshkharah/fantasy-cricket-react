const mongoose = require("mongoose");

const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const { calculatePlayerFantasyPoints } = require("./scoringService"); // Importing the scoring logic

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findPlayerByNameAndTeam = async (scrapedName, team) => {
    const cleanName = scrapedName.replace(/\(.*?\)/g, '').trim();
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Step 1: Try full name match
    let regex = new RegExp(`^${escapeRegex(cleanName)}$`, "i");
    let player = await Player.findOne({ name: regex });
    if (player) {
        console.log(`✅ Matched full name: '${cleanName}' => ${player.name}`);
        return player;
    }

    // Step 2: Try last name + team match
    const nameParts = cleanName.split(" ");
    const lastName = nameParts[nameParts.length - 1];
    if (lastName.length > 1) {
        regex = new RegExp(`${escapeRegex(lastName)}$`, "i");
        player = await Player.findOne({
            name: regex,
            team: new RegExp(escapeRegex(team), "i"),
        });
        if (player) {
            console.log(`🔁 Matched by last name '${lastName}' and team '${team}' => ${player.name}`);
            return player;
        }
    }

    // Step 3: Try partial name match + team (for one-word names like "Pant")
    if (nameParts.length === 1) {
        regex = new RegExp(`${escapeRegex(cleanName)}`, "i");
        player = await Player.findOne({
            name: regex,
            team: new RegExp(escapeRegex(team), "i"),
        });
        if (player) {
            console.log(`🔍 Partial name + team match: '${cleanName}' => ${player.name}`);
            return player;
        }
    }

    console.warn(`❌ No match found for scraped name '${scrapedName}' with team '${team}'`);
    return null;
};


const updateFantasyPoints = async (matchId) => {
    try {
        console.log(`Searching for match with title or ID: ${matchId}`);

        const isObjectId = mongoose.Types.ObjectId.isValid(matchId);
        if (!isObjectId) {
            console.log(`Invalid Match ID: ${matchId}`);
            return;
        }

        const match = await Match.findById(matchId);
        const team1 = match.innings?.[0]?.team?.split("Innings")[0]?.trim() || "";
        const team2 = match.innings?.[1]?.team?.split("Innings")[0]?.trim() || "";

        if (!match) {
            return console.log(`Match '${matchId}' not found in database.`);
        }

        if (match.fantasyPointsProcessed) {
            console.log(`Fantasy points already updated for match ${matchId}`);
            return;
        }

        console.log(`Processing fantasy points for match ${matchId}`);
        const playerFantasyPoints = {};

        // Step 1: Process Batting Stats
        for (let inning of match.innings) {
            const battingTeam = inning.team?.split("Innings")[0]?.trim() || "";
            const bowlingTeam = battingTeam === team1 ? team2 : team1;

            const rawTeamName = inning.team || "";
            const teamName = rawTeamName.split("Innings")[0].trim();
            for (let batting of inning.batting) {
                const player = await findPlayerByNameAndTeam(batting.playerName, battingTeam);
                if (!player) continue;

                const playerStats = {
                    runs: batting.runs || 0,
                    ballsFaced: batting.balls || 0,
                    fours: batting.fours || 0,
                    sixes: batting.sixes || 0,
                    strikeRate: batting.strikeRate || 0,
                    dismissed: batting.how_out ? true : false,
                };

                const isUncapped = player.status === "Uncapped";
                const fantasyPoints = calculatePlayerFantasyPoints(playerStats, false, false, isUncapped);

                console.log(
                    ` Batting | Player: ${player.name} | Runs: ${playerStats.runs} | Fours: ${playerStats.fours} | Sixes: ${playerStats.sixes} | ` +
                    `Dismissed: ${playerStats.dismissed} | Fantasy Points: ${fantasyPoints}`
                );

                batting.fantasyPoints = isNaN(fantasyPoints) ? 0 : fantasyPoints;
                playerFantasyPoints[player.playerID] = (playerFantasyPoints[player.playerID] || 0) + fantasyPoints;
            }
        }

        // Step 2: Process Bowling Stats
        for (let inning of match.innings) {
            const battingTeam = inning.team?.split("Innings")[0]?.trim() || "";
            const bowlingTeam = battingTeam === team1 ? team2 : team1;

            const rawTeamName = inning.team || "";
            const teamName = rawTeamName.split("Innings")[0].trim();
            for (let bowling of inning.bowling) {
                const player = await findPlayerByNameAndTeam(bowling.playerName, bowlingTeam);
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

                console.log(
                    ` Bowling | Player: ${player.name} | Wickets: ${playerStats.wickets} | Dot Balls: ${playerStats.dotBalls} | ` +
                    `Maidens: ${playerStats.maidenOvers} | Economy: ${playerStats.economy} | Fantasy Points: ${fantasyPoints}`
                );

                bowling.fantasyPoints = fantasyPoints;
                playerFantasyPoints[player.playerID] = (playerFantasyPoints[player.playerID] || 0) + fantasyPoints;
            }
        }

        // Step 3: Process Fielding Stats
        for (let inning of match.innings) {
            const battingTeam = inning.team?.split("Innings")[0]?.trim() || "";
            const bowlingTeam = battingTeam === team1 ? team2 : team1;

            const rawTeamName = inning.team || "";
            const teamName = rawTeamName.split("Innings")[0].trim();
            for (let batting of inning.batting) {
                if (!batting.how_out) continue;

                if (batting.how_out.c) {
                    const fielder = await findPlayerByNameAndTeam(batting.how_out.c, bowlingTeam);
                    if (fielder) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ catches: 1 }, false, false, fielder.status === "Uncapped");
                        console.log(` Fielding | Player: ${fielder.name} | Caught Out | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[fielder.playerID] = (playerFantasyPoints[fielder.playerID] || 0) + fieldingPoints;
                    }
                }

                if (batting.how_out.st) {
                    const keeper = await findPlayerByNameAndTeam(batting.how_out.st, bowlingTeam);
                    if (keeper) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ stumpings: 1 }, false, false, keeper.status === "Uncapped");
                        console.log(` Fielding | Player: ${keeper.name} | Stumping | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[keeper.playerID] = (playerFantasyPoints[keeper.playerID] || 0) + fieldingPoints;
                    }
                }

                if (batting.how_out["run out"]) {
                    const fielder = await findPlayerByNameAndTeam(batting.how_out["run out"], bowlingTeam);
                    if (fielder) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ runOuts: 1 }, false, false, fielder.status === "Uncapped");
                        console.log(` Fielding | Player: ${fielder.name} | Run Out | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[fielder.playerID] = (playerFantasyPoints[fielder.playerID] || 0) + fieldingPoints;
                    }
                }
            }
        }

        // Step 4: Update Fantasy Points for Players
        for (const [playerId, points] of Object.entries(playerFantasyPoints)) {
            await Player.findOneAndUpdate(
                { playerID: playerId },
                { $inc: { fantasyPoints: points } },
                { new: true }
            );
        }

        await match.save();

        // Step 5: Update Fantasy Points for Teams
        const teams = await Team.find({ createdAt: { $lte: match.createdAt } });
        console.log(`Teams found before match: ${teams.length}`);

        for (let team of teams) {
            if (team.processedMatches && team.processedMatches.includes(match._id)) {
                console.log(`⏭️ Skipping ${team.teamName}, already processed match ${matchId}`);
                continue;
            }

            let totalTeamPoints = 0;

            for (let teamPlayer of team.players) {
                const player = await Player.findOne({ playerID: teamPlayer.playerID });
                if (!player) continue;

                let basePoints = playerFantasyPoints[player.playerID] || 0;

                const isCaptain = team.captainID === player.playerID;
                const isViceCaptain = team.viceCaptainID === player.playerID;
                const isUncapped = player.status === "Uncapped";

                let multiplier = 1;
                let tags = [];

                if (isCaptain) {
                    multiplier = 3;
                    tags.push("Captain");
                } else if (isViceCaptain) {
                    multiplier = 2;
                    tags.push("Vice-Captain");
                } else if (isUncapped) {
                    multiplier = 1.5;
                    tags.push("Uncapped");
                }

                const finalPoints = basePoints * multiplier;
                totalTeamPoints += finalPoints;

                console.log(`🟢 Team: ${team.teamName} | Player: ${player.name} | Base: ${basePoints} | Final: ${finalPoints} ${tags.length ? `| [${tags.join(", ")}]` : ""}`);


            }

            await Team.findByIdAndUpdate(team._id, {
                $inc: { totalPoints: totalTeamPoints },
                $addToSet: { processedMatches: match._id },
                $push: { matchPoints: { matchId: match._id, points: totalTeamPoints } }
            }, { new: true });


            console.log(` Updated Team: ${team.teamName} | Points Added: ${totalTeamPoints}`);
        }

        await Match.findByIdAndUpdate(match._id, { fantasyPointsProcessed: true }, { new: true });
        console.log(` Fantasy points updated for match ${matchId}`);
    } catch (error) {
        console.error(" Error updating fantasy points:", error);
    }
};

module.exports = { updateFantasyPoints };
