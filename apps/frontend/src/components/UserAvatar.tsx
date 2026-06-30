import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, TrendingUp, Swords } from 'lucide-react';
import { useUser } from '@repo/store/useUser';
import { Metadata, Player } from '../screens/gameConstants';

interface Profile {
  stats: {
    wins: number;
    losses: number;
    draws: number;
  };
}

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  const [showProfile, setShowProfile] = useState(false);
  const [profile] = useState<Profile | null>(null);
  const [loading] = useState(false);

  let player: Player | null = null;
  if (gameMetadata && user) {
    if (gameMetadata.blackPlayer.id === user.id) {
      player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
    } else {
      player = self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;
    }
  }

  if (!gameMetadata || !player) return null;
  const avatarLetter = player.name.charAt(0).toUpperCase();

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

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : profile ? (
                  <div className="mt-4 flex-1 overflow-auto">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <Trophy className="w-4 h-4 text-amber-400 mx-auto" />
                        <p className="text-white font-bold">{profile.stats.wins}</p>
                        <p className="text-slate-500 text-[10px]">Wins</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <Swords className="w-4 h-4 text-rose-400 mx-auto" />
                        <p className="text-white font-bold">{profile.stats.losses}</p>
                        <p className="text-slate-500 text-[10px]">Losses</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-xl p-2 text-center border border-slate-800/60">
                        <TrendingUp className="w-4 h-4 text-sky-400 mx-auto" />
                        <p className="text-white font-bold">{profile.stats.draws}</p>
                        <p className="text-slate-500 text-[10px]">Draws</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};
