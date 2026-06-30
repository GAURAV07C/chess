import { Swords } from 'lucide-react';

type GameMode = {
  id: string;
  icon: typeof Swords;
  label: string;
  desc: string;
  accent: string;
  href: string;
};

type GameModeCardProps = {
  mode: GameMode;
  onClick: () => void;
};

export const GameModeCard = ({ mode, onClick }: GameModeCardProps) => {
  const Icon = mode.icon;
  return (
    <button
      onClick={onClick}
      className="group text-left w-full p-6 rounded-2xl border border-slate-900 bg-slate-950 hover:bg-slate-900 transition-all cursor-pointer"
    >
      <div className="flex flex-col gap-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.accent} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-base md:text-lg group-hover:text-amber-400 transition-colors">
            {mode.label}
          </h3>
          <p className="text-slate-400 text-xs md:text-sm mt-1">{mode.desc}</p>
        </div>
      </div>
    </button>
  );
};
