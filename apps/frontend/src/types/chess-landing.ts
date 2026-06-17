export type TimeControlValue = '1+0' | '3+0' | '5+3' | '10+0' | '30+0';

export interface ChessPiece {
  type: 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
  color: 'w' | 'b';
  id: string;
}

export type BoardState = (ChessPiece | null)[][];
