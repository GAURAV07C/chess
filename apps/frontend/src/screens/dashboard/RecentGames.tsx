import { Gamepad2 } from 'lucide-react';

type RecentGamesProps = {
  games: {
    id: string;
    opponentName: string;
    result: 'WHITE_WINS' | 'BLACK_WINS' | 'DRAW';
    color: 'white' | 'black';
    date: string;
  }[];
};

export const RecentGameItem = ({ game }: { game: RecentGamesProps['games'][0] }) => {
  const won =
    (game.color === 'white' && game.result === 'WHITE_WINS') ||
    (game.color === 'black' && game.result === 'BLACK_WINS');
  const isDraw = game.result === 'DRAW';

  return (
    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex items-center justify-between">
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
          <p className="text-white font-bold text-sm">vs {game.opponentName || 'Anonymous'}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            {new Date(game.date).toLocaleDateString()} · {game.color}
          </p>
        </div>
      </div>
      <span className={`text-sm font-bold ${isDraw ? 'text-slate-300' : won ? 'text-amber-400' : 'text-rose-400'}`}>
        {isDraw ? 'Draw' : won ? 'Win' : 'Loss'}
      </span>
    </div>
  );
};

export const RecentGames = ({ games }: RecentGamesProps) => (
  <div className="space-y-3">
    {games.slice(0, 5).map((game) => (
      <RecentGameItem key={game.id} game={game} />
    ))}
    {games.length === 0 && (
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-8 flex flex-col items-center justify-center text-center h-[200px]">
        <Gamepad2 className="w-10 h-10 text-slate-800 mb-3" />
        <p className="text-slate-300 font-bold text-sm">No recent games</p>
        <p className="text-slate-500 text-xs mt-1">Play a match to see your activity here</p>
      </div>
    )}
  </div>
);
