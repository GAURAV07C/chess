import { Palette } from 'lucide-react';

export const ThemeSection = () => (
  <div className="flex items-center gap-2">
    <Palette className="w-4 h-4 text-slate-300" />
    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Theme</h3>
  </div>
);
