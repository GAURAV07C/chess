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
import { useUser } from '@repo/store/useUser';
import { useChessBoardStore } from '@repo/store/chessBoard';

import GameEndModal from '@/components/GameEndModal';
import { Emoji } from '@/components/Emoji';
import { Chat } from '@/components/Chat';
import { GameBackground } from '@/components/game/GameBackground';
import { TurnIndicator } from '@/components/game/TurnIndicator';
import { PlayerPanel } from '@/components/game/PlayerPanel';
import { MatchmakingPanel } from '@/components/game/MatchmakingPanel';
import { MatchLogPanel } from '@/components/game/MatchLogPanel';

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
export const CHAT = 'CHAT';
export const EMOJI = 'EMOJI';
export enum Result {
  WHITE_WINS = 'WHITE_WINS',
  BLACK_WINS = 'BLACK_WINS',
  DRAW = 'DRAW',
}
export interface GameResult {
  result: Result;
  by: string;
}

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

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
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: string; text: string; timestamp: number; isOwn: boolean }[]
  >([]);
  const [floatingEmoji, setFloatingEmoji] = useState<string | null>(null);

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

        case CHAT:
          setChatMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: message.payload.senderName || 'Unknown',
              text: message.payload.message,
              timestamp: Date.now(),
              isOwn: message.payload.senderId === user?.id,
            },
          ]);
          break;

        case EMOJI:
          if (message.payload.senderId !== user?.id) {
            setFloatingEmoji(message.payload.emoji);
            setTimeout(() => setFloatingEmoji(null), 3000);
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chess, gameId, navigate, setMoves, socket]);

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
    <GameBackground>
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

      <TurnIndicator
        started={started}
        turn={chess.turn()}
        myColor={user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w'}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-12 w-full">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full items-stretch lg:items-start lg:justify-center">
          {/* Left side — Opponent panel */}
          {started && (
            <aside className="order-1 lg:order-1 w-full lg:w-64 shrink-0 flex flex-col gap-3">
              <div className="rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 p-4 shadow-lg">
                <PlayerPanel
                  gameMetadata={gameMetadata}
                  player1TimeConsumed={player1TimeConsumed}
                  player2TimeConsumed={player2TimeConsumed}
                />
              </div>
              <div className="flex gap-2">
                <Chat
                  gameId={gameId ?? ''}
                  socket={socket}
                  messages={chatMessages}
                  onSendMessage={(msg) => setChatMessages((prev) => [...prev, msg])}
                />
                <Emoji gameId={gameId ?? ''} socket={socket} floatingEmoji={floatingEmoji} />
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
            {started ? (
              <PlayerPanel
                gameMetadata={gameMetadata}
                player1TimeConsumed={player1TimeConsumed}
                player2TimeConsumed={player2TimeConsumed}
                self
              />
            ) : null}

            {!started ? (
              <MatchmakingPanel
                added={added}
                gameId={gameID}
                isRandom={gameId === 'random'}
                onStartMatch={() => {
                  socket.send(JSON.stringify({ type: INIT_GAME }));
                }}
              />
            ) : (
              <MatchLogPanel setResult={setResult} onExit={handleExit} />
            )}
          </div>
        </div>
      </div>
    </GameBackground>
  );
};
