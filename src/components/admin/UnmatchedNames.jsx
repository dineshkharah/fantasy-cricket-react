import React, { useEffect, useState } from "react";
import axios from "../../utils/axios";

// Shows every name on a scorecard that does not match a player in the database.
// Those performances score nothing, so this is the list of points that would be
// lost if the match were scored right now. It only reads, it never scores.

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// scorecard titles are long, so keep only the part before the first dash
const shortTitle = (title) => (title || "").split(" - ")[0];

const badgeColour = {
    batting: "bg-blue-900 text-blue-200",
    bowling: "bg-purple-900 text-purple-200",
    catch: "bg-amber-900 text-amber-200",
    stumping: "bg-teal-900 text-teal-200",
    "run out": "bg-rose-900 text-rose-200",
};

const UnmatchedNames = () => {
    const [matches, setMatches] = useState([]);
    const [matchId, setMatchId] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMatches = async () => {
            try {
                const res = await axios.get("/api/v1/matches/");
                setMatches(res.data || []);
            } catch (err) {
                console.error("could not load the match list:", err);
                setError("could not load the match list");
            }
        };
        loadMatches();
    }, []);

    const check = async () => {
        if (!matchId) return;
        setLoading(true);
        setError("");
        setReport(null);
        try {
            const res = await axios.get(`/api/v1/matches/${matchId}/unmatched`, {
                headers: authHeaders(),
            });
            setReport(res.data);
        } catch (err) {
            console.error("the name check failed:", err);
            setError(err.response?.data?.message || "the check failed");
        } finally {
            setLoading(false);
        }
    };

    // put the unmatched names under the team they belong to, so the squad
    // for that team can sit right next to them
    const byTeam = (report?.unmatched || []).reduce((groups, row) => {
        (groups[row.team] = groups[row.team] || []).push(row);
        return groups;
    }, {});

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-300">Unmatched names</h2>
            <p className="text-gray-400 mt-1 text-sm">
                Checks a scorecard against the player list before you score it. Anything shown
                here earns nothing, so fix the name first.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
                <select
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100"
                >
                    <option value="">pick a match</option>
                    {matches.map((m) => (
                        <option key={m._id} value={m._id}>
                            {shortTitle(m.title)}
                        </option>
                    ))}
                </select>

                <button
                    onClick={check}
                    disabled={!matchId || loading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg px-5 py-2"
                >
                    {loading ? "checking" : "check names"}
                </button>
            </div>

            {error && (
                <p className="mt-4 bg-red-950 border border-red-800 text-red-200 rounded-lg px-4 py-3 text-sm">
                    {error}
                </p>
            )}

            {report && (
                <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-200 font-medium">{shortTitle(report.matchTitle)}</span>
                        <span className="text-xs text-gray-400">{report.namesChecked} names checked</span>
                        {report.alreadyScored && (
                            <span className="text-xs bg-amber-900 text-amber-200 rounded-full px-3 py-1">
                                already scored
                            </span>
                        )}
                    </div>

                    {report.alreadyScored && report.unmatchedCount > 0 && (
                        <p className="mt-3 bg-amber-950 border border-amber-800 text-amber-200 rounded-lg px-4 py-3 text-sm">
                            This match has already been scored, so fixing the names is not enough on
                            its own. Run resetScores.js afterwards to work the points out again.
                        </p>
                    )}

                    {report.unmatchedCount === 0 ? (
                        <p className="mt-4 bg-green-950 border border-green-800 text-green-200 rounded-lg px-4 py-3 text-sm">
                            Every name matched a player. Nothing would be lost by scoring this match.
                        </p>
                    ) : (
                        <>
                            <p className="mt-4 text-gray-300">
                                {report.unmatchedCount} name{report.unmatchedCount === 1 ? "" : "s"} matched no player.
                            </p>

                            {Object.entries(byTeam).map(([team, rows]) => (
                                <div key={team} className="mt-5 border border-gray-700 rounded-lg overflow-hidden">
                                    <div className="bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200">
                                        {team}
                                    </div>

                                    <table className="w-full text-sm">
                                        <tbody>
                                            {rows.map((row, i) => (
                                                <tr key={`${row.name}-${row.where}-${i}`} className="border-t border-gray-700">
                                                    <td className="px-4 py-2 text-gray-100 font-medium">{row.name}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`text-xs rounded-full px-2 py-1 ${badgeColour[row.where] || "bg-gray-700 text-gray-300"}`}>
                                                            {row.where}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-400">{row.detail}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {report.squads?.[team] && (
                                        <div className="bg-gray-900 px-4 py-3 border-t border-gray-700">
                                            <p className="text-xs text-gray-500 mb-1">
                                                players we do have for {team}
                                            </p>
                                            <p className="text-xs text-gray-400 leading-relaxed">
                                                {report.squads[team].join(", ")}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default UnmatchedNames;
