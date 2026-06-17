export function Waitopponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 px-6">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl">♟️</span>
        </div>
      </div>
      <div className="text-center space-y-2">
        <h5 className="text-lg font-bold text-white">
          Searching for opponent...
        </h5>
        <p className="text-sm text-slate-400">
          Please wait while we find you a worthy challenger
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-amber-500/60 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
