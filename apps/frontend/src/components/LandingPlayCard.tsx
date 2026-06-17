import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Swords, Bot, Sparkles, Zap, Radio, User, Flame, Trophy } from 'lucide-react';
import { TimeControlValue } from '@/types/chess-landing';

interface LandingPlayCardProps {
  onStartSimulatedMatch: (opponent: { name: string; elo: number }) => void;
  onSetMode: (mode: 'freeplay' | 'puzzle') => void;
}

export const LandingPlayCard: React.FC<LandingPlayCardProps> = ({ onStartSimulatedMatch, onSetMode }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'multiplayer' | 'bot' | 'puzzle'>('multiplayer');
  const [timeControl, setTimeControl] = useState<TimeControlValue>('3+0');
  const [username, setUsername] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<'init' | 'searching' | 'matched'>('init');
  const [opponent, setOpponent] = useState<{ id: string; name: string; rating: number; country: string } | null>(null);
  const [matchCountdown, setMatchCountdown] = useState(3);

  const timeControls: { label: string; sub: string; value: TimeControlValue; type: string }[] = [
    { label: '1 min', sub: 'Bullet', value: '1+0', type: 'bullet' },
    { label: '3 min', sub: 'Blitzy', value: '3+0', type: 'blitz' },
    { label: '5+3 min', sub: 'Blitz Plus', value: '5+3', type: 'blitz' },
    { label: '10 min', sub: 'Rapid', value: '10+0', type: 'rapid' },
    { label: '30 min', sub: 'Classical', value: '30+0', type: 'classical' },
  ];

  // Simulated matchmaking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (searchStatus === 'searching') {
      const opponentsList = [
        { id: '1', name: 'Grandmaster_Magnus', rating: 2882, country: '🇳🇴' },
        { id: '2', name: 'HikaruNakamura', rating: 2875, country: '🇺🇸' },
        { id: '3', name: 'PraggChess', rating: 2750, country: '🇮🇳' },
        { id: '4', name: 'Beth_Harmon', rating: 2500, country: '🇺🇸' },
        { id: '5', name: 'Garry_K', rating: 2851, country: '🇭🇷' },
        { id: '6', name: 'ChessSlayer99', rating: 1640, country: '🇬🇧' },
        { id: '7', name: 'Deep_Chess_Bot', rating: 3200, country: '🤖' }
      ];
      timer = setTimeout(() => {
        const randomOpp = opponentsList[Math.floor(Math.random() * opponentsList.length)];
        setOpponent(randomOpp);
        setSearchStatus('matched');
        setMatchCountdown(3);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [searchStatus]);

  // Match countdown then navigate to real game
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (searchStatus === 'matched' && matchCountdown > 0) {
      interval = setInterval(() => {
        setMatchCountdown(prev => prev - 1);
      }, 1000);
    } else if (searchStatus === 'matched' && matchCountdown === 0) {
      if (opponent) {
        onStartSimulatedMatch({ name: opponent.name, elo: opponent.rating });
      }
      // Navigate to real game after animation
      setTimeout(() => navigate('/game/random'), 500);
    }
    return () => clearInterval(interval);
  }, [searchStatus, matchCountdown, opponent]);

  const handleStartSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchStatus('searching');
    onSetMode('freeplay');
  };

  const cancelSearch = () => {
    setIsSearching(false);
    setSearchStatus('init');
    setOpponent(null);
  };

  return (
    <div className="flex flex-col w-full max-w-[480px] bg-[#090d16]/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden self-start">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-900 bg-slate-950/70 p-2 gap-1.5">
        <button
          onClick={() => { setActiveTab('multiplayer'); onSetMode('freeplay'); if (isSearching) cancelSearch(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'multiplayer'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Swords className="w-4 h-4 text-amber-500" />
          <span>Live Match</span>
        </button>
        <button
          onClick={() => { setActiveTab('puzzle'); onSetMode('puzzle'); if (isSearching) cancelSearch(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'puzzle'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Daily Tactics</span>
        </button>
        <button
          onClick={() => { setActiveTab('bot'); onSetMode('freeplay'); if (isSearching) cancelSearch(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'bot'
              ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-400" />
          <span>Vs Engine</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="searching"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-10 text-center flex-1"
            >
              {searchStatus === 'searching' ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 scale-150 animate-ping" />
                    <div className="absolute inset-0 rounded-full bg-slate-800 scale-125 border border-slate-700" />
                    <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-amber-500/40 relative">
                      <Radio className="w-8 h-8 text-amber-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Matchmaking...</h3>
                  <p className="text-sm text-slate-400 max-w-[280px] mb-6">
                    Searching for an active opponent near your rating in <span className="text-amber-400">{timeControl}</span> room.
                  </p>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl py-3 px-4 w-full text-left font-mono text-[11px] text-zinc-400 space-y-1 max-w-[325px]">
                    <div className="flex justify-between items-center">
                      <span>Rating Range:</span>
                      <span className="text-amber-500">1400 - 1800 Elo</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Players in queue:</span>
                      <span className="text-emerald-400">4,812 active</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Server ping:</span>
                      <span className="text-sky-400">12ms (Secure)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={cancelSearch}
                    className="mt-8 px-5 py-2.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 font-semibold text-xs rounded-xl border border-slate-700 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Cancel Queue
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-6 mb-7">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-600 shadow-md">
                        <User className="w-7 h-7 text-slate-300" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 mt-1.5 truncate max-w-[80px]">
                        {username || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-4">
                      <span className="text-sm font-semibold text-amber-400 uppercase tracking-widest animate-bounce">VS</span>
                      <div className="text-2xl font-serif font-black text-white mt-1">{matchCountdown}</div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-slate-950 flex items-center justify-center border-2 border-amber-500 shadow-lg shadow-amber-950/20">
                        <span className="text-2xl">{opponent?.country}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-400 mt-1.5 truncate max-w-[100px]">{opponent?.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono">({opponent?.rating} ELO)</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-black text-rose-400 mb-2 tracking-tight">Opponent Sighted!</h3>
                  <p className="text-sm text-slate-300 max-w-[300px]">Prepare yourself. Match is booting up. Good luck!</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="config"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-between"
            >
              <div>
                {/* Live Multiplayer Tab */}
                {activeTab === 'multiplayer' && (
                  <form onSubmit={handleStartSearch} className="space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                        Choose Time Control
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeControls.map(tc => {
                          const isActive = timeControl === tc.value;
                          return (
                            <button
                              key={tc.value}
                              type="button"
                              onClick={() => setTimeControl(tc.value)}
                              className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left relative cursor-pointer ${
                                isActive
                                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-xl shadow-amber-950/10'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-950/80 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                                <span className="text-sm font-bold text-white">{tc.label}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono mt-1">{tc.sub}</span>
                              {isActive && <span className="absolute top-1 right-2 w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          Your Challenger Nickname
                        </label>
                        <span className="text-[10px] text-amber-500/80 font-mono flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> Fast Setup
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          placeholder="MagnusFanatic / GarryG"
                          className="w-full bg-slate-950/60 pl-8 pr-4 py-3.5 rounded-xl border border-slate-800 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-amber-950/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                    >
                      <Swords className="w-5 h-5 text-amber-100" />
                      <span className="text-base font-bold tracking-wide">Find Live Match</span>
                    </button>
                  </form>
                )}

                {/* Puzzle Tab */}
                {activeTab === 'puzzle' && (
                  <div className="space-y-5 py-2">
                    <div className="flex items-center gap-3.5 bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                      <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 rounded-xl shrink-0">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Today's Grand Arena</span>
                        <h4 className="font-serif text-lg font-bold text-white mb-0.5 leading-tight">Crush the Back Rank</h4>
                        <p className="text-xs text-slate-400">White to move and deliver mate in 1 move.</p>
                      </div>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-800/80 rounded-2xl p-4 space-y-3.5 text-xs text-slate-300">
                      <div className="flex justify-between border-b border-slate-800/70 pb-2">
                        <span className="text-slate-400">Tactics Rating:</span>
                        <span className="font-mono font-semibold text-white">1,650 ELO</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/70 pb-2">
                        <span className="text-slate-400">Success Rate:</span>
                        <span className="font-mono font-semibold text-emerald-400">76.3%</span>
                      </div>
                      <div className="flex justify-between pb-1">
                        <span className="text-slate-400">Hint:</span>
                        <span className="text-slate-200">Look for a trapped King. Use the Rook to lock it in!</span>
                      </div>
                    </div>
                    <div className="text-center bg-slate-950 border border-dashed border-slate-800 py-3 rounded-xl text-[11px] text-amber-500/80">
                      ♟️ Move the White Rook on the board to solve.
                    </div>
                  </div>
                )}

                {/* Bot Tab */}
                {activeTab === 'bot' && (
                  <div className="space-y-6">
                    <div>
                      <span className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Choose Computer Difficulty
                      </span>
                      <div className="space-y-2.5">
                        {[
                          { title: 'Challenger Bot (Easy)', rating: '800 ELO', color: 'text-emerald-400', desc: 'Capable of errors. Great for practice.' },
                          { title: 'The Mentor (Medium)', rating: '1600 ELO', color: 'text-sky-400', desc: 'Plays solid positionals. Teaches errors fast.' },
                          { title: 'Stockfish 16 (Extreme)', rating: '3500 ELO', color: 'text-rose-500', desc: 'Absolute supercomputer. Zero tolerance.' },
                        ].map((botObj, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => navigate('/game/random')}
                            className="w-full flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/80 rounded-xl text-left transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <Bot className="w-5 h-5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                              <div>
                                <h5 className="font-semibold text-white text-sm">{botObj.title}</h5>
                                <p className="text-[11px] text-slate-400">{botObj.desc}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-mono font-bold ${botObj.color}`}>{botObj.rating}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status ticker */}
              <div className="mt-6 flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">42,912 Grandmasters playing</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">v3.4.1 SECURE</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
