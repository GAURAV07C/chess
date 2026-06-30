import { motion } from 'motion/react';
import { ArrowLeft, LogOut } from 'lucide-react';

type ProfileHeaderProps = {
  userName: string;
  username: string;
  provider: string;
  createdAt: string;
  onBack: () => void;
  onLogout: () => void;
};

export const ProfileHeader = ({ userName, username, provider, createdAt, onBack, onLogout }: ProfileHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col md:flex-row md:items-center gap-4"
  >
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
        title="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 text-2xl font-serif font-black">
        {userName?.charAt(0).toUpperCase() || 'P'}
      </div>
      <div>
        <h2 className="text-2xl font-serif font-extrabold text-white">{userName || 'Player'}</h2>
        <p className="text-slate-400 text-sm">
          @{username || 'guest'}
          <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
            {provider}
          </span>
        </p>
        <p className="text-slate-500 text-xs mt-1">Joined {new Date(createdAt).toLocaleDateString()}</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  </motion.div>
);
