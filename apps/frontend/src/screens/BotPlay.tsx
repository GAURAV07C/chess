import React, { useEffect, useState } from 'react';
import { Layout } from '../layout';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { v4 as uuidv4 } from 'uuid';
import { ClipboardCopyIcon } from 'lucide-react';

export const BotPlay: React.FC = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [gameId] = useState<string>(uuidv4());
  const [created, setCreated] = useState(false);

  // Create a new game with bot as opponent via WS (assumes backend supports BOT_JOIN)
  useEffect(() => {
    if (socket && !created) {
      socket.send(JSON.stringify({ type: 'BOT_JOIN', payload: { gameId } }));
      setCreated(true);
    }
  }, [socket, created, gameId]);

  // Redirect to the normal game view when the game is ready
  useEffect(() => {
    if (created) {
      navigate(`/game/${gameId}`);
    }
  }, [created, gameId, navigate]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-[#030611] text-white flex items-center justify-center p-4"
      >
        <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-6 shadow-xl max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Starting Bot Game…</h2>
          <p className="text-slate-300 mb-4">Your game is being prepared. You will be redirected shortly.</p>
          <ClipboardCopyIcon size={48} className="text-amber-500 animate-pulse" />
        </div>
      </motion.div>
    </Layout>
  );
};
