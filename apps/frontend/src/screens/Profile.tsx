import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useUserStore } from '@repo/store/userAtom';
import { useThemeContext } from '@/hooks/useThemes';
import { THEME } from '@/context/themeContext';
import { THEMES_DATA } from '@/constants/themes';
import { ProfileHeader } from './profile/ProfileHeader';
import { ProfileStats } from './profile/ProfileStats';
import { ThemeSection } from './profile/ThemeSection';
import { ThemeSelector } from './profile/ThemeSelector';
import { GameHistory } from './profile/GameHistory';
import { ProfileBackground } from './profile/ProfileBackground';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';
const PROFILE_API = `${BACKEND_URL}/v1/profile/me`;

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

type ProfileStatsType = {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | null;
  bestWinStreak: number;
};

type GameRecord = {
  id: string;
  opponentName: string;
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
  color: 'white' | 'black';
};

type ProfileResponse = {
  user: UserProfile;
  stats: ProfileStatsType;
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
      <ProfileBackground />
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <ProfileHeader
          userName={profile.user.name || 'Player'}
          username={profile.user.username || 'guest'}
          provider={profile.user.provider}
          createdAt={profile.user.createdAt}
          onBack={() => navigate(-1)}
          onLogout={handleLogout}
        />

        <ProfileStats stats={stats} winRate={winRate} currentWinStreak={currentWinStreak} />

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
          <ThemeSection />
          <ThemeSelector
            themes={THEMES_DATA}
            activeTheme={activeTheme}
            onSelectTheme={(name) => updateTheme(name as THEME)}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Recent Games</h3>
          <GameHistory games={recentGames} />
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
