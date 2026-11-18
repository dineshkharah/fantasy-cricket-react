// Wipes every score and works them all out again with the current scoring rules.
// Run it from the backend folder:  node resetScores.js --yes
// It only touches scores. Teams, squads, captains, players and users stay as they are.

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");

// same as server.js, some networks cannot resolve the mongodb+srv address on their own
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const Team = require("./models/TeamModel");
const Player = require("./models/PlayerModel");
const Match = require("./models/MatchModel");
const { updateFantasyPoints } = require("./services/fantasyPointsUpdater");

const run = async () => {
    if (!process.argv.includes("--yes")) {
        console.log("This wipes every team total, every player total and every match flag,");
        console.log("then scores all matches again from zero.");
        console.log("Teams, squads, captains, players and users are not touched.");
        console.log("");
        console.log("Run it again with --yes when you are ready:");
        console.log("  node resetScores.js --yes");
        return;
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to the database");

    const matches = await Match.find().sort({ createdAt: 1 });
    console.log(`found ${matches.length} match(es)`);

    if (matches.length === 0) {
        console.log("no matches stored, nothing to do");
        return;
    }

    const oldTeams = await Team.find().sort({ totalPoints: -1 });
    console.log("");
    console.log("team totals before the reset");
    for (const team of oldTeams) {
        console.log(`${String(team.totalPoints).padStart(8)}  ${team.teamName}`);
    }
    console.log("");
    console.log("wiping the old scores");
    await Team.updateMany({}, { $set: { totalPoints: 0, matchPoints: [], processedMatches: [] } });
    await Player.updateMany({}, { $set: { fantasyPoints: 0 } });
    await Match.updateMany({}, { $set: { fantasyPointsProcessed: false } });

    for (const match of matches) {
        console.log(`scoring: ${match.title}`);
        await updateFantasyPoints(match._id);
    }

    const teams = await Team.find().sort({ totalPoints: -1 });
    console.log("");
    console.log("final team totals");
    for (const team of teams) {
        console.log(`${String(team.totalPoints).padStart(8)}  ${team.teamName}`);
    }

    const topPlayers = await Player.find().sort({ fantasyPoints: -1 }).limit(5);
    console.log("");
    console.log("top 5 players");
    for (const player of topPlayers) {
        console.log(`${String(player.fantasyPoints).padStart(8)}  ${player.name}`);
    }
};

run()
    .catch((err) => console.error("reset failed:", err))
    .finally(() => mongoose.connection.close());
