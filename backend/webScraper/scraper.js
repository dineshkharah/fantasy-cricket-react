const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeCricketScore(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    const data = await page.evaluate(() => {

        // takes "(sub) Raj Bawa" or "Pant (c & wk)" and gives back just the name
        function cleanName(name) {
            return name
                .replace(/\(sub\)/gi, "")
                .replace(/\((c|wk|c\s*&\s*wk)\)/gi, "")
                .replace(/\s+/g, " ")
                .trim();
        }

        // out kaise hua woh batayega.
        // every pattern starts with ^ so it cannot restart on a c sitting inside a surname,
        // and the b that splits the fielder from the bowler has to be a word on its own,
        // so the b inside a name like Abdul or Corbin is never read as that separator.
        function parseHowOut(text) {
            const howOut = {};
            if (!text) return howOut;

            const line = text.replace(/\s+/g, " ").trim();

            if (/\bnot out\b/i.test(line)) {
                return "not out";
            }

            let match = line.match(/^run out\s*\(([^)]+)\)/i);
            if (match) {
                howOut["run out"] = cleanName(match[1]);
                return howOut;
            }

            // caught and bowled, so the bowler took the catch as well
            match = line.match(/^c\s+(?:and|&)\s+b\s+(.+)$/i);
            if (match) {
                const who = cleanName(match[1]);
                howOut["c"] = who;
                howOut["b"] = who;
                return howOut;
            }

            match = line.match(/^st\s+(.+?)\s+b\s+(.+)$/i);
            if (match) {
                howOut["st"] = cleanName(match[1]);
                howOut["b"] = cleanName(match[2]);
                return howOut;
            }

            match = line.match(/^c\s+(.+?)\s+b\s+(.+)$/i);
            if (match) {
                howOut["c"] = cleanName(match[1]);
                howOut["b"] = cleanName(match[2]);
                return howOut;
            }

            match = line.match(/^(?:lbw\s+)?b\s+(.+)$/i);
            if (match) {
                howOut["b"] = cleanName(match[1]);
                return howOut;
            }

            return howOut;
        }

        // batting ka nikal ke dega
        function extractBattingData(team) {
            let batters = team[0].querySelectorAll('.cb-col.cb-col-100.cb-scrd-itms');
            let batting = [];

            batters.forEach((player) => {
                let columns = player.querySelectorAll('.cb-col');
                if (columns.length >= 7) {
                    batting.push({
                        playerName: columns[0]?.innerText.trim(),
                        how_out: parseHowOut(columns[1]?.innerText.trim()),
                        runs: columns[2]?.innerText.trim(),
                        balls: columns[3]?.innerText.trim(),
                        fours: columns[4]?.innerText.trim(),
                        sixes: columns[5]?.innerText.trim(),
                        strikeRate: columns[6]?.innerText.trim()
                    });
                }
            });
            return batting;
        }

        // bowling ka nikal ke dega
        function extractBowlingData(team) {
            let bowlers = team[1].querySelectorAll('.cb-col.cb-col-100.cb-scrd-itms');
            let bowling = [];

            bowlers.forEach((player) => {
                let columns = player.querySelectorAll('.cb-col');
                if (columns.length >= 8) {
                    bowling.push({
                        playerName: columns[0]?.innerText.trim(),
                        overs: columns[1]?.innerText.trim(),
                        maidens: columns[2]?.innerText.trim(),
                        runsConceded: columns[3]?.innerText.trim(),
                        wickets: columns[4]?.innerText.trim(),
                        noBall: columns[5]?.innerText.trim(),
                        wide: columns[6]?.innerText.trim(),
                        economy: columns[7]?.innerText.trim()
                    });
                }
            });
            return bowling;
        }

        // match ka basic data nikal ke dega
        let title = document.querySelector('h1.cb-nav-hdr')?.innerText.trim() || "";
        let series = document.querySelector('.cb-nav-subhdr .text-hvr-underline')?.innerText.trim() || "";
        let venue = document.querySelector('.cb-nav-subhdr [itemprop="location"]')?.innerText.trim() || "";
        let dateTime = document.querySelector('.cb-nav-subhdr [itemprop="startDate"]')?.innerText.trim() || "";
        let matchSummary = document.querySelector('.cb-scrcrd-status')?.innerText.trim() || "";

        let finalData = {
            metadata: {
                title,
                series,
                venue,
                dateTime,
                matchSummary
            },
            innings: []
        }

        // 2 innings hai so looping it 2 baar
        for (let i = 1; i <= 2; i++) {
            let inningElement = document.getElementById(`innings_${i}`);
            if (inningElement) {
                let team = inningElement.querySelectorAll('.cb-col.cb-col-100.cb-ltst-wgt-hdr');
                let teamName = inningElement.querySelector('.cb-col.cb-col-100.cb-scrd-hdr-rw')?.innerText.trim();
                finalData.innings.push({
                    team: teamName || `Inning ${i}`,
                    batting: extractBattingData(team),
                    bowling: extractBowlingData(team)
                });
            }
        }

        return finalData;
    });

    await browser.close();

    // a blocked page or a changed layout still gives us an object, just an empty one.
    // writing that would wipe the last good scorecard, so check before saving.
    const noInnings = data.innings.length === 0;
    const noBatters = data.innings.every((inning) => inning.batting.length === 0);

    if (!data.metadata.title || noInnings || noBatters) {
        console.error('the scrape came back empty, so nothing was saved.');
        console.error('the site may have blocked us, or the page layout may have changed.');
        console.error(`title: "${data.metadata.title}"   innings found: ${data.innings.length}`);
        process.exitCode = 1;
        return;
    }

    // always write next to this script, whatever folder it was started from
    const outFile = path.join(__dirname, 'cricket_score.json');
    fs.writeFileSync(outFile, JSON.stringify(data, null, 2));

    const batters = data.innings.reduce((sum, inning) => sum + inning.batting.length, 0);
    console.log(`saved ${data.innings.length} innings and ${batters} batters to ${outFile}`);
}

let url = 'https://www.cricbuzz.com/live-cricket-scorecard/115059/lsg-vs-mi-16th-match-indian-premier-league-2025';

scrapeCricketScore(url);
