const calculatePlayerFantasyPoints = (playerStats, isCaptain, isViceCaptain, isUncapped) => {
    let points = 0;

    const runs = Number(playerStats.runs) || 0;
    const ballsFaced = Number(playerStats.ballsFaced) || 0;
    const fours = Number(playerStats.fours) || 0;
    const sixes = Number(playerStats.sixes) || 0;
    const strikeRate = Number(playerStats.strikeRate) || 0;
    const wickets = Number(playerStats.wickets) || 0;
    const lbwBowled = Number(playerStats.lbwBowled) || 0;
    const dotBalls = Number(playerStats.dotBalls) || 0;
    const maidenOvers = Number(playerStats.maidenOvers) || 0;
    const oversBowled = Number(playerStats.oversBowled) || 0;
    const runsConceded = Number(playerStats.runsConceded) || 0;
    const economy = Number(playerStats.economy) || 0;
    const catches = Number(playerStats.catches) || 0;
    const stumpings = Number(playerStats.stumpings) || 0;
    const directHitRunOuts = Number(playerStats.directHitRunOuts) || 0;
    const assistedRunOuts = Number(playerStats.assistedRunOuts) || 0;
    const dismissed = Boolean(playerStats.dismissed);

    // 🏏 Batting Points
    points += runs;
    points += fours * 4;
    points += sixes * 6;
    if (runs >= 25) points += 4;
    if (runs >= 50) points += 8;
    if (runs >= 75) points += 12;
    if (runs >= 100) points += 16;
    if (runs === 0 && dismissed) points -= 2;

    // Strike Rate Bonus/Penalty
    if (ballsFaced >= 10) {
        if (strikeRate > 170) points += 6;
        else if (strikeRate > 150) points += 4;
        else if (strikeRate >= 130) points += 2;
        else if (strikeRate >= 60 && strikeRate < 70) points -= 2;
        else if (strikeRate >= 50 && strikeRate < 60) points -= 4;
        else if (strikeRate < 50) points -= 6;
    }

    // 🎯 Bowling Points
    points += wickets * 25;
    points += lbwBowled * 8;
    points += dotBalls;
    points += maidenOvers * 12;
    if (wickets >= 3) points += 4;
    if (wickets >= 4) points += 8;
    if (wickets >= 5) points += 12;

    // Economy Rate Bonus/Penalty
    if (oversBowled >= 2) {
        if (economy < 5) points += 6;
        else if (economy < 6) points += 4;
        else if (economy <= 7) points += 2;
        else if (economy >= 10 && economy <= 11) points -= 2;
        else if (economy > 11 && economy <= 12) points -= 4;
        else if (economy > 12) points -= 6;
    }

    // 🧤 Fielding Points
    points += catches * 8;
    if (catches >= 3) points += 4;
    points += stumpings * 12;
    points += directHitRunOuts * 12;
    points += assistedRunOuts * 6;

    // 🏆 Captain, Vice-Captain, Uncapped Multipliers
    if (isCaptain) points *= 3;
    else if (isViceCaptain) points *= 2;
    else if (isUncapped) points *= 1.5;

    if (isNaN(points)) {
        console.warn("⚠️ Warning: NaN detected in fantasy points calculation. Defaulting to 0.");
        points = 0;
    }

    return points;
};


module.exports = {
    calculatePlayerFantasyPoints
};