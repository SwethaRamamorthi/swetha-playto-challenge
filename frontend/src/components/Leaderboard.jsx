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
            <div className="card card-glossy p-8">
                <h2 className="text-2xl font-bold gradient-text mb-6 flex items-center gap-2">
                    <span className="text-3xl">🏆</span>
                    <span>Top Contributors (24h)</span>
                </h2>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-20 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl"></div>
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

    const getRankGradient = (rank) => {
        switch (rank) {
            case 1: return 'from-yellow-400 via-yellow-500 to-orange-500';
            case 2: return 'from-slate-300 via-slate-400 to-slate-500';
            case 3: return 'from-orange-400 via-orange-500 to-red-500';
            default: return 'from-purple-400 via-pink-400 to-blue-400';
        }
    };

    const getRankBorder = (rank) => {
        switch (rank) {
            case 1: return 'border-yellow-300 shadow-yellow-200';
            case 2: return 'border-slate-300 shadow-slate-200';
            case 3: return 'border-orange-300 shadow-orange-200';
            default: return 'border-purple-300 shadow-purple-200';
        }
    };

    return (
        <div className="card card-glossy p-8 sticky top-24 transform hover:scale-[1.02] transition-transform duration-300">
            <div className="mb-6">
                <h2 className="text-2xl font-bold gradient-text mb-2 flex items-center gap-2">
                    <span className="text-3xl animate-float">🏆</span>
                    <span>Top Contributors</span>
                </h2>
                <p className="text-purple-600 font-semibold text-sm">Last 24 Hours</p>
            </div>

            {leaders.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                    <p className="text-slate-500 text-lg">No activity in the last 24 hours</p>
                    <p className="text-slate-400 text-sm mt-2">Be the first to earn karma! ⭐</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leaders.map((leader, index) => (
                        <div
                            key={leader.user_id}
                            className={`relative overflow-hidden rounded-2xl border-2 ${getRankBorder(leader.rank)} bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-sm p-5 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}
                            style={{
                                animationDelay: `${index * 100}ms`
                            }}
                        >
                            {/* Rank Badge */}
                            <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                <div className={`absolute transform rotate-45 bg-gradient-to-br ${getRankGradient(leader.rank)} text-white text-xs font-bold py-1 right-[-35px] top-[10px] w-[100px] text-center shadow-lg`}>
                                    #{leader.rank}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Avatar with Rank Emoji */}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRankGradient(leader.rank)} flex items-center justify-center text-4xl shadow-xl relative overflow-hidden group`}>
                                    <div className="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors shimmer"></div>
                                    <span className="relative z-10">{getRankEmoji(leader.rank)}</span>
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="font-bold text-xl text-slate-800 mb-1">{leader.username}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-200">
                                            <span className="text-orange-600 font-bold text-sm flex items-center gap-1">
                                                <span>⭐</span>
                                                <span>{leader.karma_24h}</span>
                                                <span className="text-xs">karma</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shine Effect */}
                            {leader.rank <= 3 && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer pointer-events-none"></div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-6 border-t-2 border-gradient-to-r from-purple-100 to-pink-100">
                <div className="flex items-center justify-center gap-2 text-xs text-purple-600 font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Updates every 30 seconds</span>
                </div>
            </div>
        </div>
    );
}
