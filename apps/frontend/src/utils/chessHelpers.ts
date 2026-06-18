import { Chess, Square } from 'chess.js';

export function isPromoting(chess: Chess, from: Square, to: Square): boolean {
  if (!from) {
    return false;
  }

  const piece = chess.get(from);

  if (piece?.type !== 'p') {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!['1', '8'].some((it) => to.endsWith(it))) {
    return false;
  }

  return chess
    .history({ verbose: true })
    .map((it) => it.to)
    .includes(to);
}
