'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage, useTranslations } from '@/lib/i18n';

export default function Header() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();
  const [isDark, setIsDark] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check theme on mount and set up observer
    const root = document.documentElement;
    const checkTheme = () => {
      setIsDark(root.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    // Get user name from token or local storage
    const name = globalThis.localStorage.getItem('ontime.userName') || 'User';
    setUserName(name);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      observer.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      globalThis.localStorage.setItem('theme', 'light');
    } else {
      root.classList.add('dark');
      setIsDark(true);
      globalThis.localStorage.setItem('theme', 'dark');
    }
  };

  const handleLogout = () => {
    globalThis.localStorage.removeItem('ontime.authToken');
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-end gap-2 border-b border-slate-800/60 bg-slate-900/40 px-6 py-3">
      {/* Language Selector */}
      <div className="flex items-center gap-1 rounded-lg border border-slate-700/50 bg-slate-800/30 px-2 py-1.5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-4 w-4 text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
          />
        </svg>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
          className="cursor-pointer border-0 bg-transparent pr-6 text-xs font-medium text-slate-300 focus:outline-none focus:ring-0"
        >
          <option value="en">EN</option>
          <option value="es">ES</option>
        </select>
      </div>

      {/* Dark/Light Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50"
        title={isDark ? t('Switch to Light Mode') : t('Switch to Dark Mode')}
      >
        {isDark ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
            <span className="hidden sm:inline">{t('Light')}</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              />
            </svg>
            <span className="hidden sm:inline">{t('Dark')}</span>
          </>
        )}
      </button>

      {/* Profile Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800/50"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <span className="hidden sm:inline">{userName}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-3 w-3 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
              <div className="border-b border-slate-700 px-4 py-3">
                <p className="text-xs text-slate-400">{t('Signed in as')}</p>
                <p className="text-sm font-medium text-slate-200">{userName}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add profile navigation here
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  {t('Profile')}
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Add settings navigation here
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700/50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {t('Settings')}
                </button>
              </div>
              <div className="border-t border-slate-700 py-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                  {t('Logout')}
                </button>
              </div>
            </div>
        )}
      </div>
    </header>
  );
}
