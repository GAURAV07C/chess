import { Play } from 'lucide-react';

type HeroSectionProps = {
  onStartPlaying: () => void;
};

export const HeroSection = ({ onStartPlaying }: HeroSectionProps) => (
  <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-20">
    <div className="max-w-3xl space-y-8">
      <h1 className="font-serif text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
        Where Tactical <br />
        <span className="text-amber-500">Minds Clash.</span>
      </h1>
      <p className="text-lg text-slate-400 max-w-2xl mx-auto">
        Experience high-performance online chess with your friends or play against the bot. Simple, fast, and
        competitive.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <button
          onClick={onStartPlaying}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-lg transition-all shadow-lg hover:shadow-amber-500/35 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>Start Playing</span>
        </button>
      </div>
    </div>
  </main>
);
