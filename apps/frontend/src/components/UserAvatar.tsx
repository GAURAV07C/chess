import { useState } from 'react';
import { useUser } from '@repo/store/useUser';
import { Metadata, Player } from '../screens/gameConstants';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface UserAvatarProps {
  gameMetadata: Metadata | null;
  self?: boolean;
}

export const UserAvatar = ({ gameMetadata, self }: UserAvatarProps) => {
  const user = useUser();
  const [showProfile, setShowProfile] = useState(false);

  if (!gameMetadata) return null;

  let player: Player;
  if (gameMetadata.blackPlayer.id === user?.id) {
    player = self ? gameMetadata.blackPlayer : gameMetadata.whitePlayer;
  } else {
    player = self ? gameMetadata.whitePlayer : gameMetadata.blackPlayer;
  }

  const avatarLetter = player?.name?.charAt(0).toUpperCase() || '?';

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

      <AnimatePresence>
        {showProfile && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-950/95 border border-slate-800 rounded-2xl p-5 max-w-sm w-full mx-4 relative"
            >
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
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
                </div>
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <p className="text-amber-400 font-bold text-sm">Ready to play!</p>
                  <p className="text-slate-500 text-xs">Click anywhere to close</p>
                </div>
              </div>
            </motion.div>

            <div className="fixed inset-0 -z-10" onClick={() => setShowProfile(false)} />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
