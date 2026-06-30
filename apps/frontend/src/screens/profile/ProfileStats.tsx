import { motion } from 'framer-motion';

// type Stat = {
//   label: string;
//   value: string;
// };

type ProfileStatsProps = {
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    currentStreak: number;
    bestWinStreak: number;
  };
  winRate: string;
  currentWinStreak: number;
};

export const ProfileStats = ({ stats, winRate, currentWinStreak }: ProfileStatsProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: 'Total Matches', value: String(stats.totalGames) },
      { label: 'Win Rate', value: `${winRate}%` },
      { label: 'Win Streak', value: String(currentWinStreak) },
      { label: 'Best Streak', value: String(stats.bestWinStreak) },
    ].map(({ label, value }, idx) => (
      <motion.div
        key={label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="border border-slate-900 bg-slate-950 rounded-2xl p-4 space-y-2"
      >
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-slate-300">{label}</div>
        <p className="text-xl font-bold text-white font-mono">{value}</p>
      </motion.div>
    ))}
  </div>
);
