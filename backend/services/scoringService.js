const calculatePlayerFantasyPoints = (playerStats, isCaptain, isViceCaptain, isUncapped) => {
    let points = 0;

    // 🏏 Batting Points
    points += playerStats.runs;
    points += playerStats.fours * 4;
    points += playerStats.sixes * 6;
    if (playerStats.runs >= 25) points += 4;
    if (playerStats.runs >= 50) points += 8;
    if (playerStats.runs >= 75) points += 12;
    if (playerStats.runs >= 100) points += 16;
    if (playerStats.runs === 0 && playerStats.dismissed) points -= 2;

    // Strike Rate Bonus/Penalty
    if (playerStats.ballsFaced >= 10) {
        const strikeRate = (playerStats.runs / playerStats.ballsFaced) * 100;
        if (strikeRate > 170) points += 6;
        else if (strikeRate > 150) points += 4;
        else if (strikeRate >= 130) points += 2;
        else if (strikeRate >= 60 && strikeRate < 70) points -= 2;
        else if (strikeRate >= 50 && strikeRate < 60) points -= 4;
        else if (strikeRate < 50) points -= 6;
    }

    // 🎯 Bowling Points
    points += playerStats.wickets * 25;
    points += playerStats.lbwBowled * 8;
    points += playerStats.dotBalls;
    points += playerStats.maidenOvers * 12;
    if (playerStats.wickets >= 3) points += 4;
    if (playerStats.wickets >= 4) points += 8;
    if (playerStats.wickets >= 5) points += 12;

    // Economy Rate Bonus/Penalty
    if (playerStats.oversBowled >= 2) {
        const economyRate = playerStats.runsConceded / playerStats.oversBowled;
        if (economyRate < 5) points += 6;
        else if (economyRate < 6) points += 4;
        else if (economyRate <= 7) points += 2;
        else if (economyRate >= 10 && economyRate <= 11) points -= 2;
        else if (economyRate > 11 && economyRate <= 12) points -= 4;
        else if (economyRate > 12) points -= 6;
    }

    // 🧤 Fielding Points
    points += playerStats.catches * 8;
    if (playerStats.catches >= 3) points += 4;
    points += playerStats.stumpings * 12;
    points += playerStats.directHitRunOuts * 12;
    points += playerStats.assistedRunOuts * 6;

    // 🏆 Captain, Vice-Captain, Uncapped Multipliers
    if (isCaptain) points *= 3;
    else if (isViceCaptain) points *= 2;
    else if (isUncapped) points *= 1.5;

    return points;
};

module.exports = { calculatePlayerFantasyPoints };
