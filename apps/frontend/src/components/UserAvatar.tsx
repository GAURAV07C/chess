import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@repo/store/useUser';
import { Metadata, Player } from '../screens/gameConstants';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, TrendingUp, Swords, MessageSquare, Smile } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useParams } from 'react-router-dom';

interface RecentGame {
  id: string;
  opponentId: string;
  opponentName: string | null;
  result: string;
  color: string;
  date: string;
}

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | null;
  bestWinStreak: number;
}

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    provider: string;
    rating: number;
    username: string | null;
    createdAt: string;
  };
  stats: UserStats;
  currentWinStreak: number;
  recentGames: RecentGame[];
}

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  const socket = useSocket();
  const { gameId } = useParams();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatBlocked, setChatBlocked] = useState(false);
  const [emojiBlocked, setEmojiBlocked] = useState(false);
  const [customChatAccepted, setCustomChatAccepted] = useState(false);
  const [customChatPending, setCustomChatPending] = useState(false);

  let player: Player | null = null;
  if (gameMetadata) {
    if (gameMetadata.blackPlayer.id === user?.id) {
      player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
    } else {
      player = self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;
    }
  }

  const targetPlayerId =
    gameMetadata && user
      ? gameMetadata.blackPlayer.id === user.id
        ? gameMetadata.whitePlayer.id
        : gameMetadata.blackPlayer.id
      : null;

  useEffect(() => {
    if (!socket || !targetPlayerId || !gameId) return;

    const handler = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'chat_blocked':
            setChatBlocked(true);
            break;
          case 'chat_unblocked':
            setChatBlocked(false);
            break;
          case 'emoji_blocked':
            setEmojiBlocked(true);
            break;
          case 'emoji_unblocked':
            setEmojiBlocked(false);
            break;
          case 'custom_chat_accepted':
            setCustomChatAccepted(true);
            setCustomChatPending(false);
            break;
          case 'custom_chat_rejected':
            setCustomChatAccepted(false);
            setCustomChatPending(false);
            break;
          case 'custom_chat_request':
            setCustomChatPending(true);
            break;
        }
      } catch (e) {
        console.error('Failed to parse chat message', e);
      }
    };

    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket, targetPlayerId, gameId]);

  const sendChatAction = (type: string, payload: Record<string, string>) => {
    if (!socket || !targetPlayerId) return;
    socket.send(JSON.stringify({ type, payload }));
  };

  const handleBlockChat = () => {
    sendChatAction('BLOCK_CHAT', { targetUserId: targetPlayerId as string });
    setChatBlocked(true);
    setShowChatModal(false);
  };

  const handleUnblockChat = () => {
    sendChatAction('UNBLOCK_CHAT', { targetUserId: targetPlayerId as string });
    setChatBlocked(false);
    setShowChatModal(false);
  };

  const handleBlockEmoji = () => {
    sendChatAction('BLOCK_EMOJI', { targetUserId: targetPlayerId as string });
    setEmojiBlocked(true);
    setShowChatModal(false);
  };

  const handleUnblockEmoji = () => {
    sendChatAction('UNBLOCK_EMOJI', { targetUserId: targetPlayerId as string });
    setEmojiBlocked(false);
    setShowChatModal(false);
  };

  const handleRequestCustomChat = () => {
    sendChatAction('REQUEST_CUSTOM_CHAT', { targetUserId: targetPlayerId as string });
    setCustomChatPending(true);
    setShowChatModal(false);
  };

  useEffect(() => {
    if (!showProfile || !player?.id) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/v1/profile/${player.id}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [showProfile, player]);

  if (!gameMetadata) return null;

  const avatarLetter = player?.name?.charAt(0).toUpperCase() || '?';

  const getResultColor = (result: string) => {
    if (result === 'WHITE_WINS') return 'text-emerald-400';
    if (result === 'BLACK_WINS') return 'text-rose-400';
    return 'text-slate-400';
  };

  const getResultLabel = (result: string, color: string) => {
    if (result === 'DRAW') return 'Draw';
    const won = (color === 'white' && result === 'WHITE_WINS') || (color === 'black' && result === 'BLACK_WINS');
    return won ? 'Win' : 'Loss';
  };

  return (
    <>
      <div
        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowProfile(true)}
        title="View Profile"
      >
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">
          {avatarLetter}
        </div>
        <span className="text-white text-sm font-medium">{player?.name}</span>
      </div>

      {/* Chat & Emoji icons below avatar */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => setShowChatModal(true)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Chat"
        >
          <MessageSquare size={14} />
        </button>
        <button
          onClick={() => setShowChatModal(true)}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Emoji"
        >
          <Smile size={14} />
        </button>
      </div>

      {showProfile &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setShowProfile(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950/95 border border-slate-800 rounded-2xl p-5 max-w-sm w-full mx-4 relative shadow-2xl max-h-[85vh] flex flex-col"
              >
                <button
                  onClick={() => setShowProfile(false)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer z-10"
                  title="Close"
                >
                  <X size={20} />
                </button>

                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 text-3xl font-serif font-black mx-auto mt-2">
                    {avatarLetter}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{player?.name}</h3>
                    <p className="text-slate-400 text-sm mt-2">
                      {player?.isGuest ? 'Guest Player' : 'Registered Player'}
                    </p>
                    {profile?.user.rating && (
                      <p className="text-amber-400 text-sm font-bold mt-1">Rating: {profile.user.rating}</p>
                    )}
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : profile ? (
                  <div className="mt-4 flex-1 overflow-hidden flex flex-col">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-lg">{profile.stats.wins}</p>
                        <p className="text-slate-500 text-xs">Wins</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <Swords className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-lg">{profile.stats.losses}</p>
                        <p className="text-slate-500 text-xs">Losses</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <TrendingUp className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                        <p className="text-white font-bold text-lg">{profile.stats.draws}</p>
                        <p className="text-slate-500 text-xs">Draws</p>
                      </div>
                    </div>

                    {profile.recentGames.length > 0 && (
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <p className="text-slate-300 text-sm font-semibold mb-2">Recent Games</p>
                        <div className="space-y-2">
                          {profile.recentGames.map((game) => (
                            <div
                              key={game.id}
                              className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800/50"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  vs {game.opponentName || 'Unknown'}
                                </p>
                                <p className="text-slate-500 text-xs truncate">
                                  {game.color === 'white' ? 'White' : 'Black'} •{' '}
                                  {new Date(game.date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`text-xs font-bold ${getResultColor(game.result)}`}>
                                {getResultLabel(game.result, game.color)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}

      {/* Chat Settings Modal */}
      {showChatModal &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setShowChatModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950/95 border border-slate-800 rounded-2xl p-5 max-w-sm w-full mx-4 relative shadow-2xl"
              >
                <button
                  onClick={() => setShowChatModal(false)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer z-10"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-bold text-white mb-4">Chat with {player?.name}</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Chat</span>
                    {chatBlocked ? (
                      <button
                        onClick={handleUnblockChat}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={handleBlockChat}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition-colors"
                      >
                        Block
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Emoji</span>
                    {emojiBlocked ? (
                      <button
                        onClick={handleUnblockEmoji}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={handleBlockEmoji}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-500/30 transition-colors"
                      >
                        Block
                      </button>
                    )}
                  </div>

                  {!customChatAccepted && !customChatPending && (
                    <button
                      onClick={handleRequestCustomChat}
                      className="w-full mt-2 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg text-sm font-bold hover:bg-amber-500/30 transition-colors"
                    >
                      Request Custom Chat
                    </button>
                  )}

                  {customChatPending && (
                    <p className="text-xs text-slate-400 text-center mt-2">Custom chat request pending...</p>
                  )}

                  {customChatAccepted && (
                    <p className="text-xs text-emerald-400 text-center mt-2">Custom chat accepted</p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
