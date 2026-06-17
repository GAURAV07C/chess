import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useThemeContext } from '@/hooks/useThemes';
import { THEMES_DATA } from '@/constants/themes';
import { LandingPlayCard } from '@/components/LandingPlayCard';
import { LandingChessboard } from '@/components/LandingChessboard';
import { LandingFooter } from '@/components/LandingFooter';
import {
  Trophy, Swords, Sparkles, Github, Play,
  Layers, Users, Shield, Cpu, Flame, Zap
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { currentTheme, setTheme } = useThemeContext();

  const [boardMode, setBoardMode] = useState<'interactive' | 'static'>('interactive');
  const [chessboardType, setChessboardType] = useState<'freeplay' | 'puzzle'>('freeplay');
  const [liveOpponent, setLiveOpponent] = useState<{ name: string; elo: number } | null>(null);
  const [successConfetti, setSuccessConfetti] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState<'global' | 'puzzles'>('global');

  const communityPuzzles = [
    { id: 'puzzle-1', name: 'Classic Smothered Mate', difficulty: 'Medium', rating: 1650, solvedCount: '18.4k', moves: 3 },
    { id: 'puzzle-2', name: 'Tactical Rook Sacrifice', difficulty: 'Hard', rating: 2150, solvedCount: '11.2k', moves: 4 },
    { id: 'puzzle-3', name: 'Master Defense Trap', difficulty: 'Insane', rating: 2580, solvedCount: '3.9k', moves: 5 },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Magnus Carlsen', elo: 2882, country: '🇳🇴', title: 'GM', streak: 4 },
    { rank: 2, name: 'Hikaru Nakamura', elo: 2875, country: '🇺🇸', title: 'GM', streak: 7 },
    { rank: 3, name: 'Gukesh Dommaraju', elo: 2795, country: '🇮🇳', title: 'GM', streak: 3 },
    { rank: 4, name: 'Praggnanandhaa R', elo: 2750, country: '🇮🇳', title: 'GM', streak: 5 },
    { rank: 5, name: 'Beth Harmon', elo: 2500, country: '🇺🇸', title: 'WGM', streak: 2 },
  ];

  const handleStartSimulatedMatch = (opp: { name: string; elo: number }) => {
    setLiveOpponent(opp);
    setBoardMode('interactive');
  };

  const handlePuzzleSolved = () => {
    setSuccessConfetti(true);
    setTimeout(() => setSuccessConfetti(false), 4000);
  };

  const resetSimulation = () => setLiveOpponent(null);

  return (
    <div className="min-h-screen bg-transparent selection:bg-amber-500/30 selection:text-white flex flex-col justify-between relative overflow-hidden">

      {/* Background glows */}
      <div className="absolute top-[-200px] left-[10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.08] blur-[150px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute bottom-[15%] right-[5%] w-[600px] h-[600px] rounded-full bg-[#1e293b]/15 blur-[130px] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.004)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.004)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-20" />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030611]/85 border-b border-slate-900/60 px-6 md:px-14 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-serif font-black shadow-lg shadow-amber-500/10 text-xl">
              ♜
            </span>
            <span className="font-serif text-xl font-extrabold text-white tracking-tight">
              Chess<span className="text-amber-500 font-sans font-medium">Platform</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/50 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs text-slate-300 font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>42,912 Players Online</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold">14,289 Live lobbies</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/GAURAV07C/chess/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white border border-slate-800 px-3 py-1.5 rounded-xl transition-all font-semibold hover:bg-slate-900 cursor-pointer"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Issues</span>
            </a>
            <a
              href="#play"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 tracking-wide cursor-pointer"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero sparkle gradient */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-14 py-8 md:py-16 space-y-32">

        {/* === SECTION 1: HERO === */}
        <motion.div
          id="play"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-[1.3fr,1fr] xl:grid-cols-[1.45fr,1fr] gap-12 md:gap-16 xl:gap-24 items-center"
        >
          {/* Left: Board + headline */}
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full text-left space-y-3">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 w-fit px-3 py-1.5 rounded-full border border-amber-500/20"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>The Modern Battleground</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                Where Tactical <br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Minds Clash.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="text-sm md:text-base text-slate-400 max-w-[550px]"
              >
                Experience high-performance online chess with gorgeous dynamic board customizations and responsive puzzles. Try solving the interactive puzzles below for instant tactical workouts!
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.6 }}
                className="flex flex-wrap items-center gap-3.5 pt-3"
              >
                <a
                  href="#play"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Get Started & Play Now</span>
                </a>
                <a
                  href="#themes"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>Explore Board Themes</span>
                </a>
              </motion.div>
            </div>

            {/* Board mode switcher */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="w-full flex justify-between items-center bg-slate-900/40 p-1.5 rounded-2xl border border-slate-900 max-w-[500px] md:max-w-[580px]"
            >
              <button
                onClick={() => setBoardMode('interactive')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  boardMode === 'interactive'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Interactive Board</span>
              </button>
              <button
                onClick={() => setBoardMode('static')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  boardMode === 'static'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Theme Photography</span>
              </button>
            </motion.div>

            {/* Board stage */}
            <div className="relative w-full flex justify-center">
              <AnimatePresence mode="wait">
                {boardMode === 'interactive' ? (
                  <motion.div
                    key="interactive-board"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full flex justify-center relative"
                  >
                    <LandingChessboard
                      theme={currentTheme}
                      isInteractive={true}
                      puzzleState={chessboardType === 'puzzle' ? 'active' : 'none'}
                      onPuzzleSolved={handlePuzzleSolved}
                      onResetBoard={resetSimulation}
                    />
                    {liveOpponent && (
                      <div className="absolute top-[38px] left-1/2 -translate-x-1/2 bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs py-1.5 px-4 rounded-full font-semibold animate-pulse z-20 flex items-center gap-1.5 shadow-xl backdrop-blur-sm">
                        ⚔️ Arena Duel vs <strong>{liveOpponent.name}</strong> ({liveOpponent.elo})
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="static-board"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full flex justify-center max-w-[530px] md:max-w-[620px] lg:max-w-[680px] xl:max-w-[730px]"
                  >
                    <div className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-2xl w-full aspect-square">
                      <img
                        className="rounded-2xl w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-700 max-h-[730px]"
                        src={currentTheme?.boardImage || 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=650&h=650'}
                        alt="chess-board"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 mb-0.5">Active Skin Preview</span>
                        <h4 className="font-serif text-lg font-bold text-white leading-tight">{currentTheme?.name}</h4>
                        <p className="text-xs text-slate-300 max-w-[280px] mt-1">{currentTheme?.description}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {successConfetti && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500/90 text-slate-950 px-6 py-3 rounded-2xl font-black text-xl shadow-2xl z-40 animate-bounce flex items-center gap-2 border border-yellow-300">
                  <Sparkles className="w-6 h-6 fill-slate-950" /> Puzzle Solved!
                </div>
              )}
            </div>
          </div>

          {/* Right: PlayCard */}
          <div className="w-full flex justify-center py-6">
            <LandingPlayCard
              onStartSimulatedMatch={handleStartSimulatedMatch}
              onSetMode={(mode) => setChessboardType(mode)}
            />
          </div>
        </motion.div>

        {/* === SECTION 2: THEME SELECTOR === */}
        <motion.div
          id="themes"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-slate-900/30 border border-slate-900 rounded-[28px] p-8 md:p-10 space-y-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-900 pb-6">
            <div>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Aesthetic Settings</span>
              <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Responsive Theme Selection
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-2 max-w-[500px]">
                Switch through our pristine selection of tactical gameboards. Test contrasts and coordinate visibility in real-time.
              </p>
            </div>
            <div className="text-xs text-slate-400 bg-[#070a13] px-3.5 py-2 border border-slate-800 rounded-xl font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Selected: <strong className="text-white font-sans">{currentTheme?.name}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {THEMES_DATA.map((t) => {
              const isActive = t.id === currentTheme?.id;
              return (
                <motion.button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className={`flex flex-col p-4 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 border-amber-500/50 shadow-xl shadow-amber-500/5'
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="grid grid-cols-2 grid-rows-2 w-full h-16 rounded-lg overflow-hidden border border-slate-800/80 mb-3.5">
                    <div className={t.lightSquare} />
                    <div className={t.darkSquare} />
                    <div className={t.darkSquare} />
                    <div className={t.lightSquare} />
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-normal flex-1">{t.description}</p>
                  {isActive && (
                    <span className="absolute top-2 right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* === SECTION 3: LEADERBOARD === */}
        <motion.div
          id="leaderboard"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] xl:grid-cols-[1.3fr,1fr] gap-12 md:gap-16 items-start"
        >
          {/* Left: Leaderboard */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Live Dispatching
                  </span>
                  <span className="text-slate-500 text-xs font-mono">Synced 1s ago</span>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-extrabold text-white tracking-tight">Active Live Arena</h2>
                <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-[500px]">
                  Climb standard divisions, challenge grandmaster champions, or solve high-reward tactical puzzles.
                </p>
              </div>
              <div className="flex bg-slate-950/80 border border-slate-900/90 rounded-xl p-1 shrink-0 self-start">
                <button
                  onClick={() => setLeaderboardTab('global')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    leaderboardTab === 'global' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Global Grandmasters
                </button>
                <button
                  onClick={() => setLeaderboardTab('puzzles')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    leaderboardTab === 'puzzles' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tactical Puzzles
                </button>
              </div>
            </div>

            {leaderboardTab === 'global' ? (
              <div className="space-y-3">
                <div className="bg-slate-950/45 border border-slate-900/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
                  <div className="grid grid-cols-[65px,1fr,115px] border-b border-slate-900 px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-950/80">
                    <span>Rank</span>
                    <span>Challenger</span>
                    <span className="text-right">ELO</span>
                  </div>
                  <div className="divide-y divide-slate-900/40">
                    {leaderboardData.map((player, index) => (
                      <motion.div
                        key={player.rank}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.22)' }}
                        className="grid grid-cols-[65px,1fr,115px] items-center px-6 py-4 transition-colors text-xs group relative overflow-hidden"
                      >
                        <div className="font-mono text-xs font-bold text-slate-400 flex items-center">
                          {player.rank === 1 ? <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">🥇</span>
                          : player.rank === 2 ? <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400/15 border border-slate-400/20 text-slate-300 text-sm">🥈</span>
                          : player.rank === 3 ? <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-800/15 border border-amber-800/20 text-amber-600 text-sm">🥉</span>
                          : <span className="pl-2">#{player.rank}</span>}
                        </div>
                        <div className="flex items-center gap-3.5">
                          <div className="text-xl shrink-0">{player.country}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white group-hover:text-amber-400 transition-colors text-[13px] md:text-sm">{player.name}</span>
                              <span className="bg-slate-900/90 border border-slate-800 text-slate-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">{player.title}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                              <Flame className="w-3 h-3 text-orange-500" />
                              <span>{player.streak} Win Streak</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-amber-400 text-[13px] md:text-sm">{player.elo}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/10 border border-dashed border-slate-800/80 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500">
                    Complete any <a href="#play" className="text-amber-500 hover:underline">arena match</a> to automatically join the ranking database.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {communityPuzzles.map((puzzle) => (
                  <motion.div
                    key={puzzle.id}
                    whileHover={{ y: -6, borderColor: 'rgba(245, 158, 11, 0.4)' }}
                    className="bg-slate-950/50 border border-slate-900/90 rounded-2xl p-5 flex flex-col justify-between space-y-5 transition-all text-left relative overflow-hidden group shadow-xl"
                  >
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent blur-xl rounded-full pointer-events-none" />
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                          puzzle.difficulty === 'Medium' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                          : puzzle.difficulty === 'Hard' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/15'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/15 animate-pulse'
                        }`}>{puzzle.difficulty}</span>
                        <span className="font-mono text-xs font-bold text-amber-500">#{puzzle.rating} ELO</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">{puzzle.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">{puzzle.moves} moves to checkmate</p>
                      </div>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-slate-900/80">
                      <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                        <span>Solvers: {puzzle.solvedCount}</span>
                        <span className="text-emerald-500">92.4% pass</span>
                      </div>
                      <button
                        onClick={() => { setChessboardType('puzzle'); setBoardMode('interactive'); document.getElementById('play')?.scrollIntoView({ behavior: 'smooth' }); }}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 hover:bg-slate-950/90 text-[10.5px] text-white font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Solve Puzzle 🎯</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Arena Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-slate-950/40 border border-slate-900/90 p-8 rounded-[28px] self-start space-y-8 backdrop-blur-md relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest font-mono">Real-time Diagnostics</span>
              <h3 className="font-serif text-2xl font-bold text-white tracking-tight">Arena Systems Status</h3>
              <p className="text-slate-400 text-xs">Active server pools monitoring game node performance.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Lobby Latency</span>
                <span className="block text-xl font-bold text-emerald-400 mt-1 font-mono">14ms</span>
                <span className="block text-[10px] text-slate-600 mt-1">Excellent stability</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl text-left">
                <span className="block text-[10px] text-slate-500 uppercase font-mono tracking-wider">Anticheat Rate</span>
                <span className="block text-xl font-bold text-amber-400 mt-1 font-mono">99.98%</span>
                <span className="block text-[10px] text-slate-600 mt-1">Secure shielding active</span>
              </div>
            </div>
            <div className="h-[1px] bg-slate-900/60" />
            <div className="space-y-5">
              {[
                { icon: <Shield className="w-4 h-4" />, color: 'text-amber-500', title: 'Anti-Cheat Engine Shield', desc: 'Advanced cloud heuristic analysis parses chess node moves per millisecond to prevent assistance software exploitation.' },
                { icon: <Cpu className="w-4 h-4" />, color: 'text-sky-400', title: 'Stockfish 16 Engine Analytics', desc: 'Integrated client evaluation curves powered by multi-threaded neural networks for post-game split breakdowns.' },
                { icon: <Users className="w-4 h-4" />, color: 'text-emerald-400', title: 'Global Matchmaking Pools', desc: 'Dynamic matchmaking engine pairs challengers based on active checkmate rates, ELO metrics, and region.' },
              ].map((feat, i) => (
                <div key={i} className="flex gap-4 p-1 rounded-xl transition-all duration-300">
                  <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-900 shrink-0 flex items-center justify-center ${feat.color} shadow-md`}>
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                    <p className="text-[11.5px] text-slate-400 mt-1 leading-normal">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* === SECTION 4: GITHUB / ISSUES === */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8 }}
          className="bg-[#101423] text-[#f8fafc] w-full px-8 py-10 md:px-14 md:py-14 rounded-[36px] border border-slate-800/80 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="lg:grid grid-cols-[45%,1fr] gap-16 md:gap-24 items-center">
            <motion.div
              whileHover={{ rotate: -1.5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 150, damping: 15 }}
              className="rounded-2xl bg-slate-950/30 border border-slate-900 p-6 flex items-center justify-center relative group min-h-[220px]"
            >
              <img
                className="w-full max-w-[280px] h-auto rounded-xl filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] select-none"
                src="https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=600&h=450"
                alt="chess-board-illustration"
              />
            </motion.div>
            <div className="mt-10 lg:mt-0 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 w-fit px-3 py-1 rounded-full border border-amber-500/15">
                  Open Source Guild
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
                  Found an Issue!
                </h2>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-[550px]">
                  Please create an issue in our github website below. You are also warmly invited to contribute to our digital chess arena, help add game skins, and customize layouts.
                </p>
              </div>
              <motion.a
                href="https://github.com/GAURAV07C/chess/issues"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group mt-4 rounded-2xl px-6 py-4 border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-slate-700 w-full text-lg flex gap-4 items-center justify-center max-w-[360px] transition-all cursor-pointer shadow-lg"
              >
                <div className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Github className="w-6 h-6 text-white group-hover:text-amber-400 transition-colors" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-[11px] text-zinc-500 uppercase font-mono font-bold tracking-wider">GitHub Issues page</span>
                  <span className="font-serif text-lg font-black text-white group-hover:text-amber-400 transition-colors">Submit Here</span>
                </div>
              </motion.a>
            </div>
          </div>
        </motion.div>

      </main>

      <LandingFooter />
    </div>
  );
};
