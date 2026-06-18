import React, { useState } from 'react';
import { ChessBoard } from '../components/ChessBoard';
import { useChessBoardStore } from '@repo/store/chessBoard';
import { Layout } from '../layout';
import { motion } from 'motion/react';

export const LocalPlay: React.FC = () => {
  // Simple local two‑player state: shared board from store
  const board = useChessBoardStore(state => state.board);
  const setBoard = useChessBoardStore(state => state.setBoard);
  const [turn, setTurn] = useState<'white' | 'black'>('white');

  const handleMove = (move) => {
    // move is { from, to, promotion? }
    // this is a very naive implementation assuming ChessBoard provides onMove callback
    // In a real app you would use chess.js to validate and update the board
    // Here we just toggle turn
    setTurn(prev => (prev === 'white' ? 'black' : 'white'));
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-[#030611] text-white flex flex-col items-center justify-center p-4"
      >
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-4">Local Play</h2>
          <p className="text-center text-slate-300 mb-6">
            Two players on the same device. The board updates for both players.
          </p>
          <div className="flex flex-col items-center">
            <ChessBoard
              board={board}
              onMove={handleMove}
              orientation={turn}
            />
            <div className="mt-4 text-lg font-medium">
              Current turn: <span className="text-amber-400 capitalize">{turn}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};
