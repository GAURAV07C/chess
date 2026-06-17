import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSidebar } from '@/hooks/useSidebar';
import { Swords, UserPlus, Bot, Puzzle, Trophy, Share2, Thermometer, Star } from 'lucide-react';
import { useUser } from '@repo/store/useUser';
import { useEffect, useState } from 'react';

const MODES = [
  {
    id: 'random',
    icon: Swords,
    label: 'Random Match',
    desc: 'Jump into an online duel',
    accent: 'from-amber-500 to-orange-600',
    glow: 'bg-amber-500',
    href: '/game/random',
  },
  {
    id: 'friend',
    icon: UserPlus,
    label: 'Friend Match',
    desc: 'Challenge a friend via link',
    accent: 'from-sky-500 to-blue-600',
    glow: 'bg-sky-500',
    href: null,
  },
  {
    id: 'bot',
    icon: Bot,
    label: 'Play v/s Bot',
    desc: 'Train against the computer',
    accent: 'from-emerald-500 to-teal-600',
    glow: 'bg-emerald-500',
    href: null,
  },
  {
    id: 'puzzle',
    icon: Puzzle,
    label: 'Puzzles',
    desc: 'Sharpen your tactics',
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
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const { toggle } = useSidebar();
  const user = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeClick = (href: string | null) => {
    if (href) navigate(href);
  };

  return (
    <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden selection:bg-amber-500/30 selection:text-white">
      {/* ===== Animated Background ===== */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500/[0.07] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-500/[0.06] blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ===== Top Bar ===== */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030611]/80 border-b border-slate-900/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="space-y-1">
                <span className="block w-5 h-0.5 bg-slate-300 rounded-full" />
                <span className="block w-5 h-0.5 bg-slate-300 rounded-full" />
                <span className="block w-5 h-0.5 bg-slate-300 rounded-full" />
              </div>
            </button>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-serif font-black shadow-lg shadow-amber-500/10 text-lg">
                ♜
              </span>
              <span className="font-serif text-lg font-extrabold text-white tracking-tight hidden sm:block">
                Chess<span className="text-amber-500 font-sans font-medium">Arena</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 cursor-pointer">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Main Content ===== */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-amber-400">{user?.name || 'Player'}</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-2 max-w-xl">
            Ready for your next battle? Choose a game mode and start playing.
          </p>
        </motion.div>

        {/* ===== Game Modes Grid ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODES.map((mode, i) => (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 24 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleModeClick(mode.href)}
              className="group relative text-left w-full p-6 rounded-2xl border border-slate-900 bg-slate-950/50 hover:bg-slate-950/80 transition-all overflow-hidden"
            >
              <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${mode.accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
              <div className="relative flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.accent} flex items-center justify-center shadow-lg`}>
                  <mode.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg group-hover:text-amber-400 transition-colors">
                    {mode.label}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm mt-1">
                    {mode.desc}
                  </p>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500 ${mode.glow}`} />
            </motion.button>
          ))}
        </div>

        {/* ===== Quick Stats ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              Win Rate
            </div>
            <p className="text-xl font-bold text-white font-mono">64.2%</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              Rating
            </div>
            <p className="text-xl font-bold text-white font-mono">1,247</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <Swords className="w-3.5 h-3.5 text-amber-500" />
              Matches
            </div>
            <p className="text-xl font-bold text-white font-mono">142</p>
          </div>
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-mono">
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              Streak
            </div>
            <p className="text-xl font-bold text-white font-mono">5 🔥</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
