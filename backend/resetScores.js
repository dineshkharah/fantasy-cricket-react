// Wipes every score and works them all out again with the current scoring rules.
// Run it from the backend folder:  node resetScores.js --yes
// It only touches scores. Teams, squads, captains, players and users stay as they are.
//
// The work itself lives in services/recomputeScores.js, which the admin page
// calls too, so both do exactly the same thing.

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");

// same as server.js, some networks cannot resolve the mongodb+srv address on their own
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const { recomputeAllScores } = require("./services/recomputeScores");

const show = (title, rows, nameKey) => {
    console.log("");
    console.log(title);
    for (const row of rows) {
        console.log(`${String(row.points).padStart(8)}  ${row[nameKey]}`);
    }
};

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

    const result = await recomputeAllScores();

    if (result.busy) {
        console.log(result.message);
        return;
    }

    if (result.matchesScored === 0) {
        console.log("no matches stored, nothing to do");
        return;
    }

    show("team totals before the reset", result.before, "teamName");

    console.log("");
    for (const title of result.matches) {
        console.log(`scored: ${title}`);
    }

    show("final team totals", result.after, "teamName");
    show("top 5 players", result.topPlayers, "name");

    console.log("");
    console.log(`${result.matchesScored} match(es) in ${(result.tookMs / 1000).toFixed(1)} seconds`);
};

run()
    .catch((err) => console.error("reset failed:", err))
    .finally(() => mongoose.connection.close());
