/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import MoveSound from '/move.wav';
import { ChessBoard } from '../components/ChessBoard';
import { isPromoting } from '@/utils/chessHelpers';
import { useSocket } from '../hooks/useSocket';
import { Chess, Move } from 'chess.js';
import { useNavigate, useParams } from 'react-router-dom';
import MovesTable from '../components/MovesTable';
import { useUser } from '@repo/store/useUser';
import { useChessBoardStore } from '@repo/store/chessBoard';
import { UserAvatar } from '../components/UserAvatar';

// TODO: Move together, there's code repetition here
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
  // Todo move to store/context
  const [chess, _setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [added, setAdded] = useState(false);
  const [started, setStarted] = useState(false);
  const [gameMetadata, setGameMetadata] = useState<Metadata | null>(null);
  const [result, setResult] = useState<GameResult | null>(null);
  const [player1TimeConsumed, setPlayer1TimeConsumed] = useState(0);
  const [player2TimeConsumed, setPlayer2TimeConsumed] = useState(0);
  const [gameID, setGameID] = useState('');
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
          console.error(message.payload);
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
          alert(message.payload.message);
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
  }, [chess, socket]);

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
  }, [started, gameMetadata, user]);

  const getTimer = (timeConsumed: number) => {
    const timeLeftMs = GAME_TIME_MS - timeConsumed;
    const minutes = Math.floor(timeLeftMs / (1000 * 60));
    const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

    return (
      <div className="text-white">
        Time Left: {minutes < 10 ? '0' : ''}
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
    <div className="min-h-screen bg-[#030611] text-white">
      {result && (
        <GameEndModal
          blackPlayer={gameMetadata?.blackPlayer}
          whitePlayer={gameMetadata?.whitePlayer}
          gameResult={result}
        ></GameEndModal>
      )}
      {started && (
        <div className="justify-center flex pt-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
            {(user?.id === gameMetadata?.blackPlayer?.id ? 'b' : 'w') === chess.turn() ? 'Your turn' : "Opponent's turn"}
          </div>
        </div>
      )}
      <div className="justify-center flex">
        <div className="pt-2 w-full">
          <div className="flex gap-6 w-full items-start">
            <div className="flex-1">
              <div className="flex justify-center">
                <div>
                  {started && (
                    <div className="mb-4">
                      <div className="flex justify-between">
                        <UserAvatar gameMetadata={gameMetadata} />
                        {getTimer(
                          user?.id === gameMetadata?.whitePlayer?.id ? player2TimeConsumed : player1TimeConsumed
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className={`w-full flex justify-center text-white`}>
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
                  {started && (
                    <div className="mt-4 flex justify-between">
                      <UserAvatar gameMetadata={gameMetadata} self />
                      {getTimer(user?.id === gameMetadata?.blackPlayer?.id ? player2TimeConsumed : player1TimeConsumed)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl pt-2 bg-slate-900/60 border border-slate-800 w-[340px] shrink-0 overflow-auto h-[95vh] no-scrollbar">
              {!started ? (
                <div className="pt-8 flex justify-center w-full">
                  {added ? (
                    <div className="flex flex-col items-center space-y-6 justify-center w-full px-6">
                      <Waitopponent />
                      <ShareGame gameId={gameID} />
                    </div>
                  ) : (
                    gameId === 'random' && (
                      <div className="flex flex-col items-center gap-4 w-full px-6">
                        <p className="text-slate-400 text-sm text-center">Start a new random match online</p>
                        <button
                          onClick={() => {
                            socket.send(
                              JSON.stringify({
                                type: INIT_GAME,
                              })
                            );
                          }}
                          className="px-8 py-4 text-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 w-full"
                        >
                          Play Now
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="p-6 flex justify-center w-full">
                  <ExitGameModel onClick={() => handleExit()} />
                </div>
              )}
              <div>
                <MovesTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
