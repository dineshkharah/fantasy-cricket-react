import React, { useEffect, useState } from 'react';
import UserTeam from '../components/dashboard/UserTeam';
import TotalPoints from '../components/dashboard/TotalPoints';
import MatchPerformance from '../components/dashboard/MatchPerformance';
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview';
import UserProfileSummary from '../components/dashboard/UserProfileSummary';
import axios from '../utils/axios';

const Dashboard = () => {
    const [dataLoaded, setDataLoaded] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [allTeams, setAllTeams] = useState([]);
    const [mvps, setMvps] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const profileRes = await axios.get("/api/v1/auth/profile", { headers });
                setUserProfile(profileRes.data);

                const teamsRes = await axios.get("/api/v1/teams/", { headers });
                const allFetchedTeams = teamsRes.data || [];
                setAllTeams(allFetchedTeams);

                const highestTeam = allFetchedTeams.reduce((max, t) => t.totalPoints > max.totalPoints ? t : max, allFetchedTeams[0]);

                const matchesRes = await axios.get("/api/v1/matches/");
                const matches = matchesRes.data;

                const mvpList = highestTeam?.processedMatches?.map(matchId => {
                    const match = matches.find(m => m._id === matchId);
                    if (!match) return null;
                    let allPlayers = match.innings.flatMap(inning => inning.batting);
                    let mvp = allPlayers.reduce((max, p) => p.fantasyPoints > max.fantasyPoints ? p : max, allPlayers[0]);
                    return { match: match.title, mvp: mvp.playerName, points: mvp.fantasyPoints };
                }).filter(Boolean) || [];

                setMvps(mvpList);
                setDataLoaded(true);
            } catch (err) {
                console.error("Dashboard data fetch failed:", err);
                setDataLoaded(true);
            }
        };
        fetchDashboardData();
    }, []);

    const handleDeleteTeam = async (teamId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this team?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`/api/v1/teams/${teamId}`, { headers });

            // Remove from state after successful deletion
            const updatedTeams = allTeams.filter((team) => team._id !== teamId);
            setAllTeams(updatedTeams);
        } catch (err) {
            console.error("Failed to delete team:", err);
        }
    };


    return (
        <div className="w-full mx-2 lg:mx-32 h-full min-h-screen gap-4 p-4 bg-gray-900 text-gray-100 pt-16 px-4">
            <h1 className="text-2xl font-bold text-blue-400">User Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 space-y-4">
                    <UserTeam teams={allTeams} onDelete={handleDeleteTeam} />
                    <MatchPerformance matches={mvps} />
                </div>
                <div className="space-y-4">
                    <TotalPoints teams={allTeams} />
                    <LeaderboardPreview />
                    {/* <UserProfileSummary user={userProfile} /> */}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
