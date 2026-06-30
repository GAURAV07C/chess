export const LoginHeader = () => (
  <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#030611]/85 border-b border-slate-900/60 px-6 md:px-14 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-serif font-black shadow-lg shadow-amber-500/10 text-xl">
          ♜
        </span>
        <span className="font-serif text-xl font-extrabold text-white tracking-tight">
          Chess<span className="text-amber-500 font-sans font-medium">Platform</span>
        </span>
      </div>
      <a
        href="/"
        className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white border border-slate-800 px-3 py-1.5 rounded-xl transition-all font-semibold hover:bg-slate-900 cursor-pointer"
      >
        ← Back to Home
      </a>
    </div>
  </header>
);
