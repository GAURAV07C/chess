import { createContext, useEffect, useState } from 'react';
import { THEMES_DATA, THEME_DATA } from '@/constants/themes';

export type THEME = 'Classic Walnut' | 'Midnight Cyber' | 'Emerald Tournament' | 'Nordic Frost' | 'Bubblegum Queen';

export type THEME_CONTEXT = {
  theme: THEME;
  updateTheme: (theme: THEME) => void;
  // AI landing page compatibility: currentTheme object + setTheme by id/name
  currentTheme: THEME_DATA;
  setTheme: (idOrName: string) => void;
};

const AVAILABLE_THEMES: THEME[] = [
  'Classic Walnut',
  'Midnight Cyber',
  'Emerald Tournament',
  'Nordic Frost',
  'Bubblegum Queen',
];

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<THEME_CONTEXT | null>(null);

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<THEME>('Classic Walnut');

  const currentTheme: THEME_DATA = THEMES_DATA.find((t) => t.name === theme) || THEMES_DATA[0];

  function updateTheme(newTheme: THEME) {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.querySelector('html')?.setAttribute('data-theme', newTheme);
  }

  // setTheme accepts id or name (for AI landing page components)
  function setTheme(idOrName: string) {
    const matched = THEMES_DATA.find((t) => t.id === idOrName || t.name === idOrName);
    if (matched) {
      updateTheme(matched.name as THEME);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('theme') as THEME | null;
    if (saved && AVAILABLE_THEMES.includes(saved)) {
      setThemeState(saved);
      document.querySelector('html')?.setAttribute('data-theme', saved);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, currentTheme, setTheme }}>{children}</ThemeContext.Provider>
  );
}
