interface TurnIndicatorProps {
  started: boolean;
  turn: 'w' | 'b';
  myColor: 'w' | 'b';
}

const TurnIndicator = ({ started, turn, myColor }: TurnIndicatorProps) => {
  const isMyTurn = myColor === turn;

  return (
    <div className="w-full flex justify-center pt-6 mb-2">
      {started ? (
        <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 shadow-lg backdrop-blur-md transition-all">
          <div className={`w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className={`text-sm font-bold tracking-wide ${isMyTurn ? 'text-amber-400' : 'text-slate-400'}`}>
            {isMyTurn ? 'Your turn' : "Opponent's turn"}
          </span>
        </div>
      ) : (
        <div className="h-10" />
      )}
    </div>
  );
};

export { TurnIndicator };
