import { Github } from 'lucide-react';

type LandingHeaderProps = {
  onLogin: () => void;
};

export const LandingHeader = ({ onLogin }: LandingHeaderProps) => (
  <header className="w-full border-b border-slate-800 bg-bgMain py-4 px-6 md:px-14">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950 font-serif font-black text-xl">
          ♜
        </span>
        <span className="font-serif text-xl font-extrabold text-white tracking-tight">
          Chess<span className="text-amber-500 font-sans font-medium">Platform</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <a
          href="https://github.com/GAURAV07C/chess"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-all font-semibold cursor-pointer"
        >
          <Github className="w-4 h-4" />
          <span className="hidden sm:inline">GitHub</span>
        </a>
        <button
          onClick={onLogin}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
        >
          Login
        </button>
      </div>
    </div>
  </header>
);
