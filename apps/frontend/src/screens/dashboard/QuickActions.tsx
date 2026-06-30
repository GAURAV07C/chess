import { ChevronRight, UserRound } from 'lucide-react';

type QuickAction = {
  label: string;
  icon: typeof UserRound;
  href: string;
};

type QuickActionsProps = {
  actions: QuickAction[];
  onNavigate: (href: string) => void;
};

export const QuickActions = ({ actions, onNavigate }: QuickActionsProps) => (
  <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3">
    {actions.map((action, i) => {
      const Icon = action.icon;
      return (
        <button
          key={i}
          onClick={() => onNavigate(action.href)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
            {action.label}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
        </button>
      );
    })}
  </div>
);
