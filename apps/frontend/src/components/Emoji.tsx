import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const EMOJIS = ['👋', '👍', '😂', '🔥', '👏', '😮', '😢', '🎉', '💪', '🤔', '😎', '🥺'];

interface User {
  id?: string;
  name: string;
}

export const Emoji = ({
  gameId,
  socket,
  floatingEmoji,
  user,
}: {
  gameId?: string;
  socket: WebSocket | null;
  floatingEmoji: string | null;
  user: User | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = user?.id ?? null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen]);

  const sendEmoji = (emoji: string) => {
    if (!socket || !gameId) return;
    socket.send(
      JSON.stringify({
        type: 'EMOJI',
        payload: {
          gameId,
          emoji,
          senderId: currentUser,
          senderName: user?.name || 'Me',
        },
      })
    );

    setIsOpen(false);
  };

  return (
    <>
      {floatingEmoji && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 text-5xl animate-bounce z-[10000] pointer-events-none">
          {floatingEmoji}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
      >
        😊 Emoji
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Send Emoji</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xl px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendEmoji(emoji)}
                  className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};
