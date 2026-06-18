import React from 'react';

// Placeholder component for Tournaments page with premium glassmorphism styling
export default function Tournaments() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-bgMain">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-xl max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Tournaments</h1>
        <p className="text-gray-300 text-center">
          Upcoming tournaments will be listed here soon.
        </p>
      </div>
    </div>
  );
};
