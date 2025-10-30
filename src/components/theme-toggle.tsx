'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle() {
  const { mode, toggleMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLight = mode === 'light';

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
        isLight
          ? 'border-slate-200 bg-white/90 text-slate-800 shadow-[0_10px_30px_rgba(30,64,175,0.12)] hover:border-primary-200 hover:text-primary-600'
          : 'border-white/10 bg-slate-950/80 text-slate-200 shadow-lg shadow-slate-950/50 hover:text-white'
      } px-4 py-1.5 text-xs font-semibold backdrop-blur`}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/90 text-base text-white shadow-inner shadow-primary-900/30">
        {mounted ? (isLight ? '☀️' : '🌙') : '🌗'}
      </span>
      <span>{mounted ? (isLight ? 'Light mode' : 'Dark mode') : 'Theme'}</span>
    </button>
  );
}
