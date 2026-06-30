import { Gamepad2 } from 'lucide-react';

type GameRecord = {
  id: string;
  opponentName: string;
  result: string;
  color: string;
};

type HistoryItemProps = {
  game: GameRecord;
};

export const HistoryItem = ({ game }: HistoryItemProps) => {
  const won =
    (game.color === 'white' && game.result === 'WHITE_WINS') ||
    (game.color === 'black' && game.result === 'BLACK_WINS');
  const isDraw = game.result === 'DRAW';

  return (
    <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex items-center justify-between hover:border-slate-800 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isDraw
              ? 'bg-slate-500/10 text-slate-300'
              : won
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-rose-500/10 text-rose-400'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">vs {game.opponentName || 'Opponent'}</p>
          <p className="text-slate-400 text-xs mt-0.5">Playing as {game.color}</p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isDraw ? 'text-slate-300' : won ? 'text-amber-400' : 'text-rose-400'}`}>
        {isDraw ? 'Draw' : won ? 'Win' : 'Loss'}
      </span>
    </div>
  );
};

type GameHistoryProps = {
  games: GameRecord[];
};

const EmptyHistory = () => (
  <p className="text-slate-500 text-sm py-6 text-center">No completed games yet. Start playing!</p>
);

export const GameHistory = ({ games }: GameHistoryProps) => (
  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
    {games.map((game) => (
      <HistoryItem key={game.id} game={game} />
    ))}
    {games.length === 0 && <EmptyHistory />}
  </div>
);
