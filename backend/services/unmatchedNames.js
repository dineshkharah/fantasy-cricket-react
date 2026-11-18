const mongoose = require("mongoose");
const Match = require("../models/MatchModel");
const Player = require("../models/PlayerModel");
const { findPlayerByNameAndTeam } = require("./fantasyPointsUpdater");

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

    // the same name turns up more than once, so only ask the database once for each
    const seen = new Map();
    const unmatched = [];

    for (const lookup of lookups) {
        const key = `${lookup.name}|${lookup.team}`;
        if (!seen.has(key)) {
            seen.set(key, await findPlayerByNameAndTeam(lookup.name, lookup.team));
        }
        if (!seen.get(key)) {
            unmatched.push(lookup);
        }
    }

    // hand back the squad of each team involved, so the right name is easy to spot
    const squads = {};
    const teamsNeeded = [...new Set(unmatched.map((row) => row.team))];

    if (teamsNeeded.length > 0) {
        const everyPlayer = await Player.find().select("name team").sort({ name: 1 });
        for (const team of teamsNeeded) {
            squads[team] = everyPlayer
                .filter((player) => player.team.toLowerCase() === team.toLowerCase())
                .map((player) => player.name);
        }
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
