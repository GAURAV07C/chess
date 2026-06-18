import MoveSound from '/move.wav';

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

export interface Player {
  id: string;
  name: string;
  isGuest: boolean;
}

export interface Metadata {
  blackPlayer: Player;
  whitePlayer: Player;
}

const GAME_TIME_MS = 10 * 60 * 1000;
export { GAME_TIME_MS };

export const moveAudio = new Audio(MoveSound);
