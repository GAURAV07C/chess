import { useState } from 'react';

const EMOJIS = ['👋', '👍', '😂', '🔥', '👏', '😮', '😢', '🎉', '💪', '🤔', '😎', '🥺'];

export const Emoji = ({
  gameId,
  socket,
  floatingEmoji,
}: {
  gameId?: string;
  socket: WebSocket | null;
  floatingEmoji: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  const sendEmoji = (emoji: string) => {
    if (!socket || !gameId) return;
    socket.send(
      JSON.stringify({
        type: 'EMOJI',
        payload: {
          gameId,
          emoji,
          senderId: currentUser,
          senderName: localStorage.getItem('userName') || 'Me',
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
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
        >
          😊 Emoji
        </button>

        {isOpen && (
          <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-xl z-[9999] backdrop-blur-sm">
            <div className="grid grid-cols-5 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
