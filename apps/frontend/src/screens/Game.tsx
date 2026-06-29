/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import MoveSound from '/move.wav';
import { ChessBoard } from '../components/ChessBoard';
import { isPromoting } from '@/utils/chessHelpers';
import { useSocket } from '../hooks/useSocket';
import { Chess, Move } from 'chess.js';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import MovesTable from '../components/MovesTable';
import { useUser } from '@repo/store/useUser';
import { useChessBoardStore } from '@repo/store/chessBoard';
import { UserAvatar } from '../components/UserAvatar';

export const INIT_GAME = 'init_game';
export const MOVE = 'move';
export const OPPONENT_DISCONNECTED = 'opponent_disconnected';
export const GAME_OVER = 'game_over';
export const JOIN_ROOM = 'join_room';
export const GAME_JOINED = 'game_joined';
export const GAME_ALERT = 'game_alert';
export const GAME_ADDED = 'game_added';
export const USER_TIMEOUT = 'user_timeout';
export const GAME_TIME = 'game_time';
export const GAME_ENDED = 'game_ended';
export const EXIT_GAME = 'exit_game';
export enum Result {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
}
export interface GameResult {
  result: Result;
  by: string;
}

const GAME_TIME_MS = 10 * 60 * 1000;

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

import GameEndModal from '@/components/GameEndModal';
import { Waitopponent } from '@/components/ui/waitopponent';
import { ShareGame } from '../components/ShareGame';
import ExitGameModel from '@/components/ExitGameModel';

const moveAudio = new Audio(MoveSound);

export interface Metadata {
  blackPlayer: Player;
  whitePlayer: Player;
}

