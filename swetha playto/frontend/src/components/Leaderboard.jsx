import { useState, useEffect } from 'react';
import { leaderboardAPI } from '../api';

export default function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const response = await leaderboardAPI.get();
            setLeaders(response.data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏆</span>
                    <span>Top Contributors</span>
                </h2>
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    const getRankEmoji = (rank) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return '🏅';
        }
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case 1: return 'bg-yellow-50 border-yellow-200 text-yellow-700';
            case 2: return 'bg-gray-50 border-gray-300 text-gray-700';
            case 3: return 'bg-orange-50 border-orange-200 text-orange-700';
            default: return 'bg-blue-50 border-blue-200 text-blue-700';
        }
    };

    return (
        <div className="card p-6 sticky top-20">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <span>🏆</span>
                    <span>Top Contributors</span>
                </h2>
                <p className="text-sm text-gray-600">Last 24 Hours</p>
            </div>

            {leaders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500">No activity in the last 24 hours</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to earn karma! ⭐</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaders.map((leader) => (
                        <div
                            key={leader.user_id}
                            className={`relative rounded-lg border-2 p-4 transition-all duration-200 hover:scale-105 ${getRankColor(leader.rank)}`}
                        >
                            {/* Rank Badge */}
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shadow-sm">
                                #{leader.rank}
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Rank Emoji */}
                                <div className="text-3xl">
                                    {getRankEmoji(leader.rank)}
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{leader.username}</div>
                                    <div className="badge bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs mt-1">
                                        <span>⭐</span>
                                        <span>{leader.karma_24h} karma</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Updates every 30 seconds</span>
                </div>
            </div>
        </div>
    );
}
