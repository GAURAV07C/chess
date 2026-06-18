import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '@repo/store/useUser';
import { v4 as uuidv4 } from 'uuid';
import { ClipboardCopyIcon } from 'lucide-react';

// Simple modal style for premium look
const Modal = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
    <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 shadow-xl max-w-md w-full">
      {children}
    </div>
  </div>
);

export const FriendMatch: React.FC = () => {
  const { inviteId } = useParams<{ inviteId?: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const user = useUser();
  const [generatedId, setGeneratedId] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);

  // If we have an inviteId in URL, try to join that game
  useEffect(() => {
    if (inviteId && socket) {
      // Send join request to backend via WS (assumes backend handles FRIEND_JOIN)
      socket.send(
        JSON.stringify({ type: 'FRIEND_JOIN', payload: { gameId: inviteId, token: user?.token } })
      );
      setJoined(true);
    }
  }, [inviteId, socket, user]);

  // If we are the creator, generate an ID and display shareable link
  useEffect(() => {
    if (!inviteId) {
      const id = uuidv4();
      setGeneratedId(id);
    }
  }, [inviteId]);

  const copyLink = async () => {
    const link = `${window.location.origin}/game/friend/${generatedId}`;
    await navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  // When both players are ready, navigate to the actual game screen
  useEffect(() => {
    if (joined) {
      // Redirect to /game/:gameId (reuse existing Game component)
      navigate(`/game/${inviteId}`);
    }
  }, [joined, inviteId, navigate]);

  return (
    <Modal>
      {!inviteId ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Create a Friend Match</h2>
          <p className="text-slate-300 mb-4">
            Share the link below with a friend. When they open it, the game will start.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <input
              readOnly
              value={`${window.location.origin}/game/friend/${generatedId}`}
              className="bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 rounded w-full"
            />
            <button onClick={copyLink} className="p-2 bg-amber-500 rounded hover:bg-amber-600">
              <ClipboardCopyIcon size={20} className="text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Waiting for opponent...</h2>
          <p className="text-slate-300">Your friend should join the link you shared.</p>
        </div>
      )}
    </Modal>
  );
};
