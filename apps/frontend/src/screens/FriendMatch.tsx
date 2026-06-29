import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { ClipboardCopyIcon } from 'lucide-react';

const Modal = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 shadow-xl max-w-md w-full">{children}</div>
  </div>
);

export const FriendMatch: React.FC = () => {
  const { inviteId } = useParams<{ inviteId?: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  const [gameId, setGameId] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const sendInitGame = useCallback(
    (gid?: string) => {
      if (!socket) return;
      const payload = gid ? { gameId: gid } : undefined;
      socket.send(JSON.stringify({ type: 'init_game', payload }));
    },
    [socket]
  );

  useEffect(() => {
    if (!socket) return;
    const onMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      const gid = message.gameId || message.payload?.gameId;
      if (message.type === 'game_added' && gid) {
        setGameId(gid);
        setWaiting(true);
      }
      if (message.type === 'init_game') {
        setGameId(message.payload?.gameId);
        setStarted(true);
      }
    };
    socket.onmessage = onMessage;
    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  useEffect(() => {
    if (started && gameId) {
      navigate(`/game/${gameId}`);
    }
  }, [started, gameId, navigate]);

  useEffect(() => {
    if (!socket || started) return;
    if (inviteId) {
      sendInitGame(inviteId);
    } else {
      sendInitGame();
    }
  }, [socket, inviteId, started, sendInitGame]);

  const copyLink = async () => {
    if (!gameId) return;
    const link = `${window.location.origin}/game/friend/${gameId}`;
    await navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <Modal>
      {inviteId && !started ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Joining friend match...</h2>
          <p className="text-slate-300">Waiting for opponent to start the game.</p>
        </div>
      ) : !inviteId && !waiting ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Create a Friend Match</h2>
          <p className="text-slate-300">Preparing your game room...</p>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Create a Friend Match</h2>
          <p className="text-slate-300 mb-4">
            Share the link below with a friend. When they open it, the game will start.
          </p>
          {waiting && (
            <div className="flex items-center justify-center space-x-2">
              <input
                readOnly
                value={`${window.location.origin}/game/friend/${gameId}`}
                className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded w-full"
              />
              <button onClick={copyLink} className="p-2 bg-amber-500 rounded hover:bg-amber-600">
                <ClipboardCopyIcon size={20} className="text-white" />
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
