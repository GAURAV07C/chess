import { useNavigate } from 'react-router-dom';
import { Swords, UserPlus, Bot, UserRound } from 'lucide-react';
import { useUserStore } from '@repo/store/userAtom';
import { useEffect, useState } from 'react';
import { ProfileHeader } from './dashboard/ProfileHeader';
import { SectionDivider } from './dashboard/SectionDivider';
import { QuickStats } from './dashboard/QuickStats';
import { QuickActions } from './dashboard/QuickActions';
import { GameModeCard } from './dashboard/GameModeCard';
import { RecentGames } from './dashboard/RecentGames';

type GameRecord = {
  id: string;
  opponentName: string;
  result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
  color: 'white' | 'black';
  date: string;
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

type ProfileResponse = {
  user: UserProfile;
  stats: ProfileStats;
  currentWinStreak: number;
  recentGames: GameRecord[];
};

const MODES = [
  {
    id: 'random',
    icon: Swords,
    label: 'Quick Match',
    desc: 'Jump into an online arena',
    accent: 'from-amber-500 to-orange-600',
    href: '/game/random',
  },
  {
    id: 'friend',
    icon: UserPlus,
    label: 'Friend Match',
    desc: 'Share a link and challenge',
    accent: 'from-sky-500 to-blue-600',
    href: '/game/friend',
  },
  {
    id: 'bot',
    icon: Bot,
    label: 'Play v/s Bot',
    desc: 'Train against the engine',
    accent: 'from-emerald-500 to-teal-600',
    href: '/game/bot',
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const hydrated = useUserStore((state) => state.hydrated);
  const refreshUser = useUserStore((state) => state.refreshUser);
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL ?? 'http://localhost:3000';
  const PROFILE_API = `${BACKEND_URL}/v1/profile/me`;

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      await refreshUser();
      try {
        const res = await fetch(PROFILE_API, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setProfile(data);
        }
      } catch (err) {
        console.error('Failed to load profile for dashboard', err);
      }
      if (!cancelled) {
        setMounted(true);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [PROFILE_API, refreshUser]);

  useEffect(() => {
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

  if (!hydrated || !mounted) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#030611] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-14 space-y-10">
        <ProfileHeader
          greeting={greeting}
          userName={user?.name || 'Player'}
          onProfileClick={() => navigate('/profile')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODES.map((mode) => (
            <GameModeCard key={mode.id} mode={mode} onClick={() => handleModeClick(mode.href)} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <SectionDivider title="Performance" />
            <QuickStats profile={profile} />

            <div className="mt-8">
              <SectionDivider title="Quick Actions" />
              <QuickActions
                actions={[{ label: 'View Full Profile', icon: UserRound, href: '/profile' }]}
                onNavigate={handleModeClick}
              />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <SectionDivider title="Recent Activity" />
            <RecentGames games={profile?.recentGames || []} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
