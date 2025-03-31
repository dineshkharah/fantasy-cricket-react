const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeCricketScore(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });

    const data = await page.evaluate(() => {

        // out kaise hua woh batayega
        function parseHowOut(text) {
            let howOut = {};

            if(text.includes("not out")) {
                return howOut = "not out";
            }
        
            if (text.includes("run out")) {
                let match = text.match(/run out\s*\(([^)]+)\)/);
                howOut["run out"] = match ? match[1] : "Unknown";
            } else if (text.includes("st ")) {
                let match = text.match(/st\s+([^b]+)b\s+(.+)/);
                if (match) {
                    howOut["st"] = match[1].trim();
                    howOut["b"] = match[2].trim();
                }
            } else if (text.includes("c ")) {
                let match = text.match(/c\s*(?:\((sub)?\))?\s*([^b]+)b\s+(.+)/);
                if (match) {
                    howOut["c"] = match[2].trim();
                    howOut["b"] = match[3].trim();
                } else {
                    match = text.match(/c\s+(.+)/);
                    if (match) {
                        howOut["c"] = match[1].trim();
                    }
                }
            } else if (text.includes("b ")) {
                let match = text.match(/b\s+(.+)/);
                if (match) {
                    howOut["b"] = match[1].trim();
                }
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
            metadata : {
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

    fs.writeFileSync('cricket_score.json', JSON.stringify(data, null, 2));
    console.log('Data saved to cricket_score.json');

    await browser.close();
}

let url = 'https://www.cricbuzz.com/live-cricket-scorecard/115030/rr-vs-csk-11th-match-indian-premier-league-2025';

scrapeCricketScore(url);
