import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Swords, Flame, Target, LogOut, Gamepad2, Crown, Palette, ArrowLeft } from 'lucide-react';
import { useUserStore } from '@repo/store/userAtom';
import { useThemeContext } from '@/hooks/useThemes';
import { THEMES_DATA } from '@/constants/themes';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';

const PROFILE_API = `${BACKEND_URL}/v1/profile/me`;

type GameRecord = {
  id: string;
  opponentName: string;
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
  color: 'white' | 'black';
};

type UserProfile = {
  id: string;
  email: string;
  name: string;
  provider: string;
  rating: number;
  username: string;
  createdAt: string;
  lastLogin?: string;
};

type ProfileStats = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | null;
  bestWinStreak: number;
};

type ProfileResponse = {
  user: UserProfile;
  stats: ProfileStats;
  currentWinStreak: number;
  recentGames: GameRecord[];
};

export const Profile = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { updateTheme, theme: activeTheme } = useThemeContext();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    let isMounted = true;

    setLoading(true);
    fetch(PROFILE_API, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Could not load profile');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user, navigate]);

  const winRate = useMemo(() => {
    if (!profile) return '0';
    if (profile.stats.totalGames <= 0) return '0';
    return ((profile.stats.wins / profile.stats.totalGames) * 100).toFixed(1);
  }, [profile]);

  const handleLogout = async () => {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'GET',
      credentials: 'include',
    });
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030611] text-white px-4 md:px-8 py-10">
        <p className="text-slate-400">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#030611] text-white px-4 md:px-8 py-10">
        <p className="text-rose-400">{error || 'No profile data'}</p>
      </div>
    );
  }

  const { stats, currentWinStreak, recentGames } = profile;

  return (
    <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden">
      <div className="absolute top-[-180px] left-[10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.07] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[12%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.06] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.04] blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 text-2xl font-serif font-black">
              {profile.user.name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <div>
              <h2 className="text-2xl font-serif font-extrabold text-white">{profile.user.name || 'Player'}</h2>
              <p className="text-slate-400 text-sm">
                @{profile.user.username || 'guest'}
                <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/15">
                  {profile.user.provider}
                </span>
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Joined {new Date(profile.user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Matches',
              value: String(stats.totalGames),
              icon: Swords,
              color: 'text-sky-400',
              bg: 'bg-sky-500/10',
              border: 'border-sky-500/20',
            },
            {
              label: 'Win Rate',
              value: `${winRate}%`,
              icon: Target,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
              border: 'border-emerald-500/20',
            },
            {
              label: 'Win Streak',
              value: `${currentWinStreak}`,
              icon: Flame,
              color: 'text-orange-400',
              bg: 'bg-orange-500/10',
              border: 'border-orange-500/20',
            },
            {
              label: 'Best Streak',
              value: `${stats.bestWinStreak}`,
              icon: Crown,
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/20',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`border ${stat.border} ${stat.bg} rounded-2xl p-4 space-y-2`}
              >
                <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-mono ${stat.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {stat.label}
                </div>
                <p className="text-xl font-bold text-white font-mono">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-emerald-400">Wins</p>
            <p className="text-xl font-bold text-white mt-1">{stats.wins}</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-rose-400">Losses</p>
            <p className="text-xl font-bold text-white mt-1">{stats.losses}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-amber-400">Draws</p>
            <p className="text-xl font-bold text-white mt-1">{stats.draws}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-300" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Theme</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {THEMES_DATA.map((theme) => {
              const isActive = activeTheme === theme.name;
              return (
                <button
                  key={theme.id}
                  onClick={() => updateTheme(theme.name)}
                  className={`group relative rounded-2xl border p-3 text-left transition-all hover:scale-[1.03] focus:outline-none ${
                    isActive
                      ? 'border-white/80 bg-white/10 ring-1 ring-white/60'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-lg border border-slate-800 shadow-sm"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  <p
                    className={`mt-3 text-xs font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                    }`}
                  >
                    {theme.name}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Recent Games</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {recentGames.map((game) => {
              const won =
                (game.color === 'white' && game.result === 'WHITE_WINS') ||
                (game.color === 'black' && game.result === 'BLACK_WINS');
              const isDraw = game.result === 'DRAW';
              return (
                <div
                  key={game.id}
                  className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between hover:border-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isDraw
                          ? 'bg-slate-500/10 text-slate-300'
                          : won
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">vs {game.opponentName || 'Opponent'}</p>
                      <p className="text-slate-400 text-xs mt-0.5">Playing as {game.color}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isDraw ? 'text-slate-300' : won ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {isDraw ? 'Draw' : won ? 'Win' : 'Loss'}
                  </span>
                </div>
              );
            })}
            {recentGames.length === 0 && (
              <p className="text-slate-500 text-sm py-6 text-center">No completed games yet. Start playing!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
