import { useNavigate } from 'react-router-dom';
import { LandingHeader } from './landing/LandingHeader';
import { HeroSection } from './landing/HeroSection';
import { BoardImage } from './landing/BoardImage';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bgMain text-textMain flex flex-col">
      <LandingHeader onLogin={() => navigate('/login')} />
      <HeroSection onStartPlaying={() => navigate('/login')} />
      <BoardImage />
      <footer className="w-full border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ChessPlatform. Built for competitive play.</p>
      </footer>
    </div>
  );
};
