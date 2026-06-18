import React from 'react';
import { Layout } from '../layout';
import { motion } from 'motion/react';

export const PuzzleRush: React.FC = () => (
  <Layout>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#030611] text-white flex items-center justify-center p-4"
    >
      <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 shadow-xl max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-amber-400">Puzzle Rush</h2>
        <p className="text-slate-300">Solve as many puzzles as you can before time runs out. (Feature coming soon!)</p>
      </div>
    </motion.div>
  </Layout>
);
