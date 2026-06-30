import { UserRound } from 'lucide-react';

type ProfileHeaderProps = {
  greeting: string;
  userName: string;
  onProfileClick: () => void;
};

export const ProfileHeader = ({ greeting, userName, onProfileClick }: ProfileHeaderProps) => (
  <div className="space-y-2">
    <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
      {greeting}, <span className="text-amber-400">{userName || 'Player'}</span>
      <button
        onClick={onProfileClick}
        className="ml-2 p-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 transition-colors"
        title="Profile"
      >
        <UserRound className="w-5 h-5" />
      </button>
    </h1>
    <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
      Ready for your next battle? Choose a mode and start playing.
    </p>
  </div>
);
