import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Play } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bgMain text-textMain flex flex-col">
      {/* Header */}
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
              onClick={() => navigate('/login')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
        <div className="max-w-3xl space-y-8">
          <h1 className="font-serif text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Where Tactical <br />
            <span className="text-amber-500">Minds Clash.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Experience high-performance online chess with your friends or play against the bot. Simple, fast, and
            competitive.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Playing</span>
            </button>
          </div>
        </div>

        {/* Board Image (Optional) */}
        <div className="mt-16 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <img
            src="https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=1200&h=600"
            alt="Chess Board"
            className="w-full h-auto object-cover opacity-80"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} ChessPlatform. Built for competitive play.</p>
      </footer>
    </div>
  );
};
