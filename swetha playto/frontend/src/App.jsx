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
        <div className="min-h-screen bg-gray-50">
            {/* Modern Header */}
            <header className="glass-card sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                P
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Playto Community
                                </h1>
                                <p className="text-sm text-gray-600">Connect. Share. Grow.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {currentUser ? (
                                <>
                                    <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                        <span className="text-blue-700 font-medium">Welcome, <strong>{currentUser}</strong></span>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Modern Footer */}
            <footer className="border-t border-gray-200 bg-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center">
                        <p className="text-gray-900 font-semibold mb-1">
                            Built with Django + React
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                            for the Playto Engineering Challenge
                        </p>
                        <p className="text-blue-600 font-medium text-sm">
                            Developed by Swetha Ramamoorthi
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
