import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useUser } from '@repo/store/useUser';
import { Metadata, Player } from '@/screens/gameConstants';
import { ProfileStats } from '@/screens/profile/ProfileStats';
import { GameHistory } from '@/screens/profile/GameHistory';

interface Profile {
  user: {
    id: string;
    name: string;
    email: string;
    provider: string;
    rating: number;
    username: string;
    createdAt: string;
  };
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    currentStreak: number;
    currentStreakType: 'win' | 'loss' | null;
    bestWinStreak: number;
  };
  currentWinStreak: number;
  recentGames: {
    id: string;
    opponentName: string;
    result: string;
    color: string;
  }[];
}

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let player: Player | null = null;
  if (gameMetadata && user) {
    if (gameMetadata.blackPlayer.id === user.id) {
      player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
    } else {
      player = self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;
    }
  }

  useEffect(() => {
    if (!showProfile || !player) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setProfile(null);
    fetch(`${BACKEND_URL}/v1/profile/${player.id}`, {
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => 'Failed to load profile');
          throw new Error(text || 'Failed to load profile');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Could not load profile');
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [showProfile, player]);

  if (!gameMetadata || !player) return null;
  const avatarLetter = player.name.charAt(0).toUpperCase();

  const winRate = profile
    ? profile.stats.totalGames > 0
      ? ((profile.stats.wins / profile.stats.totalGames) * 100).toFixed(1)
      : '0'
    : '0';

  return (
    <>
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowProfile(true)}>
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold text-sm">
          {avatarLetter}
        </div>
        <span className="text-white text-sm font-medium">{player.name}</span>
      </div>

      {showProfile &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
              onClick={() => setShowProfile(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl max-h-[85vh] flex flex-col"
              >
                <button
                  onClick={() => setShowProfile(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 text-3xl font-black mx-auto">
                    {avatarLetter}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-3">{player.name}</h3>
                  <p className="text-slate-400 text-sm">{player.isGuest ? 'Guest' : 'Player'}</p>
                </div>

                <div className="mt-4 flex-1 overflow-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : error || !profile ? (
                    <p className="text-slate-500 text-sm py-6 text-center">{error || 'No profile data'}</p>
                  ) : (
                    <div className="space-y-4">
                      <ProfileStats
                        stats={profile.stats}
                        winRate={winRate}
                        currentWinStreak={profile.currentWinStreak}
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">
                          Recent Games
                        </h3>
                        <GameHistory games={profile.recentGames} />
                      </div>
                    </div>
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
