import { THEME } from '@/context/themeContext';

export interface THEME_DATA {
  id: string;
  name: THEME;
  lightSquare: string;
  darkSquare: string;
  boardBg: string;
  accentColor: string;
  boardImage?: string;
  pieceStyle: 'classic' | 'modern' | 'neon';
  description: string;
}

export const THEMES_DATA: THEME_DATA[] = [
  {
    id: 'classic-wood',
    name: 'Classic Walnut',
    lightSquare: 'bg-[#f0d9b5] text-[#b58863]',
    darkSquare: 'bg-[#b58863] text-[#f0d9b5]',
    boardBg: 'border-amber-800 bg-amber-950/20',
    accentColor: '#fbbf24',
    pieceStyle: 'classic',
    description: 'Traditional wood grains and tournament colours.',
    boardImage: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=650&h=650',
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Cyber',
    lightSquare: 'bg-slate-800 text-[#00f2fe]',
    darkSquare: 'bg-slate-900 border border-slate-800 text-slate-500',
    boardBg: 'border-cyan-500 bg-cyan-950/20',
    accentColor: '#38bdf8',
    pieceStyle: 'neon',
    description: 'Glow-in-the-dark digital grids for night owls.',
    boardImage: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?auto=format&fit=crop&q=80&w=650&h=650',
  },
  {
    id: 'emerald-sleek',
    name: 'Emerald Tournament',
    lightSquare: 'bg-[#ececd7] text-[#739552]',
    darkSquare: 'bg-[#739552] text-[#ececd7]',
    boardBg: 'border-emerald-800 bg-emerald-950/20',
    accentColor: '#10b981',
    pieceStyle: 'classic',
    description: 'The standard layout for high-intensity online play.',
    boardImage: 'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=650&h=650',
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    lightSquare: 'bg-slate-200 text-slate-500',
    darkSquare: 'bg-sky-900/80 text-sky-200',
    boardBg: 'border-sky-700 bg-sky-950/20',
    accentColor: '#60a5fa',
    pieceStyle: 'modern',
    description: 'Clean, elegant arctic aesthetic for analytical clarity.',
    boardImage: 'https://images.unsplash.com/photo-1544085311-11a028465b03?auto=format&fit=crop&q=80&w=650&h=650',
  },
  {
    id: 'sweet-bubblegum',
    name: 'Bubblegum Queen',
    lightSquare: 'bg-rose-100 text-pink-400',
    darkSquare: 'bg-pink-400 text-rose-100',
    boardBg: 'border-rose-300 bg-rose-50',
    accentColor: '#ec4899',
    pieceStyle: 'modern',
    description: 'Sweet pastel patterns for lighthearted checkmates.',
    boardImage: 'https://images.unsplash.com/photo-1580541832626-2a7131ee809f?auto=format&fit=crop&q=80&w=650&h=650',
  },
];
