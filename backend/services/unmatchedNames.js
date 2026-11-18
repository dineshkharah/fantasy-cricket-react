const mongoose = require("mongoose");
const Match = require("../models/MatchModel");
const { loadPlayerIndex } = require("./fantasyPointsUpdater");

// Reports every name on a scorecard that does not match a player in our database.
// Those performances score nothing, so this is the list of points that would be
// quietly lost if the match were scored right now.
// It only reads. It never scores anything and never writes.

const cleanTeamName = (raw) => (raw || "").split("Innings")[0].trim();

// Every name the scorer looks up, in the same order and against the same team.
// No database in here, so it can be tested on its own.
const collectLookups = (match) => {
    const team1 = cleanTeamName(match.innings && match.innings[0] && match.innings[0].team);
    const team2 = cleanTeamName(match.innings && match.innings[1] && match.innings[1].team);
    const lookups = [];

    for (const inning of match.innings || []) {
        const battingTeam = cleanTeamName(inning.team);
        const bowlingTeam = battingTeam === team1 ? team2 : team1;

        for (const batting of inning.batting || []) {
            lookups.push({
                name: batting.playerName,
                team: battingTeam,
                where: "batting",
                detail: `${batting.runs} runs off ${batting.balls}`,
            });

            const out = batting.how_out;
            if (out && typeof out === "object") {
                if (out.c) {
                    lookups.push({ name: out.c, team: bowlingTeam, where: "catch", detail: `caught ${batting.playerName}` });
                }
                if (out.st) {
                    lookups.push({ name: out.st, team: bowlingTeam, where: "stumping", detail: `stumped ${batting.playerName}` });
                }
                if (out["run out"]) {
                    lookups.push({ name: out["run out"], team: bowlingTeam, where: "run out", detail: `ran out ${batting.playerName}` });
                }
            }
        }

        for (const bowling of inning.bowling || []) {
            lookups.push({
                name: bowling.playerName,
                team: bowlingTeam,
                where: "bowling",
                detail: `${bowling.wickets} for ${bowling.runsConceded}`,
            });
        }
    }

    return lookups;
};

const findUnmatchedNames = async (matchId) => {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
        return { error: "that is not a valid match id" };
    }

    const match = await Match.findById(matchId);
    if (!match) {
        return { error: "match not found" };
    }

    const lookups = collectLookups(match);

    // read the players once, then match every name in memory
    const playerIndex = await loadPlayerIndex();

    // the same name turns up more than once, so only work it out once
    const seen = new Map();
    const unmatched = [];

    for (const lookup of lookups) {
        const key = `${lookup.name}|${lookup.team}`;
        if (!seen.has(key)) {
            seen.set(key, playerIndex.byName(lookup.name, lookup.team));
        }
        if (!seen.get(key)) {
            unmatched.push(lookup);
        }
    }

    // hand back the squad of each team involved, so the right name is easy to spot
    const squads = {};
    for (const team of new Set(unmatched.map((row) => row.team))) {
        squads[team] = playerIndex.squad(team);
    }

    return {
        matchId: String(match._id),
        matchTitle: match.title,
        alreadyScored: Boolean(match.fantasyPointsProcessed),
        namesChecked: lookups.length,
        unmatchedCount: unmatched.length,
        unmatched,
        squads,
    };
};

module.exports = { findUnmatchedNames, collectLookups, cleanTeamName };
