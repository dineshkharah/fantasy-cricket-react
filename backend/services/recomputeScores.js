// Wipes every score and works them all out again with the current scoring rules.
// Only scores are touched. Teams, squads, captains, players and users stay as they are.
//
// Team and player totals are running sums built with $inc, so they cannot be
// corrected by scoring a match again. The only way to put them right is to set
// everything back to zero and add it all up once more.
//
// This is the one place that happens. resetScores.js and the admin page both
// call it, so the two can never drift apart.

const Team = require("../models/TeamModel");
const Player = require("../models/PlayerModel");
const Match = require("../models/MatchModel");
const { updateFantasyPoints } = require("./fantasyPointsUpdater");

// Everyone sits at zero while this runs, so two at once would be a mess.
// This only guards one running server. It is not a lock across several.
let running = false;

const teamTotals = async () => {
    const teams = await Team.find().select("teamName totalPoints").sort({ totalPoints: -1 });
    return teams.map((team) => ({ teamName: team.teamName, points: team.totalPoints }));
};

const recomputeAllScores = async () => {
    if (running) {
        return { busy: true, message: "a recompute is already running" };
    }
    running = true;

    try {
        const started = Date.now();
        const matches = await Match.find().sort({ createdAt: 1 });

        if (matches.length === 0) {
            return { matchesScored: 0, matches: [], before: [], after: [], topPlayers: [], tookMs: 0 };
        }

        const before = await teamTotals();

        await Team.updateMany({}, { $set: { totalPoints: 0, matchPoints: [], processedMatches: [] } });
        await Player.updateMany({}, { $set: { fantasyPoints: 0 } });
        await Match.updateMany({}, { $set: { fantasyPointsProcessed: false } });

        const scored = [];
        for (const match of matches) {
            await updateFantasyPoints(match._id);
            scored.push(match.title);
        }

        const after = await teamTotals();
        const top = await Player.find().select("name fantasyPoints").sort({ fantasyPoints: -1 }).limit(5);

        return {
            matchesScored: scored.length,
            matches: scored,
            before,
            after,
            topPlayers: top.map((player) => ({ name: player.name, points: player.fantasyPoints })),
            tookMs: Date.now() - started,
        };
    } finally {
        running = false;
    }
};

module.exports = { recomputeAllScores };
