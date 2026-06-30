import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';
import { Modal } from './friend-match/FriendMatchModal';
import { JoiningState } from './friend-match/JoiningState';
import { WaitingState } from './friend-match/WaitingState';

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
    toast.success('Link copied to clipboard!');
  };

  return (
    <Modal>
      {inviteId && !started ? (
        <JoiningState />
      ) : !inviteId && !waiting ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Create a Friend Match</h2>
          <p className="text-slate-300">Preparing your game room...</p>
        </div>
      ) : (
        <WaitingState gameId={gameId ?? ''} onCopy={copyLink} />
      )}
    </Modal>
  );
};
