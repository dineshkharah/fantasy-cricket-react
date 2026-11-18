import React, { useState } from "react";
import axios from "../../utils/axios";

// Sets every score back to zero and works them all out again.
// Team and player totals are running sums, so correcting a scorecard name does
// nothing on its own. This is what makes the change show up.

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RecomputeScores = () => {
    const [asking, setAsking] = useState(false);
    const [running, setRunning] = useState(false);
    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    const recompute = async () => {
        setAsking(false);
        setRunning(true);
        setError("");
        setReport(null);
        try {
            const res = await axios.post("/api/v1/fantasy/recompute", {}, { headers: authHeaders() });
            setReport(res.data);
        } catch (err) {
            console.error("the recompute failed:", err);
            setError(err.response?.data?.message || "the recompute failed");
        } finally {
            setRunning(false);
        }
    };

    // line the old total up against the new one for each team
    const rows = (report?.after || []).map((team) => {
        const was = report.before.find((old) => old.teamName === team.teamName);
        return {
            teamName: team.teamName,
            before: was ? was.points : 0,
            after: team.points,
        };
    });

    return (
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-blue-300">Work out every score again</h2>
            <p className="text-gray-400 mt-1 text-sm">
                Sets every team and player total back to zero, then scores all matches from the
                start. Run this after you fix a scorecard name, because the totals are running
                sums and will not correct themselves. Squads, captains and users are not touched.
            </p>

            {!asking && (
                <button
                    onClick={() => setAsking(true)}
                    disabled={running}
                    className="mt-5 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg px-5 py-2"
                >
                    {running ? "working" : "work out every score again"}
                </button>
            )}

            {asking && (
                <div className="mt-5 bg-amber-950 border border-amber-800 rounded-lg px-4 py-4">
                    <p className="text-amber-200 text-sm">
                        Every total goes to zero first and is then built back up. While that
                        happens the leaderboard is empty, and if it stops partway you will need to
                        run it again to get the numbers back.
                    </p>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={recompute}
                            className="bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg px-4 py-2 text-sm"
                        >
                            yes, work them out again
                        </button>
                        <button
                            onClick={() => setAsking(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg px-4 py-2 text-sm"
                        >
                            cancel
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <p className="mt-4 bg-red-950 border border-red-800 text-red-200 rounded-lg px-4 py-3 text-sm">
                    {error}
                </p>
            )}

            {report && report.matchesScored === 0 && (
                <p className="mt-4 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-4 py-3 text-sm">
                    There are no matches stored, so there was nothing to score.
                </p>
            )}

            {report && report.matchesScored > 0 && (
                <div className="mt-5">
                    <p className="text-green-300 text-sm">
                        Scored {report.matchesScored} match{report.matchesScored === 1 ? "" : "es"} in{" "}
                        {(report.tookMs / 1000).toFixed(1)} seconds.
                    </p>

                    <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-900 text-gray-400 text-left">
                                    <th className="px-4 py-2 font-medium">team</th>
                                    <th className="px-4 py-2 font-medium text-right">before</th>
                                    <th className="px-4 py-2 font-medium text-right">after</th>
                                    <th className="px-4 py-2 font-medium text-right">change</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => {
                                    const change = row.after - row.before;
                                    return (
                                        <tr key={row.teamName} className="border-t border-gray-700">
                                            <td className="px-4 py-2 text-gray-100">{row.teamName}</td>
                                            <td className="px-4 py-2 text-right text-gray-500">{row.before}</td>
                                            <td className="px-4 py-2 text-right text-gray-100 font-medium">{row.after}</td>
                                            <td
                                                className={`px-4 py-2 text-right ${change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-600"
                                                    }`}
                                            >
                                                {change === 0 ? "same" : change > 0 ? `+${change}` : change}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {report.topPlayers?.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 mb-2">top players now</p>
                            <div className="flex flex-wrap gap-2">
                                {report.topPlayers.map((player) => (
                                    <span
                                        key={player.name}
                                        className="bg-gray-900 border border-gray-700 rounded-full px-3 py-1 text-xs text-gray-300"
                                    >
                                        {player.name} <span className="text-blue-300">{player.points}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecomputeScores;
