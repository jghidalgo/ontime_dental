'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { GET_COMPANIES } from '@/graphql/company-queries';

type EntityOption = {
  id: string;
  name: string;
};

type PageHeaderProps = {
  category: string;
  title: string;
  subtitle?: string;
  statLabel?: string;
  statValue?: string | number;
  statSubtext?: string;
  // Entity selector props
  showEntitySelector?: boolean;
  entityLabel?: string;
  selectedEntityId?: string;
  entities?: EntityOption[];
  onEntityChange?: (entityId: string) => void;
};

export default function PageHeader({
  category,
  title,
  subtitle,
  statLabel,
  statValue,
  statSubtext,
  showEntitySelector = false,
  entityLabel = 'Select entity',
  selectedEntityId = '',
  entities = [],
  onEntityChange,
}: Readonly<PageHeaderProps>) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch companies from database if showEntitySelector is true and entities not provided
  const { data: companiesData } = useQuery(GET_COMPANIES, {
    skip: !showEntitySelector || (entities && entities.length > 0),
  });

  // Use provided entities or fetched companies
  const entityOptions: EntityOption[] = (entities && entities.length > 0)
    ? entities
    : (companiesData?.companies || [])
        .filter((company: any) => company.isActive)
        .map((company: any) => ({
          id: company.id,
          name: company.shortName,
        }));

  // Auto-select first company if none selected
  useEffect(() => {
    if (showEntitySelector && entityOptions.length > 0 && !selectedEntityId && onEntityChange) {
      onEntityChange(entityOptions[0].id);
    }
  }, [entityOptions, selectedEntityId, showEntitySelector, onEntityChange]);

  // Load user name
  useEffect(() => {
    const name = localStorage.getItem('ontime.userName') || 'Admin';
    setUserName(name);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const toggleTheme = () => toggleMode();

  const handleLogout = () => {
    localStorage.removeItem('ontime.authToken');
    localStorage.removeItem('ontime.userName');
    localStorage.removeItem('ontime.userPermissions');
    router.push('/login');
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      {/* Logo and Header Section */}
      <div className="flex items-center gap-8">
        {/* OnTime Logo */}
        <div className="flex-shrink-0">
          <Image
            src="/logoOntime.png"
            alt="OnTime Dental"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>

        {/* Header Text */}
        <header>
          <p className="text-sm uppercase tracking-widest text-primary-300">{category}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-300">{subtitle}</p>}
        </header>
      </div>

      <div className="flex items-center gap-4">
        {/* Stats card (optional) */}
        {statLabel && statValue !== undefined && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">{statLabel}</p>
            <p className="text-3xl font-semibold text-primary-300">{statValue}</p>
            {statSubtext && <p className="text-xs text-slate-500">{statSubtext}</p>}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Entity/Company Selector (optional) */}
          {showEntitySelector && entityOptions.length > 0 && (
            <div className="relative">
              <label htmlFor="entity-select" className="sr-only">
                {entityLabel}
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 transition hover:border-primary-400/40">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <select
                  id="entity-select"
                  value={selectedEntityId}
                  onChange={(e) => onEntityChange?.(e.target.value)}
                  className="cursor-pointer border-none bg-transparent text-sm font-medium text-slate-200 outline-none pr-2"
                >
                  {entityOptions.map((entity) => (
                    <option key={entity.id} value={entity.id} className="bg-slate-900 text-slate-200">
                      {entity.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative">
            <label htmlFor="language-select" className="sr-only">
              Language
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 transition hover:border-primary-400/40">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                className="cursor-pointer border-none bg-transparent text-sm font-medium text-slate-200 outline-none"
              >
                <option value="en" className="bg-slate-900 text-slate-200">EN</option>
                <option value="es" className="bg-slate-900 text-slate-200">ES</option>
              </select>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-400 transition hover:border-primary-400/40 hover:text-primary-300"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-200 transition hover:border-primary-400/40 hover:text-primary-300"
              aria-label="User menu"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-xs font-semibold text-primary-300">
                {userName.charAt(0).toUpperCase()}
              </div>
              <svg className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-700 bg-slate-900 py-2 shadow-xl z-50">
                <div className="border-b border-slate-700 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-200">{userName}</p>
                  <p className="text-xs text-slate-400">Administrator</p>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/profile');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    router.push('/settings');
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <div className="border-t border-slate-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-400 transition hover:bg-slate-800"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
