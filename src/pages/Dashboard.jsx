import React, { useEffect, useState } from 'react';
import UserTeam from '../components/dashboard/UserTeam';
import TotalPoints from '../components/dashboard/TotalPoints';
import MatchPerformance from '../components/dashboard/MatchPerformance';
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview';
import UserProfileSummary from '../components/dashboard/UserProfileSummary';
import axios from 'axios';

const Dashboard = () => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [topTeam, setTopTeam] = useState(null);
    const [mvps, setMvps] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const profileRes = await axios.get("http://localhost:5000/api/v1/auth/profile", { headers });
                setUserProfile(profileRes.data);

                const teamsRes = await axios.get("http://localhost:5000/api/v1/teams/", { headers });
                const allTeams = teamsRes.data || [];
                const highestTeam = allTeams.reduce((max, t) => t.totalPoints > max.totalPoints ? t : max, allTeams[0]);
                setTopTeam(highestTeam);

                const matchesRes = await axios.get("http://localhost:5000/api/v1/matches/");
                const matches = matchesRes.data;

                const mvpList = highestTeam.processedMatches.map(matchId => {
                    const match = matches.find(m => m._id === matchId);
                    if (!match) return null;
                    let allPlayers = match.innings.flatMap(inning => inning.batting);
                    let mvp = allPlayers.reduce((max, p) => p.fantasyPoints > max.fantasyPoints ? p : max, allPlayers[0]);
                    return { match: match.title, mvp: mvp.playerName, points: mvp.fantasyPoints };
                }).filter(Boolean);

                setMvps(mvpList);
                setDataLoaded(true);
            } catch (err) {
                console.error("Dashboard data fetch failed:", err);
                setDataLoaded(true);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="w-full mx-2 lg:mx-32 h-screen gap-4 p-4  bg-gray-900 text-gray-100">
            <h1 className="text-2xl font-bold text-blue-400">User Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 space-y-4">
                    <UserTeam team={topTeam} />
                    <MatchPerformance matches={mvps} />
                </div>
                <div className="space-y-4">
                    <TotalPoints points={topTeam?.totalPoints} />
                    <LeaderboardPreview />
                    {/* <UserProfileSummary user={userProfile} /> */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;