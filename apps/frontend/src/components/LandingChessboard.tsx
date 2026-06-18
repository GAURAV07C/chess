import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChessPiece } from '@/types/chess-landing';
import { THEME_DATA } from '@/constants/themes';
import { RotateCcw, Award, Trophy, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface LandingChessboardProps {
  theme: THEME_DATA;
  isInteractive?: boolean;
  puzzleState?: 'none' | 'active' | 'success';
  onPuzzleSolved?: () => void;
  onResetBoard?: () => void;
}

// Initial board layout helper
const createInitialBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: ChessPiece['type'][] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'b', id: `b-${backRow[col]}-${col}` };
    board[1][col] = { type: 'p', color: 'b', id: `b-p-${col}` };
  }
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'p', color: 'w', id: `w-p-${col}` };
    board[7][col] = { type: backRow[col], color: 'w', id: `w-${backRow[col]}-${col}` };
  }
  return board;
};

const createPuzzleBoard = (): (ChessPiece | null)[][] => {
  const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  board[0][0] = { type: 'k', color: 'b', id: 'b-k-puz' };
  board[1][0] = { type: 'p', color: 'b', id: 'b-p1-puz' };
  board[1][1] = { type: 'p', color: 'b', id: 'b-p2-puz' };
  board[7][7] = { type: 'k', color: 'w', id: 'w-k-puz' };
  board[7][1] = { type: 'r', color: 'w', id: 'w-r-puz' };
  board[4][3] = { type: 'b', color: 'w', id: 'w-b-puz' };
  return board;
};

const playSound = (type: 'move' | 'capture' | 'victory' | 'click') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (type === 'move') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start(); osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'capture') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start(); osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'victory') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
        gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.25);
        osc.start(audioCtx.currentTime + i * 0.1);
        osc.stop(audioCtx.currentTime + i * 0.1 + 0.25);
      });
    } else if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
  } catch (_) {}
};

