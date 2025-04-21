import React from "react";

const Home = () => {
    return (
        <div className="bg-gray-900 min-h-screen px-4 py-10 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl bg-gradient-to-br from-gray-800 to-gray-900 p-4 sm:p-6 md:p-10 rounded-2xl shadow-2xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-400 text-center mb-4">
                    Welcome to FantasyCrick 🏏
                </h1>
                <p className="text-base sm:text-lg text-gray-300 text-center mb-8 max-w-xl mx-auto">
                    Build your dream IPL team and compete with others in a season-long fantasy league!
                </p>

                <div className="flex flex-col lg:flex-row flex-wrap gap-6 justify-center">
                    <div className="w-full sm:w-4/5 md:w-[90%] lg:w-[30%] bg-gray-800 rounded-xl p-6 shadow-inner">
                        <h2 className="text-xl font-semibold text-blue-300 mb-2">🏆 Core Concept</h2>
                        <p className="text-gray-400">
                            A season-long fantasy IPL game where users create a team and compete on leaderboards.
                            Once the playing XI is set, it can't be changed match-by-match.
                        </p>
                    </div>

                    <div className="w-full sm:w-4/5 md:w-[90%] lg:w-[30%] bg-gray-800 rounded-xl p-6 shadow-inner">
                        <h2 className="text-xl font-semibold text-blue-300 mb-2">👥 Team Rules</h2>
                        <ul className="list-disc list-inside text-gray-400 space-y-1">
                            <li>Select a 15-player squad</li>
                            <li>Players can be selected only once</li>
                            <li>Pick players from at least 6–8 IPL teams</li>
                            <li>Uncapped players earn bonus points</li>
                            <li>Captain and Vice-Captain earn bonus points</li>
                        </ul>
                    </div>

                    <div className="w-full sm:w-4/5 md:w-[90%] lg:w-[30%] bg-gray-800 rounded-xl p-6 shadow-inner">
                        <h2 className="text-xl font-semibold text-blue-300 mb-2">📈 Leaderboard</h2>
                        <p className="text-gray-400">
                            Compete on yearly and branch-wise leaderboards, calculated based on performance in at least 10 matches.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