export const Game = () => {
  const socket = useSocket();
  const { gameId } = useParams();
  const user = useUser();

  const navigate = useNavigate();
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [added, setAdded] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const [gameID, setGameID] = useState('');
  const [incomingMessages, setIncomingMessages] = useState<
    Array<{ id: string; senderName: string; content: string; hasEmoji: boolean }>
  >([]);
  const [activeEmoji, setActiveEmoji] = useState<{ id: string; emoji: string; senderName: string } | null>(null);
  const setMoves = useChessBoardStore((state) => state.setMoves);
  const userSelectedMoveIndex = useChessBoardStore((state) => state.userSelectedMoveIndex);
  const userSelectedMoveIndexRef = useRef(userSelectedMoveIndex);

  useEffect(() => {
    userSelectedMoveIndexRef.current = userSelectedMoveIndex;
  }, [userSelectedMoveIndex]);

  useEffect(() => {
    if (!user) {
      window.location.href = '/login';
    }
  }, [user]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = function (event) {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case GAME_ADDED:
          setAdded(true);
          setGameID(() => message.gameId);
          break;
        case INIT_GAME:
          setBoard(chess.board());
          setStarted(true);
          navigate(`/game/${message.payload.gameId}`);
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          break;
        case MOVE:
          const { move, player1TimeConsumed, player2TimeConsumed } = message.payload;
          setPlayer1TimeConsumed(player1TimeConsumed);
          setPlayer2TimeConsumed(player2TimeConsumed);
          if (userSelectedMoveIndexRef.current !== null) {
            setMoves((moves) => [...moves, move]);
            return;
          }
          try {
            if (isPromoting(chess, move.from, move.to)) {
              chess.move({
                from: move.from,
                to: move.to,
                promotion: 'q',
              });
            } else {
              chess.move({ from: move.from, to: move.to });
            }
            setMoves((moves) => [...moves, move]);
            moveAudio.play();
          } catch (error) {
            console.log('Error', error);
          }
          break;
        case GAME_OVER:
          setResult(message.payload.result);
          break;

        case GAME_ENDED:
          let wonBy;
          switch (message.payload.status) {
            case 'COMPLETED':
              wonBy = message.payload.result !== 'DRAW' ? 'CheckMate' : 'Draw';
              break;
            case 'PLAYER_EXIT':
              wonBy = 'Player Exit';
              break;
            default:
              wonBy = 'Timeout';
          }
          setResult({
            result: message.payload.result,
            by: wonBy,
          });
          chess.reset();
          setStarted(false);
          setAdded(false);

          break;

        case USER_TIMEOUT:
          setResult(message.payload.win);
          break;

        case GAME_JOINED:
          setGameMetadata({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          setPlayer1TimeConsumed(message.payload.player1TimeConsumed);
          setPlayer2TimeConsumed(message.payload.player2TimeConsumed);
          setStarted(true);

          message.payload.moves.map((x: Move) => {
            if (isPromoting(chess, x.from, x.to)) {
              chess.move({ ...x, promotion: 'q' });
            } else {
              chess.move(x);
            }
          });
          setMoves(message.payload.moves);
          break;

        case GAME_TIME:
          setPlayer1TimeConsumed(message.payload.player1Time);
          setPlayer2TimeConsumed(message.payload.player2Time);
          break;

        default:
          if (message.payload?.message) {
            toast.error(message.payload.message);
          }
          break;
      }
    };

    if (gameId !== 'random') {
      socket.send(
        JSON.stringify({
          type: JOIN_ROOM,
          payload: {
            gameId,
          },
        })
      );
    }
  }, [chess, gameId, navigate, setMoves, socket]);

  // Chat message listener — runs parallel to game socket
  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'chat_message') {
          setIncomingMessages((prev) => [
            ...prev,
            { id: message.id, senderName: message.senderName, content: message.content, hasEmoji: message.hasEmoji },
          ]);
          if (message.hasEmoji) {
            setActiveEmoji({ id: message.id, emoji: message.content, senderName: message.senderName });
            setTimeout(() => setActiveEmoji(null), 2500);
          }
          setTimeout(() => {
            setIncomingMessages((prev) => prev.filter((m) => m.id !== message.id));
          }, 4000);
        }
      } catch (e) {
        console.error('Chat parse error', e);
      }
    };
    socket.addEventListener('message', handler);
    return () => socket.removeEventListener('message', handler);
  }, [socket, user]);

  useEffect(() => {
    if (started) {
      const interval = setInterval(() => {
        if (chess.turn() === 'w') {
          setPlayer1TimeConsumed((p) => p + 100);
        } else {
          setPlayer2TimeConsumed((p) => p + 100);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [started, gameMetadata, user, chess]);

  const getTimer = (timeConsumed: number) => {
    const timeLeftMs = GAME_TIME_MS - timeConsumed;
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return (
      <div
        className={`font-mono text-xl font-bold px-4 py-2 rounded-xl border shadow-inner ${
          timeLeftMs < 60000
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
            : 'bg-slate-900/80 text-white border-slate-800'
        }`}
      >
        {minutes < 10 ? '0' : ''}
        {minutes}:{remainingSeconds < 10 ? '0' : ''}
        {remainingSeconds}
      </div>
    );
  };

  const handleExit = () => {
    socket?.send(
      JSON.stringify({
        type: EXIT_GAME,
        payload: {
          gameId,
        },
      })
    );
    setMoves([]);
    navigate('/');
  };

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="min-h-screen bg-[#030611] text-white relative overflow-hidden selection:bg-amber-500/30 selection:text-white">
      {/* Background glowing orbs */}
      <div className="absolute top-[-200px] left-[10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.05] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[15%] right-[5%] w-[600px] h-[600px] rounded-full bg-sky-500/[0.04] blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/[0.03] blur-[100px] pointer-events-none -z-10" />
      <div
        className="absolute inset-0 opacity-[0.2] -z-20"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.12) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {result && (
        <GameEndModal
          blackPlayer={gameMetadata?.blackPlayer}
          whitePlayer={gameMetadata?.whitePlayer}
          gameResult={result}
          onClose={() => {
            setResult(null);
            navigate('/dashboard');
          }}
        />
      )}

      {/* Floating Message Popup — Ludo King style */}
      {started && (incomingMessages.length > 0 || activeEmoji) && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none">
          {activeEmoji && (
            <div key={activeEmoji.id} className="animate-[emojiFloat_2s_ease-out_forwards] text-5xl drop-shadow-2xl">
              {activeEmoji.emoji}
            </div>
          )}
          {incomingMessages.map((msg) => (
            <div key={msg.id} className="pointer-events-auto animate-[msgPop_0.4s_ease-out]">
              <div className="bg-slate-900/90 border border-slate-700/50 backdrop-blur-md rounded-2xl px-5 py-3 shadow-2xl max-w-[260px]">
                <p className="text-[11px] font-bold text-amber-400 mb-1">{msg.senderName}</p>
                <p className="text-sm text-white break-words leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline keyframes for popup animations */}
      <style>{`
        @keyframes emojiFloat {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-40px) scale(1.3); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
        }
        @keyframes msgPop {
          0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Turn Indicator */}
      <div className="w-full flex justify-center pt-6 mb-2">
        {started ? (
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md transition-all">
            <div
              className={`w-2.5 h-2.5 rounded-full ${(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') === chess.turn() ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}
            />
            <span
              className={`text-sm font-bold tracking-wide ${(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') === chess.turn() ? 'text-amber-400' : 'text-slate-400'}`}
            >
              {(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') === chess.turn()
                ? 'Your turn'
                : "Opponent's turn"}
            </span>
          </div>
        ) : (
          <div className="h-10"></div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 w-full">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full items-stretch lg:items-start lg:justify-center">
          {/* Left side — Opponent panel */}
          {started && (
            <aside className="order-1 lg:order-1 w-full lg:w-52 xl:w-56 shrink-0">
              <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 shadow-lg flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-4">
                <UserAvatar gameMetadata={gameMetadata} />
                <div className="lg:mt-auto lg:pt-4 lg:border-t lg:border-slate-800/60 flex lg:justify-center">
                  {getTimer(user?.id === gameMetadata?.whitePlayer?.id ? player2TimeConsumed : player1TimeConsumed)}
                </div>
              </div>
            </aside>
          )}

          {/* Center — Board */}
          <div className="order-2 lg:order-2 flex-1 w-full max-w-[640px] mx-auto">
            <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800/50">
              <ChessBoard
                started={started}
                gameId={gameId ?? ''}
                myColor={user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'}
                chess={chess}
                setBoard={setBoard}
                socket={socket}
                board={board}
              />
            </div>
          </div>

          {/* Right side — Self panel + Moves log */}
          <div className="order-3 w-full lg:w-[360px] shrink-0 flex flex-col gap-4">
            {started && (
              <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 shadow-lg flex flex-row lg:flex-col items-center lg:items-stretch justify-between lg:justify-start gap-4">
                <UserAvatar gameMetadata={gameMetadata} self />
                <div className="lg:mt-auto lg:pt-4 lg:border-t lg:border-slate-800/60 flex lg:justify-center">
                  {getTimer(user?.id === gameMetadata?.blackPlayer?.id ? player2TimeConsumed : player1TimeConsumed)}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 shadow-xl backdrop-blur-md overflow-hidden flex flex-col h-[400px] lg:h-[calc(100vh-140px)] min-h-[400px]">
              {!started ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  {added ? (
                    <div className="flex flex-col items-center space-y-8 w-full">
                      <Waitopponent />
                      <div className="w-full pt-4 border-t border-slate-800">
                        <ShareGame gameId={gameID} />
                      </div>
                    </div>
                  ) : (
                    gameId === 'random' && (
                      <div className="flex flex-col items-center gap-6 w-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 mb-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-amber-500"
                          >
                            <path d="M12 20v-6M6 20V10M18 20V4" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white font-serif mb-2">Quick Match</h2>
                          <p className="text-slate-400 text-sm max-w-[250px]">
                            Get matched instantly with a player of your skill level from around the world.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            socket.send(
                              JSON.stringify({
                                type: INIT_GAME,
                              })
                            );
                          }}
                          className="mt-4 px-8 py-4 text-base bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 w-full hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Find Opponent
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-slate-200 tracking-wide">Match Log</h3>
                    <ExitGameModel onClick={() => handleExit()} />
                  </div>
                  <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
                      <MovesTable setResult={setResult} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
