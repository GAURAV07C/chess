import { Waitopponent } from '../ui/waitopponent';
import { ShareGame } from '../ShareGame';

interface MatchmakingPanelProps {
  added: boolean;
  gameId: string;
  isRandom: boolean;
  onStartMatch: () => void;
}

const MatchmakingPanel = ({ added, gameId, isRandom, onStartMatch }: MatchmakingPanelProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {added ? (
        <div className="flex flex-col items-center space-y-8 w-full">
          <Waitopponent />
          <div className="w-full pt-4 border-t border-slate-800">
            <ShareGame gameId={gameId} />
          </div>
        </div>
      ) : isRandom ? (
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
            onClick={onStartMatch}
            className="mt-4 px-8 py-4 text-base bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 w-full hover:scale-[1.02] active:scale-[0.98]"
          >
            Find Opponent
          </button>
        </div>
      ) : null}
    </div>
  );
};

export { MatchmakingPanel };
