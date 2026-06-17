import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Github, Flame, Layers, ShieldCheck, Heart } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#070a13] border-t border-slate-900 mt-24 py-12 px-6 md:px-14">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-14 leading-relaxed">

        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-serif font-black shadow-lg shadow-amber-950/20 text-lg">
              ♝
            </span>
            <span className="font-serif text-xl font-extrabold text-white tracking-tight">
              Chess<span className="text-amber-500">Platform</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-[240px]">
            The world's premier modern digital arena for tactical minds. Live games, custom responsive themes, puzzle trainers, and bullet-fast response.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Web-3 SECURE
            </span>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="font-serif text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Explore
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <a href="#play" className="hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> Play Online Arena
              </a>
            </li>
            <li>
              <a href="#themes" className="hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> Board Customizer
              </a>
            </li>
            <li>
              <a href="#leaderboard" className="hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Leaderboard
              </a>
            </li>
            <li>
              <Link to="/settings/themes" className="hover:text-white hover:underline transition-colors">
                Settings
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white hover:underline transition-colors">
                Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Tech */}
        <div>
          <h4 className="font-serif text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Arena Tech
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li><span className="text-slate-300">Fast Matchmaking:</span> 1.2s avg queue</li>
            <li><span className="text-slate-300">Real-time Sync:</span> WebSocket latency &lt;15ms</li>
            <li><span className="text-slate-300">Engine Analysis:</span> Stockfish 16 Core</li>
            <li><span className="text-slate-300">Audio Synth:</span> Web Audio oscillators</li>
          </ul>
        </div>

        {/* Contribute */}
        <div>
          <h4 className="font-serif text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            Join the Guild
          </h4>
          <p className="text-xs text-slate-400 mb-3.5">
            This platform is fully open source. Your contributions are welcome on our public GitHub repository!
          </p>
          <a
            href="https://github.com/GAURAV07C/chess/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:text-white font-semibold rounded-lg transition-all"
          >
            <Github className="w-4 h-4" />
            <span>Submit Issues</span>
          </a>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900/60 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
        <div>© {currentYear} ChessPlatform Inc. All rights reserved.</div>
        <div className="flex items-center gap-1 text-slate-600">
          Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse mx-1" /> for chess masters worldwide.
        </div>
      </div>
    </footer>
  );
};
