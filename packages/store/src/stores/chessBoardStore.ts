import { create } from 'zustand';
import { Move } from 'chess.js';

interface ChessBoardState {
  isBoardFlipped: boolean;
  moves: Move[];
  userSelectedMoveIndex: number | null;
  setIsBoardFlipped: (flipped: boolean | ((prev: boolean) => boolean)) => void;
  setMoves: (moves: Move[] | ((prev: Move[]) => Move[])) => void;
  setUserSelectedMoveIndex: (index: number | null | ((prev: number | null) => number | null)) => void;
  toggleBoardFlipped: () => void;
  incrementUserSelectedMoveIndex: () => void;
  decrementUserSelectedMoveIndex: () => void;
}

export const useChessBoardStore = create<ChessBoardState>((set) => ({
  isBoardFlipped: false,
  moves: [],
  userSelectedMoveIndex: null,
  setIsBoardFlipped: (isBoardFlipped) =>
    set((state) => ({
      isBoardFlipped:
        typeof isBoardFlipped === 'function'
          ? (isBoardFlipped as (prev: boolean) => boolean)(state.isBoardFlipped)
          : isBoardFlipped,
    })),
  setMoves: (moves) =>
    set((state) => ({
      moves: typeof moves === 'function' ? (moves as (prev: Move[]) => Move[])(state.moves) : moves,
    })),
  setUserSelectedMoveIndex: (userSelectedMoveIndex) =>
    set((state) => ({
      userSelectedMoveIndex:
        typeof userSelectedMoveIndex === 'function'
          ? (userSelectedMoveIndex as (prev: number | null) => number | null)(state.userSelectedMoveIndex)
          : userSelectedMoveIndex,
    })),
  toggleBoardFlipped: () => set((state) => ({ isBoardFlipped: !state.isBoardFlipped })),
  incrementUserSelectedMoveIndex: () =>
    set((state) => ({
      userSelectedMoveIndex:
        state.userSelectedMoveIndex !== null
          ? state.userSelectedMoveIndex + 1 >= state.moves.length - 1
            ? state.moves.length - 1
            : state.userSelectedMoveIndex + 1
          : null,
    })),
  decrementUserSelectedMoveIndex: () =>
    set((state) => ({
      userSelectedMoveIndex:
        state.userSelectedMoveIndex !== null ? state.userSelectedMoveIndex - 1 : state.moves.length - 2,
    })),
}));
