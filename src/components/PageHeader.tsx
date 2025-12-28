'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import Image from 'next/image';
import { useLanguage, useTranslations } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { GET_COMPANIES } from '@/graphql/company-queries';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '@/graphql/notification-queries';
import { MARK_NOTIFICATION_READ } from '@/graphql/notification-mutations';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';

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
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRoleLabel, setUserRoleLabel] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Check if user is admin
  const [hasSettingsAccess, setHasSettingsAccess] = useState(false); // Check if user can access settings
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [hasAuthToken, setHasAuthToken] = useState(false);

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

  // Check user role and company on mount
  useEffect(() => {
    const user = getUserSession();
    if (!user) return;

    // Admin and manager can switch companies
    setIsAdmin(user.role === 'admin' || user.role === 'manager');

    const roleLabel = (() => {
      if (user.role === 'admin') return 'Admin';
      if (user.role === 'manager') return 'Manager';
      if (!user.role) return '';
      return user.role
        .split('_')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join(' ');
    })();
    setUserRoleLabel(roleLabel);

    // Check if user has access to settings module
    setHasSettingsAccess(hasModuleAccess(user, 'settings'));

    // For non-admin users, auto-select their company
    if (user.role !== 'admin' && user.role !== 'manager' && user.companyId && showEntitySelector && onEntityChange) {
      onEntityChange(user.companyId);
    }
  }, [showEntitySelector, onEntityChange]);

  // Detect auth token changes after login/logout navigation.
  useEffect(() => {
    const token = localStorage.getItem('ontime.authToken');
    setHasAuthToken(Boolean(token));
  }, [pathname]);

  useEffect(() => {
    if (!hasAuthToken) return;
    const session = getUserSession();
    if (session) {
      console.log('[notifications] session', { email: session.email, role: session.role, userId: session.userId });
    } else {
      console.log('[notifications] token present but no session');
    }
  }, [hasAuthToken]);

  const {
    data: unreadCountData,
    refetch: refetchUnreadCount,
    error: unreadCountError
  } = useQuery(GET_UNREAD_NOTIFICATION_COUNT, {
    skip: !hasAuthToken,
    pollInterval: 30000,
    fetchPolicy: 'cache-and-network'
  });

  const {
    data: notificationsData,
    refetch: refetchNotifications,
    error: notificationsError
  } = useQuery(GET_NOTIFICATIONS, {
    variables: { unreadOnly: false, limit: 8, offset: 0 },
    skip: !hasAuthToken || !isNotificationsOpen,
    fetchPolicy: 'network-only'
  });

  useEffect(() => {
    if (unreadCountError) console.error('unreadNotificationCount error', unreadCountError);
  }, [unreadCountError]);

  useEffect(() => {
    if (notificationsError) console.error('notifications query error', notificationsError);
  }, [notificationsError]);

  const [markNotificationRead] = useMutation(MARK_NOTIFICATION_READ);

  const unreadCount = unreadCountData?.unreadNotificationCount ?? 0;
  const notifications = notificationsData?.notifications ?? [];

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString();
  };

  useEffect(() => {
    if (!hasAuthToken || !isNotificationsOpen) return;
    void refetchUnreadCount();
    void refetchNotifications();
  }, [hasAuthToken, isNotificationsOpen, refetchNotifications, refetchUnreadCount]);
  // Auto-select first company if none selected (only for admins)
  useEffect(() => {
    if (!isAdmin || !showEntitySelector || entityOptions.length === 0 || selectedEntityId || !onEntityChange) {
      return;
    }

    const savedEntityId = localStorage.getItem('ontime.selectedCompanyId');
    if (savedEntityId && entityOptions.some((opt) => opt.id === savedEntityId)) {
      onEntityChange(savedEntityId);
      return;
    }

    onEntityChange(entityOptions[0].id);
  }, [entityOptions, selectedEntityId, showEntitySelector, onEntityChange, isAdmin]);

  // Keep the last selected company persisted for admin/manager switching.
  useEffect(() => {
    if (!showEntitySelector || !selectedEntityId) return;
    localStorage.setItem('ontime.selectedCompanyId', selectedEntityId);
  }, [selectedEntityId, showEntitySelector]);

  // Load user name + role for profile menu
  useEffect(() => {
    const user = getUserSession();
    if (user?.name) {
      setUserName(user.name);
      return;
    }

    const name = localStorage.getItem('ontime.userName') || 'User';
    setUserName(name);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isProfileOpen || isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen, isNotificationsOpen]);

  const toggleTheme = () => toggleMode();

  const handleLogout = () => {
    localStorage.removeItem('ontime.authToken');
    localStorage.removeItem('ontime.userName');
    localStorage.removeItem('ontime.userPermissions');
    setHasAuthToken(false);
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
              <div className={`flex items-center gap-2 rounded-lg border ${isAdmin ? 'border-slate-700 bg-slate-900/80 hover:border-primary-400/40' : 'border-slate-800 bg-slate-900/40'} px-3 py-2 transition`}>
                <svg className={`h-4 w-4 ${isAdmin ? 'text-slate-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <select
                  id="entity-select"
                  value={selectedEntityId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    localStorage.setItem('ontime.selectedCompanyId', nextId);
                    onEntityChange?.(nextId);
                  }}
                  disabled={!isAdmin}
                  className={`border-none bg-transparent text-sm font-medium outline-none pr-2 ${
                    isAdmin 
                      ? 'cursor-pointer text-slate-200' 
                      : 'cursor-not-allowed text-slate-500'
                  }`}
                  title={isAdmin ? undefined : t('Only administrators can change the company')}
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

          {/* Notifications */}
          {hasAuthToken && (
            <div className="relative z-50" ref={notificationsRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsNotificationsOpen((prev) => !prev);
                }}
                className="relative rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-slate-400 transition hover:border-primary-400/40 hover:text-primary-300"
                aria-label="Notifications"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-300 px-1 text-xs font-semibold text-slate-950">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-700 bg-slate-900 py-2 shadow-xl z-50">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-200">Notifications</p>
                    {unreadCount > 0 && (
                      <p className="text-xs text-slate-400">{unreadCount} unread</p>
                    )}
                  </div>

                  <div className="max-h-96 overflow-auto">
                    {(() => {
                      if (notificationsError || unreadCountError) {
                        return (
                          <div className="px-4 py-6 text-sm text-slate-400">
                            Unable to load notifications. Check console for details.
                          </div>
                        );
                      }

                      if (notifications.length === 0) {
                        return <div className="px-4 py-6 text-sm text-slate-400">No notifications</div>;
                      }

                      return notifications.map((notification: any) => (
                        <button
                          key={notification.id}
                          onClick={async () => {
                            if (notification.readAt) return;
                            await markNotificationRead({ variables: { id: notification.id } });
                            await refetchUnreadCount();
                            await refetchNotifications();
                          }}
                          className="w-full px-4 py-3 text-left transition hover:bg-slate-800"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm ${
                                  notification.readAt ? 'text-slate-300' : 'font-semibold text-slate-100'
                                }`}
                              >
                                {notification.title}
                              </p>
                              {notification.message && (
                                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{notification.message}</p>
                              )}
                              {notification.createdAt && (
                                <p className="mt-1 text-[11px] text-slate-500">{formatTimestamp(notification.createdAt)}</p>
                              )}
                            </div>
                            {!notification.readAt && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-300" />}
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

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
                  <p className="text-xs text-slate-400">{t(userRoleLabel || 'User')}</p>
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
                {hasSettingsAccess && (
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
                )}
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
