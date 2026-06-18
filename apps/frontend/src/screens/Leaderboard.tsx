import React from 'react';

// Simple placeholder for Leaderboard with glassmorphism styling
export const Leaderboard: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bgMain">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-lg max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">
          Leaderboard
        </h1>
        <p className="text-gray-300 text-center">
          Coming soon – top challengers will be displayed here.
        </p>
      </div>
    </div>
  );
};
