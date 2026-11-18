// Repairs fielder names that the old scorecard parser mangled before it was fixed.
// Run it from the backend folder:
//   node fixFielderNames.js         shows what it would change, saves nothing
//   node fixFielderNames.js --yes   saves the changes
//
// It only touches how_out on stored matches. Scores are not worked out here,
// so run resetScores.js afterwards to put the points right.
//
// The safety rule: a name is only replaced when the name stored now matches no
// player AND the repaired name does match one. So a working name is never
// touched, and a broken name is never swapped for another broken name.

require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const mongoose = require("mongoose");

const Match = require("./models/MatchModel");
const Player = require("./models/PlayerModel");
const { findPlayerByNameAndTeam } = require("./services/fantasyPointsUpdater");
const { cleanTeamName } = require("./services/unmatchedNames");

// The old broken pattern, kept only so we can work out which real name it ate.
// It stopped at any lowercase b, so "c Corbin Bosch b Hardik Pandya" failed at
// the b in Corbin, restarted at the c in Bosch, and left just "h".
const oldCatchPattern = (fielder, bowler) => {
    const text = `c ${fielder} b ${bowler}`;
    const match = text.match(/c\s*(?:\((sub)?\))?\s*([^b]+)b\s+(.+)/);
    return match ? match[2].trim() : null;
};

const oldStumpPattern = (fielder, bowler) => {
    const text = `st ${fielder} b ${bowler}`;
    const match = text.match(/st\s+([^b]+)b\s+(.+)/);
    return match ? match[1].trim() : null;
};

// Works out what the scorecard really said, given what got stored.
// Returns { fielder, bowler, how } or null when it cannot be recovered.
const repair = (kind, stored, squad) => {
    const fielder = kind === "c" ? stored.c : stored.st;
    const bowler = stored.b;

    // caught and bowled. The bowler took the catch, so "and" is not a person.
    if (kind === "c" && /^(and|&)$/i.test(fielder) && bowler) {
        return { fielder: bowler, bowler, how: "caught and bowled, so the catch goes to the bowler" };
    }

    // the old fallback swallowed the bowler into the fielder name
    const split = fielder.match(/^(.+?)\s+b\s+(.+)$/);
    if (split) {
        return { fielder: split[1].trim(), bowler: split[2].trim(), how: "the bowler was stuck onto the fielder name" };
    }

    // the name was cut short, so find which squad member the old pattern turns
    // into exactly what we have stored. Only trust it when one player fits.
    if (bowler) {
        const replay = kind === "c" ? oldCatchPattern : oldStumpPattern;
        const fits = squad.filter((player) => replay(player, bowler) === fielder);
        if (fits.length === 1) {
            return { fielder: fits[0], bowler, how: "the name was cut short by a c inside the surname" };
        }
    }

    return null;
};

const run = async () => {
    const save = process.argv.includes("--yes");

    await mongoose.connect(process.env.MONGO_URI);
    console.log(save ? "connected, changes will be saved" : "connected, this is a dry run");

    const everyPlayer = await Player.find().select("name team");
    const squadOf = (team) =>
        everyPlayer.filter((player) => player.team.toLowerCase() === team.toLowerCase()).map((player) => player.name);

    const matches = await Match.find();
    console.log(`matches stored: ${matches.length}`);

    let fixed = 0;
    let stuck = 0;

    for (const match of matches) {
        const team1 = cleanTeamName(match.innings[0] && match.innings[0].team);
        const team2 = cleanTeamName(match.innings[1] && match.innings[1].team);
        let changedHere = false;

        console.log("");
        console.log(`match: ${match.title}`);

        for (let i = 0; i < match.innings.length; i++) {
            const inning = match.innings[i];
            const battingTeam = cleanTeamName(inning.team);
            const fieldingTeam = battingTeam === team1 ? team2 : team1;
            const squad = squadOf(fieldingTeam);

            for (let j = 0; j < inning.batting.length; j++) {
                const batting = inning.batting[j];
                const out = batting.how_out;
                if (!out || typeof out !== "object") continue;

                for (const kind of ["c", "st"]) {
                    const name = out[kind];
                    if (!name) continue;

                    // a name that already finds a player is left alone
                    if (await findPlayerByNameAndTeam(name, fieldingTeam)) continue;

                    const mend = repair(kind, out, squad);
                    if (!mend) {
                        stuck++;
                        console.log(`  could not work out: ${kind} "${name}"   (${batting.playerName}, ${fieldingTeam})`);
                        continue;
                    }

                    // never write a name that still would not match a player
                    const found = await findPlayerByNameAndTeam(mend.fielder, fieldingTeam);
                    if (!found) {
                        stuck++;
                        console.log(`  guessed "${mend.fielder}" for ${kind} "${name}", but no such player in ${fieldingTeam}`);
                        continue;
                    }

                    const before = JSON.stringify(out);
                    const next = { ...out, [kind]: mend.fielder };
                    if (mend.bowler) next.b = mend.bowler;

                    inning.batting[j].how_out = next;
                    match.markModified(`innings.${i}.batting.${j}.how_out`);
                    changedHere = true;
                    fixed++;

                    console.log(`  ${batting.playerName}`);
                    console.log(`      before: ${before}`);
                    console.log(`      after : ${JSON.stringify(next)}`);
                    console.log(`      why   : ${mend.how}`);
                }
            }
        }

        if (!changedHere) {
            console.log("  nothing to repair");
        } else if (save) {
            await match.save();
            console.log("  saved");
        }
    }

    console.log("");
    console.log(`names repaired: ${fixed}`);
    console.log(`names still broken: ${stuck}`);

    if (!save) {
        console.log("");
        console.log("nothing was saved. Run it again with --yes when the changes above look right:");
        console.log("  node fixFielderNames.js --yes");
    } else if (fixed > 0) {
        console.log("");
        console.log("now work the scores out again so the repaired catches count:");
        console.log("  node resetScores.js --yes");
    }
};

run()
    .catch((err) => console.error("fix failed:", err))
    .finally(() => mongoose.connection.close());
