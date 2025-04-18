import React from 'react';
import UserTeam from '../components/dashboard/UserTeam';
import TotalPoints from '../components/dashboard/TotalPoints';
import MatchPerformance from '../components/dashboard/MatchPerformance';
import LeaderboardPreview from '../components/dashboard/LeaderboardPreview';
import UserProfileSummary from '../components/dashboard/UserProfileSummary';

const Dashboard = () => {
    return (
        <div className="px-4 lg:px-12 pt-16 pb-8 w-full min-h-screen bg-gray-900 text-gray-100">
            <h1 className="text-2xl font-bold text-blue-400">🏠 User Dashboard</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                <div className="lg:col-span-2 space-y-4">
                    <UserTeam />
                    <MatchPerformance />
                </div>
                <div className="space-y-4">
                    <TotalPoints />
                    <LeaderboardPreview />
                    <UserProfileSummary />
                </div>
            </div>
        </div>

    );
};

export default Dashboard;
