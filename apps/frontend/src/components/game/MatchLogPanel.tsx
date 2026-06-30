import { GameResult } from '@/screens/Game';
import MovesTable from '../MovesTable';
import ExitGameModel from '../ExitGameModel';

const MatchLogPanel = ({
  setResult,
  onExit,
}: {
  setResult: React.Dispatch<React.SetStateAction<GameResult | null>>;
  onExit: () => void;
}) => {
  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 shadow-xl backdrop-blur-md overflow-hidden flex flex-col h-[400px] lg:h-[calc(100vh-140px)] min-h-[400px]">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
        <h3 className="font-bold text-slate-200 tracking-wide">Match Log</h3>
        <ExitGameModel onClick={onExit} />
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2">
          <MovesTable setResult={setResult} />
        </div>
      </div>
    </div>
  );
};

export { MatchLogPanel };
