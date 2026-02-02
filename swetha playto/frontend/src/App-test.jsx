import { useState } from 'react';
import './index.css';

function App() {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">
                    Playto Community Feed
                </h1>
                <p className="text-gray-700">
                    If you can see this, React is working! 🎉
                </p>
                <div className="mt-4 p-4 bg-white rounded-lg shadow">
                    <p>Testing basic rendering...</p>
                </div>
            </div>
        </div>
    );
}

export default App;
