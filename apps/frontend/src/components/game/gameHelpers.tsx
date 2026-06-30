export const getTimer = (timeConsumed: number) => {
  const GAME_TIME_MS = 10 * 60 * 1000;
  const timeLeftMs = GAME_TIME_MS - timeConsumed;
  const minutes = Math.floor(timeLeftMs / (1000 * 60));
  const remainingSeconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  return (
    <div
      className={`font-mono text-xl font-bold px-4 py-2 rounded-xl border shadow-inner ${
        timeLeftMs < 60000
          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
          : 'bg-slate-900/80 text-white border-slate-800'
      }`}
    >
      {minutes < 10 ? '0' : ''}
      {minutes}:{remainingSeconds < 10 ? '0' : ''}
      {remainingSeconds}
    </div>
  );
};
