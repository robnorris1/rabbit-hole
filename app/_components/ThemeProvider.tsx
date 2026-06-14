'use client';

import { createContext, useContext, useState } from 'react';

interface ThemeCtx {
  dark: boolean;
  toggleDark: () => void;
}

const Ctx = createContext<ThemeCtx>({ dark: false, toggleDark: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('rh-dark') === 'true';
  });

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