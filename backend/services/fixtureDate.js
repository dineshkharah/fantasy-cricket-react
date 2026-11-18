// Works out when a match was actually played.
//
// A team should only score on a match played after the team was made. Using the
// import date instead let a team made in late April collect points from matches
// played in March, whose results were already public.
//
// The scorecard prints the time without a year, like "Mar 30, 07:30 PM LOCAL",
// so the year has to come from the series name, like "Indian Premier League 2025".
// This is the one place that joining happens.

// Returns a real date, or null when the text cannot be read.
const fixtureDate = (dateTime, series) => {
    if (!dateTime) return null;

    const year = String(series || "").match(/\b(?:19|20)\d{2}\b/);
    if (!year) return null;

    const cleaned = String(dateTime).replace(/\bLOCAL\b/i, "").replace(/\s+/g, " ").trim();
    const parts = cleaned.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!parts) return null;

    const built = new Date(`${parts[1]} ${parts[2]}, ${year[0]} ${parts[3]}:${parts[4]} ${parts[5]}`);
    return isNaN(built.getTime()) ? null : built;
};

// Always gives back a date to compare against, so a match with unreadable text
// cannot wipe out every team. In that case it falls back to the import date,
// which is what the old rule used, and says so.
const matchPlayedAt = (match) => {
    if (match.matchDate) return new Date(match.matchDate);

    const parsed = fixtureDate(match.dateTime, match.series);
    if (parsed) return parsed;

    console.warn(`could not read when '${match.title}' was played from ${JSON.stringify(match.dateTime)}, using the import date instead`);
    return new Date(match.createdAt);
};

module.exports = { fixtureDate, matchPlayedAt };
