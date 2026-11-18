const mongoose = require("mongoose");

const Match = require("../models/MatchModel");
const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const { calculatePlayerFantasyPoints } = require("./scoringService"); // Importing the scoring logic

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// The shortest piece of a name we will trust. Anything smaller is a scrap,
// not a name, and would match far too many players.
const SHORTEST_NAME = 3;

// Finds the one player a scorecard name refers to, out of a list already in memory.
// Steps 2 and 3 match only part of a name, so they ask for a whole word.
// Without that, "and" matched Pandya and "h" matched Bumrah.
// They also refuse to answer when more than one player fits, because picking
// one of them would hand the points to the wrong person without saying so.
// There is no database in here, so it can be tested on its own.
const matchPlayer = (players, scrapedName, team) => {
    const cleanName = String(scrapedName || "").replace(/\(.*?\)/g, '').trim();
    if (!cleanName) return null;

    // Step 1: the whole name, exactly. No player name is shared across teams,
    // so this one does not need the team to be sure.
    const exact = players.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());
    if (exact) {
        console.log(`✅ Matched full name: '${cleanName}' => ${exact.name}`);
        return exact;
    }

    if (cleanName.length < SHORTEST_NAME) {
        console.warn(`❌ '${scrapedName}' is too short to be a name, so it was not looked up`);
        return null;
    }

    const teamLower = String(team || "").toLowerCase();
    const inTeam = players.filter((p) => String(p.team || "").toLowerCase().includes(teamLower));

    // only one player may fit, otherwise we do not know which one it is
    const onlyOne = (pattern, how) => {
        const found = inTeam.filter((p) => pattern.test(p.name));
        if (found.length === 1) {
            console.log(`🔁 Matched by ${how} => ${found[0].name}`);
            return found[0];
        }
        if (found.length > 1) {
            console.warn(`❓ '${scrapedName}' in ${team} fits ${found.length} players: ${found.map((p) => p.name).join(", ")}`);
        }
        return null;
    };

    // Step 2: the last name, as a whole word at the end
    const nameParts = cleanName.split(/\s+/);
    const lastName = nameParts[nameParts.length - 1];
    if (lastName.length >= SHORTEST_NAME) {
        const player = onlyOne(new RegExp(`\\b${escapeRegex(lastName)}$`, "i"), `last name '${lastName}' and team '${team}'`);
        if (player) return player;
    }

    // Step 3: a one word name like "Pant", as a whole word anywhere in the name
    if (nameParts.length === 1) {
        const player = onlyOne(new RegExp(`\\b${escapeRegex(cleanName)}\\b`, "i"), `part of the name '${cleanName}' and team '${team}'`);
        if (player) return player;
    }

    console.warn(`❌ No match found for scraped name '${scrapedName}' with team '${team}'`);
    return null;
};

// Reads every player once and hands back lookups that run in memory.
// Scoring one match asks for hundreds of names, and every team's fifteen
// players on top. Asking the database each time meant hundreds of trips
// over the network for a list that fits in memory many times over.
const loadPlayerIndex = async () => {
    const players = await Player.find().lean();
    const byId = new Map(players.map((p) => [p.playerID, p]));

    return {
        count: players.length,
        byName: (scrapedName, team) => matchPlayer(players, scrapedName, team),
        byPlayerId: (playerID) => byId.get(playerID) || null,
        // the players a name in this team could have matched, so a report can
        // show exactly the pool the matcher was choosing from
        squad: (team) =>
            players
                .filter((p) => String(p.team || "").toLowerCase().includes(String(team || "").toLowerCase()))
                .map((p) => p.name)
                .sort(),
    };
};

// For a caller that only needs one name. Anything looking up a whole
// scorecard should load the index once instead of calling this in a loop.
const findPlayerByNameAndTeam = async (scrapedName, team) => {
    const index = await loadPlayerIndex();
    return index.byName(scrapedName, team);
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

        // read the players once, then every lookup below happens in memory
        const playerIndex = await loadPlayerIndex();
        console.log(`Loaded ${playerIndex.count} players`);

        // Step 1: Process Batting Stats
        for (let inning of match.innings) {
            const battingTeam = inning.team?.split("Innings")[0]?.trim() || "";
            const bowlingTeam = battingTeam === team1 ? team2 : team1;

            const rawTeamName = inning.team || "";
            const teamName = rawTeamName.split("Innings")[0].trim();
            for (let batting of inning.batting) {
                const player = playerIndex.byName(batting.playerName, battingTeam);
                if (!player) continue;

                const playerStats = {
                    runs: batting.runs || 0,
                    ballsFaced: batting.balls || 0,
                    fours: batting.fours || 0,
                    sixes: batting.sixes || 0,
                    strikeRate: batting.strikeRate || 0,
                    dismissed: batting.how_out ? true : false,
                };

                const fantasyPoints = calculatePlayerFantasyPoints(playerStats);

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
                const player = playerIndex.byName(bowling.playerName, bowlingTeam);
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

                const fantasyPoints = calculatePlayerFantasyPoints(playerStats);

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
                    const fielder = playerIndex.byName(batting.how_out.c, bowlingTeam);
                    if (fielder) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ catches: 1 });
                        console.log(` Fielding | Player: ${fielder.name} | Caught Out | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[fielder.playerID] = (playerFantasyPoints[fielder.playerID] || 0) + fieldingPoints;
                    }
                }

                if (batting.how_out.st) {
                    const keeper = playerIndex.byName(batting.how_out.st, bowlingTeam);
                    if (keeper) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ stumpings: 1 });
                        console.log(` Fielding | Player: ${keeper.name} | Stumping | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[keeper.playerID] = (playerFantasyPoints[keeper.playerID] || 0) + fieldingPoints;
                    }
                }

                if (batting.how_out["run out"]) {
                    const fielder = playerIndex.byName(batting.how_out["run out"], bowlingTeam);
                    if (fielder) {
                        const fieldingPoints = calculatePlayerFantasyPoints({ directHitRunOuts: 1 });
                        console.log(` Fielding | Player: ${fielder.name} | Run Out | Fantasy Points: ${fieldingPoints}`);
                        playerFantasyPoints[fielder.playerID] = (playerFantasyPoints[fielder.playerID] || 0) + fieldingPoints;
                    }
                }
            }
        }

        // Step 4: Update Fantasy Points for Players
        // send every player's points in one go, rather than one trip each
        const playerWrites = Object.entries(playerFantasyPoints).map(([playerId, points]) => ({
            updateOne: {
                filter: { playerID: playerId },
                update: { $inc: { fantasyPoints: points } },
            },
        }));
        if (playerWrites.length > 0) {
            await Player.bulkWrite(playerWrites);
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
                const player = playerIndex.byPlayerId(teamPlayer.playerID);
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

module.exports = { updateFantasyPoints, findPlayerByNameAndTeam, loadPlayerIndex, matchPlayer };