export const LandingChessboard: React.FC<LandingChessboardProps> = ({
  theme,
  isInteractive = true,
  puzzleState = 'none',
  onPuzzleSolved,
  onResetBoard
}) => {
  const [board, setBoard] = useState<(ChessPiece | null)[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [lastMove, setLastMove] = useState<{ from: [number, number]; to: [number, number] } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [puzzleSolvedLocal, setPuzzleSolvedLocal] = useState(false);
  const [evalScore, setEvalScore] = useState<number>(0.35);

  const getPercentageForBlack = (score: number) => {
    if (score > 50) return 0;
    if (score < -50) return 100;
    const clamped = Math.max(-8, Math.min(8, score));
    return 50 - (clamped / 8) * 50;
  };
  const blackHeight = getPercentageForBlack(evalScore);

  useEffect(() => {
    if (puzzleState !== 'none') {
      setBoard(createPuzzleBoard());
      setPuzzleSolvedLocal(false);
      setEvalScore(-2.4);
    } else {
      setBoard(createInitialBoard());
      setEvalScore(0.35);
    }
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setTurn('w');
  }, [puzzleState]);

  const handleReset = () => {
    if (soundEnabled) playSound('click');
    if (puzzleState !== 'none') {
      setBoard(createPuzzleBoard());
      setPuzzleSolvedLocal(false);
      setEvalScore(-2.4);
    } else {
      setBoard(createInitialBoard());
      setEvalScore(0.35);
    }
    setSelectedSquare(null);
    setValidMoves([]);
    setLastMove(null);
    setTurn('w');
    if (onResetBoard) onResetBoard();
  };

  const inBounds = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

  const calculateValidMoves = (r: number, c: number, currentBoard: (ChessPiece | null)[][]): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];
    const color = piece.color;

    if (puzzleState !== 'none') {
      if (piece.type === 'r' && color === 'w') {
        for (let row = 0; row < 8; row++) {
          if (row !== r) {
            const pieceAtDest = currentBoard[row][c];
            if (!pieceAtDest || pieceAtDest.color !== color) moves.push([row, c]);
          }
        }
        for (let col = 0; col < 8; col++) {
          if (col !== c) {
            const pieceAtDest = currentBoard[r][col];
            if (!pieceAtDest || pieceAtDest.color !== color) moves.push([r, col]);
          }
        }
      }
      return moves;
    }

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        if (inBounds(r + dir, c) && !currentBoard[r + dir][c]) {
          moves.push([r + dir, c]);
          if (r === startRow && !currentBoard[r + 2 * dir][c]) moves.push([r + 2 * dir, c]);
        }
        [c - 1, c + 1].forEach(tc => {
          if (inBounds(r + dir, tc)) {
            const t = currentBoard[r + dir][tc];
            if (t && t.color !== color) moves.push([r + dir, tc]);
          }
        });
        break;
      }
      case 'r': {
        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
          let cr = r + dr, cc = c + dc;
          while (inBounds(cr, cc)) {
            const dp = currentBoard[cr][cc];
            if (!dp) { moves.push([cr, cc]); }
            else { if (dp.color !== color) moves.push([cr, cc]); break; }
            cr += dr; cc += dc;
          }
        });
        break;
      }
      case 'n': {
        [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (inBounds(nr, nc)) {
            const d = currentBoard[nr][nc];
            if (!d || d.color !== color) moves.push([nr, nc]);
          }
        });
        break;
      }
      case 'b': {
        [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => {
          let cr = r + dr, cc = c + dc;
          while (inBounds(cr, cc)) {
            const dp = currentBoard[cr][cc];
            if (!dp) { moves.push([cr, cc]); }
            else { if (dp.color !== color) moves.push([cr, cc]); break; }
            cr += dr; cc += dc;
          }
        });
        break;
      }
      case 'q': {
        [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr, dc]) => {
          let cr = r + dr, cc = c + dc;
          while (inBounds(cr, cc)) {
            const dp = currentBoard[cr][cc];
            if (!dp) { moves.push([cr, cc]); }
            else { if (dp.color !== color) moves.push([cr, cc]); break; }
            cr += dr; cc += dc;
          }
        });
        break;
      }
      case 'k': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (inBounds(nr, nc)) {
              const d = currentBoard[nr][nc];
              if (!d || d.color !== color) moves.push([nr, nc]);
            }
          }
        }
        break;
      }
    }
    return moves;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (!isInteractive || puzzleSolvedLocal) return;
    const isValidMoveTarget = validMoves.some(([vr, vc]) => vr === r && vc === c);

    if (selectedSquare && isValidMoveTarget) {
      const [sr, sc] = selectedSquare;
      const pieceToMove = board[sr][sc];
      if (!pieceToMove) return;
      const isCapture = !!board[r][c];
      const nextBoard = board.map(row => [...row]);
      nextBoard[r][c] = pieceToMove;
      nextBoard[sr][sc] = null;
      setBoard(nextBoard);
      setLastMove({ from: [sr, sc], to: [r, c] });
      setSelectedSquare(null);
      setValidMoves([]);
      if (soundEnabled) playSound(isCapture ? 'capture' : 'move');

      if (puzzleState !== 'none' && r === 0 && c === 1) {
        setPuzzleSolvedLocal(true);
        setEvalScore(99.0);
        if (soundEnabled) setTimeout(() => playSound('victory'), 300);
        if (onPuzzleSolved) onPuzzleSolved();
      } else {
        setTurn(t => t === 'w' ? 'b' : 'w');
        setEvalScore(prev => {
          const shift = (Math.random() * 1.6 - 0.7);
          return Math.max(-8, Math.min(8, Number((prev + shift).toFixed(2))));
        });
      }
    } else {
      const piece = board[r][c];
      if (piece) {
        const matchesTurn = puzzleState !== 'none' ? piece.color === 'w' : piece.color === turn;
        if (matchesTurn) {
          setSelectedSquare([r, c]);
          setValidMoves(calculateValidMoves(r, c, board));
          if (soundEnabled) playSound('click');
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else {
        setSelectedSquare(null);
        setValidMoves([]);
      }
    }
  };

  const renderPieceSymbol = (piece: ChessPiece) => {
    const isW = piece.color === 'w';
    const fill = isW ? '#ffffff' : '#1e293b';
    const stroke = isW ? '#475569' : '#0f172a';
    const shadowClass = isW ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]' : 'drop-shadow-[0_2px_4px_rgba(255,255,255,0.1)]';
    switch (piece.type) {
      case 'p': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="85" rx="25" ry="8" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M40 80C35 60 45 45 45 35" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <path d="M60 80C65 60 55 45 55 35" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <rect x="42" y="35" width="16" height="42" fill={fill} stroke={stroke} strokeWidth="4" />
          <circle cx="50" cy="30" r="14" fill={fill} stroke={stroke} strokeWidth="6" />
        </svg>
      );
      case 'r': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <rect x="25" y="80" width="50" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M30 80 L35 45 L65 45 L70 80 Z" fill={fill} stroke={stroke} strokeWidth="6" />
          <rect x="30" y="30" width="40" height="15" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M30 30 L25 15 L36 15 L36 22 L45 22 L45 15 L55 15 L55 22 L64 22 L64 15 L75 15 L70 30 Z" fill={fill} stroke={stroke} strokeWidth="6" />
        </svg>
      );
      case 'n': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="85" rx="25" ry="8" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M33 80 C33 70 30 50 38 40 C43 33 55 35 60 25 C63 20 62 10 52 12 C42 14 36 24 30 32 C26 38 27 45 23 48 C18 52 20 58 28 56 C33 55 37 60 37 68 L37 80 Z" fill={fill} stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
          <path d="M70 80 C70 65 65 52 58 45" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <circle cx="43" cy="24" r="3.5" fill={stroke} />
        </svg>
      );
      case 'b': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="85" rx="25" ry="8" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M35 80 C32 60 40 40 50 25 C60 40 68 60 65 80 Z" fill={fill} stroke={stroke} strokeWidth="6" />
          <circle cx="50" cy="20" r="5" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M42 45 L58 45 M50 37 L50 56" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
      case 'q': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="88" rx="28" ry="7" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M25 83 L15 35 L33 58 L50 25 L67 58 L85 35 L75 83 Z" fill={fill} stroke={stroke} strokeWidth="6" strokeLinejoin="round" />
          <circle cx="15" cy="28" r="5" fill={fill} stroke={stroke} strokeWidth="4" />
          <circle cx="50" cy="18" r="5" fill={fill} stroke={stroke} strokeWidth="4" />
          <circle cx="85" cy="28" r="5" fill={fill} stroke={stroke} strokeWidth="4" />
        </svg>
      );
      case 'k': return (
        <svg className={`w-3/4 h-3/4 ${shadowClass}`} viewBox="0 0 100 100" fill="none">
          <ellipse cx="50" cy="88" rx="28" ry="7" fill={fill} stroke={stroke} strokeWidth="6" />
          <path d="M25 83 C25 70 30 40 50 35 C70 40 75 70 75 83 Z" fill={fill} stroke={stroke} strokeWidth="6" />
          <rect x="30" y="55" width="40" height="8" rx="1" fill={fill} stroke={stroke} strokeWidth="5" />
          <path d="M50 14 L50 30 M42 20 L58 20" stroke={stroke} strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="50" cy="33" rx="14" ry="4" fill={fill} stroke={stroke} strokeWidth="4" />
        </svg>
      );
      default: return null;
    }
  };

  const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];

  return (
    <div className="flex flex-col items-center w-full max-w-[530px] md:max-w-[620px] lg:max-w-[680px] xl:max-w-[730px] select-none">
      {/* Board Panel Header */}
      <div className="flex justify-between items-center w-full mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 h-6 bg-slate-900/40 px-2.5 py-1 rounded-full border border-slate-800 text-xs text-slate-300 font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${turn === 'w' ? 'bg-[#f0d9b5] animate-pulse' : 'bg-slate-700'}`} />
            <span>{turn === 'w' ? 'White' : 'Black'} to move</span>
          </div>
          {puzzleState !== 'none' && (
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Puzzle Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 h-7 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-[11px] text-slate-300 flex items-center gap-1 hover:text-white transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* Main Board & Eval Bar */}
      <div className="flex gap-2.5 md:gap-3.5 w-full aspect-square items-stretch">
        {/* Eval Bar */}
        <div className="w-4 md:w-5 bg-slate-950/95 rounded-2xl overflow-hidden flex flex-col border border-slate-800/60 shrink-0 shadow-inner">
          <div className="w-full bg-slate-900 transition-all duration-500 ease-out flex items-start justify-center pt-2 select-none" style={{ height: `${blackHeight}%` }}>
            {evalScore < 0 && <span className="text-[8px] md:text-[9.5px] font-mono font-bold text-slate-400 leading-none">{evalScore < -50 ? 'M1' : evalScore}</span>}
          </div>
          <div className="h-[2.5px] bg-amber-500/40 w-full z-10 shrink-0" />
          <div className="w-full bg-[#f8fafc] transition-all duration-500 ease-out flex items-end justify-center pb-2 flex-grow select-none">
            {evalScore >= 0 && <span className="text-[8px] md:text-[9.5px] font-mono font-bold text-slate-800 leading-none">{evalScore > 50 ? 'M1' : `+${evalScore}`}</span>}
          </div>
        </div>

        {/* Board Container */}
        <div className={`relative flex-grow h-full rounded-2xl p-2.5 md:p-3 border-4 shadow-2xl transition-colors duration-500 ${theme.boardBg}`}>
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full rounded-md overflow-hidden bg-slate-950">
            {board.length > 0 && board.map((row, rIndex) =>
              row.map((piece, cIndex) => {
                const isLight = (rIndex + cIndex) % 2 === 0;
                const squareClass = isLight ? theme.lightSquare : theme.darkSquare;
                const isSelected = selectedSquare && selectedSquare[0] === rIndex && selectedSquare[1] === cIndex;
                const highlightStyle = isSelected ? 'ring-4 ring-amber-400 ring-inset bg-amber-400/40 z-10' : '';
                const isLastMoveSrc = lastMove && lastMove.from[0] === rIndex && lastMove.from[1] === cIndex;
                const isLastMoveDest = lastMove && lastMove.to[0] === rIndex && lastMove.to[1] === cIndex;
                const lastMoveStyle = (isLastMoveSrc || isLastMoveDest) ? 'after:absolute after:inset-0 after:bg-sky-500/15' : '';
                const isValidMove = validMoves.some(([vr, vc]) => vr === rIndex && vc === cIndex);
                const hasEnemy = isValidMove && piece && piece.color !== (selectedSquare ? board[selectedSquare[0]][selectedSquare[1]]?.color : '');
                return (
                  <div
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleSquareClick(rIndex, cIndex)}
                    className={`relative flex items-center justify-center cursor-pointer select-none transition-colors duration-200 ${squareClass} ${highlightStyle} ${lastMoveStyle}`}
                  >
                    <AnimatePresence mode="popLayout">
                      {piece && (
                        <motion.div
                          key={piece.id}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.7, opacity: 0 }}
                          whileHover={isInteractive ? { scale: 1.08 } : {}}
                          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                          className="absolute inset-0 flex items-center justify-center z-10"
                        >
                          {renderPieceSymbol(piece)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {isValidMove && !hasEnemy && (
                      <span className="absolute w-3.5 h-3.5 md:w-5 md:h-5 rounded-full bg-slate-900/25 ring-2 ring-white/10 z-20" />
                    )}
                    {isValidMove && hasEnemy && (
                      <span className="absolute inset-0 border-[3.5px] border-rose-500 bg-rose-500/10 rounded-none z-20 animate-pulse" />
                    )}
                    {cIndex === 0 && (
                      <span className={`absolute left-1 top-0.5 text-[8.5px] font-mono leading-none ${isLight ? 'text-slate-500/60' : 'text-white/45'}`}>{rows[rIndex]}</span>
                    )}
                    {rIndex === 7 && (
                      <span className={`absolute right-1 bottom-0.5 text-[8.5px] font-mono leading-none ${isLight ? 'text-slate-500/60' : 'text-white/45'}`}>{columns[cIndex]}</span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Puzzle Solved Overlay */}
          <AnimatePresence>
            {puzzleSolvedLocal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 rounded-2xl border border-emerald-500/30 backdrop-blur-md z-30 px-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4"
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Checkmate!</h2>
                <p className="text-sm text-slate-300 max-w-[280px] mb-5">
                  You spotted the back-rank weakness and delivered a crushing victory.
                </p>
                <div className="flex gap-3">
                  <span className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/40">
                    <Award className="w-4 h-4" /> +15 Elo Rating
                  </span>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    Restart Puzzle
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
