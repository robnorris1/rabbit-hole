'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeCtx {
  dark: boolean;
  toggleDark: () => void;
}

const Ctx = createContext<ThemeCtx>({ dark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('rh-dark') === 'true';
    setDark(stored);
  }, []);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem('rh-dark', String(next));
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return <Ctx.Provider value={{ dark, toggleDark }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);