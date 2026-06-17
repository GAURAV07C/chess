import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Swords,
  UserPlus,
  Bot,
  Puzzle,
  Trophy,
  Flame,
  Star,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Share2,
  Crown,
  Gamepad2,
  ChevronRight,
} from 'lucide-react';
import { useUser } from '@repo/store/useUser';
import { useEffect, useState, useMemo } from 'react';

const MODES = [
  {
    id: 'random',
    icon: Swords,
    label: 'Quick Match',
    desc: 'Jump into an online arena',
    accent: 'from-amber-500 to-orange-600',
    glow: 'bg-amber-500',
    href: '/game/random',
  },
  {
    id: 'friend',
    icon: UserPlus,
    label: 'Friend Match',
    desc: 'Share a link and challenge',
    accent: 'from-sky-500 to-blue-600',
    glow: 'bg-sky-500',
    href: null,
  },
  {
    id: 'bot',
    icon: Bot,
    label: 'Play v/s Bot',
    desc: 'Train against the engine',
    accent: 'from-emerald-500 to-teal-600',
    glow: 'bg-emerald-500',
    href: null,
  },
  {
    id: 'puzzle',
    icon: Puzzle,
    label: 'Puzzle Rush',
    desc: 'Solve tactical sequences',
    accent: 'from-purple-500 to-pink-600',
    glow: 'bg-purple-500',
    href: null,
  },
  {
    id: 'leaderboard',
    icon: Trophy,
    label: 'Leaderboard',
    desc: 'Top challengers this week',
    accent: 'from-rose-500 to-red-600',
    glow: 'bg-rose-500',
    href: null,
  },
  {
    id: 'tournament',
    icon: Crown,
    label: 'Tournaments',
    desc: 'Compete for the crown',
    accent: 'from-yellow-500 to-amber-600',
    glow: 'bg-yellow-500',
    href: null,
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, mounted, navigate]);

  const handleModeClick = (href: string | null) => {
    if (href) navigate(href);
  };

  const quickStats = useMemo(
    () => [
      { label: 'Win Rate', value: '64.2%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
      { label: 'Rating', value: '1,247', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
      { label: 'Matches', value: '142', icon: Swords, color: 'text-sky-400', bg: 'bg-sky-500/10' },
      { label: 'Streak', value: '5', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    ],
    []
  );

  const dailyPuzzle = useMemo(
    () => ({
      title: 'Backrank Mate',
      difficulty: 'Medium',
      rating: 1650,
      moves: '3 moves',
      timeLeft: '14h 23m',
    }),
    []
  );

  if (!user && !mounted) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden selection:bg-amber-500/30 selection:text-white">
      <div className="absolute top-[-200px] left-[10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.07] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[15%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.06] blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px] pointer-events-none -z-10" />
      <div
        className="absolute inset-0 opacity-[0.35] -z-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14 space-y-10">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            {greeting}, <span className="text-amber-400">{user?.name || 'Player'}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl">
            Ready for your next battle? Choose a mode and start playing.
          </p>
        </motion.div>

        {/* Game Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODES.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: 'easeOut' }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleModeClick(mode.href)}
                className="group relative text-left w-full p-6 rounded-2xl border border-slate-900 bg-slate-950/60 hover:bg-slate-950/80 transition-all overflow-hidden"
              >
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${mode.accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
                />
                <div className="relative flex flex-col gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.accent} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base md:text-lg group-hover:text-amber-400 transition-colors">
                      {mode.label}
                    </h3>
                    <p className="text-slate-400 text-xs md:text-sm mt-1">{mode.desc}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${mode.glow}`} />
              </motion.button>
            );
          })}
        </div>

        {/* Stats + Daily Challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-2 hover:border-slate-800 transition-colors"
                >
                  <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-mono ${stat.color}`}>
                    <stat.icon className="w-3.5 h-3.5" />
                    {stat.label}
                  </div>
                  <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <Divider title="Today's Puzzle" />
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                      dailyPuzzle.difficulty === 'Medium'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/15 animate-pulse'
                    }`}
                  >
                    {dailyPuzzle.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono"># {dailyPuzzle.rating} ELO</span>
                </div>
                <h3 className="text-white font-bold text-lg">{dailyPuzzle.title}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-amber-500" />
                      {dailyPuzzle.moves}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {dailyPuzzle.timeLeft}
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModeClick('/puzzle')}
                className="relative mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Solve Now
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity + Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Divider title="Recent Activity" />
            <div className="space-y-3">
              {[
                { opp: 'GrandMaster99', result: 'Win', time: '12 min', moves: 34, won: true },
                { opp: ' tactical_titan', result: 'Loss', time: '8 min', moves: 28, won: false },
                { opp: 'KnightRider', result: 'Win', time: '15 min', moves: 41, won: true },
              ].map((game, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: mounted ? 1 : 0, x: mounted ? 0 : -20 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        game.won ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">vs {game.opp}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {game.time} · {game.moves} moves
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${game.won ? 'text-amber-400' : 'text-rose-400'}`}
                  >
                    {game.result}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-1"
          >
            <Divider title="Quick Actions" />
            <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-5 space-y-3">
              {[
                { label: 'Invite Friends', icon: Share2, href: null },
                { label: 'View Analytics', icon: TrendingUp, href: null },
                { label: 'Join Tournament', icon: Crown, href: null },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handleModeClick(action.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-slate-800 text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Divider = ({ title }: { title: string }) => (
  <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">{title}</h3>
);

export default Dashboard;
