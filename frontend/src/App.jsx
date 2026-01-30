import { useState } from 'react';
import Feed from './components/Feed';
import Leaderboard from './components/Leaderboard';
import './index.css';

function App() {
    const [currentUser, setCurrentUser] = useState(null);

    const handleLogin = () => {
        const username = prompt('Enter username (user1-user5):');
        const password = prompt('Enter password (password123):');

        if (username && password === 'password123') {
            localStorage.setItem('authToken', `mock-token-${username}`);
            setCurrentUser(username);
            alert(`Logged in as ${username}`);
            window.location.reload();
        } else {
            alert('Invalid credentials');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        window.location.reload();
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <header className="glass-card sticky top-0 z-50 border-b-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl transform hover:scale-110 transition-transform duration-300 relative">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                                <span className="relative z-10">P</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold gradient-text">
                                    Playto Community
                                </h1>
                                <p className="text-sm text-purple-600 font-medium">Connect. Share. Grow.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <>
                                    <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                                        <span className="text-purple-700 font-semibold">Welcome, <strong className="gradient-text">{currentUser}</strong></span>
                                    </div>
                                    <button onClick={handleLogout} className="btn-secondary">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <button onClick={handleLogin} className="btn-primary">
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Feed - Takes up 2 columns on large screens */}
                    <div className="lg:col-span-2">
                        <Feed />
                    </div>

                    {/* Leaderboard - Takes up 1 column on large screens */}
                    <div className="lg:col-span-1">
                        <Leaderboard />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="glass-card mt-16 border-t-0 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center">
                        <p className="gradient-text font-bold text-lg mb-2">
                            Built with Django + React
                        </p>
                        <p className="text-slate-600 text-sm mb-1">
                            for the Playto Engineering Challenge
                        </p>
                        <p className="text-purple-600 font-semibold text-sm">
                            Developed by Sanjay Panneerselvan
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
