import { useMemo } from 'react';
import { TrendingUp, Star, Swords, Flame } from 'lucide-react';
import { type ProfileResponse } from '../Dashboard';

type QuickStat = {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
};

type QuickStatsProps = {
  profile: ProfileResponse | null;
};

export const QuickStats = ({ profile }: QuickStatsProps) => {
  const stats = useMemo<QuickStat[]>(() => {
    if (!profile)
      return [
        { label: 'Win Rate', value: '0%', icon: TrendingUp, color: 'text-emerald-400' },
        { label: 'Rating', value: '1200', icon: Star, color: 'text-amber-400' },
        { label: 'Matches', value: '0', icon: Swords, color: 'text-sky-400' },
        { label: 'Streak', value: '0', icon: Flame, color: 'text-orange-400' },
      ];

    const winRate =
      profile.stats.totalGames > 0 ? ((profile.stats.wins / profile.stats.totalGames) * 100).toFixed(1) : '0';

    return [
      { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'text-emerald-400' },
      { label: 'Rating', value: profile.user.rating?.toString() || '1200', icon: Star, color: 'text-amber-400' },
      { label: 'Matches', value: profile.stats.totalGames?.toString() || '0', icon: Swords, color: 'text-sky-400' },
      { label: 'Streak', value: profile.currentWinStreak?.toString() || '0', icon: Flame, color: 'text-orange-400' },
    ];
  }, [profile]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-2">
            <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-mono ${stat.color}`}>
              <Icon className="w-3.5 h-3.5" />
              {stat.label}
            </div>
            <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
};
