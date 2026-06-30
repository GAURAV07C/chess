type Theme = {
  id: string;
  name: string;
  accentColor: string;
};

type ThemeSelectorProps = {
  themes: Theme[];
  activeTheme: string;
  onSelectTheme: (name: string) => void;
};

export const ThemeCard = ({ theme, isActive, onClick }: { theme: Theme; isActive: boolean; onClick: () => void }) => (
  <button
    key={theme.id}
    onClick={onClick}
    className={`group relative rounded-2xl border p-3 text-left transition-all hover:scale-[1.03] focus:outline-none ${
      isActive
        ? 'border-white/80 bg-white/10 ring-1 ring-white/60'
        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
    }`}
  >
    <div
      className="h-10 w-10 rounded-lg border border-slate-800 shadow-sm"
      style={{ backgroundColor: theme.accentColor }}
    />
    <p
      className={`mt-3 text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}
    >
      {theme.name}
    </p>
  </button>
);

export const ThemeSelector = ({ themes, activeTheme, onSelectTheme }: ThemeSelectorProps) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
    {themes.map((theme) => (
      <ThemeCard
        key={theme.id}
        theme={theme}
        isActive={activeTheme === theme.name}
        onClick={() => onSelectTheme(theme.name)}
      />
    ))}
  </div>
);
