'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', moduleId: 'dashboard' },
  { label: 'Patients', href: '/patients', moduleId: 'patients' },
  { label: 'Laboratory', href: '/laboratory', moduleId: 'laboratory' },
  { label: 'Documents', href: '/documents', moduleId: 'documents' },
  { label: 'Contacts', href: '/contacts', moduleId: 'contacts' },
  { label: 'Schedules', href: '/schedules', moduleId: 'schedules' },
  { label: 'Insurances', href: '/insurances', moduleId: 'insurances' },
  { label: 'Complaints', href: '/complaints', moduleId: 'complaints' },
  { label: 'Licenses', href: '/licenses', moduleId: 'licenses' },
  { label: 'Medication', href: '/medication', moduleId: 'medication' },
  { label: 'HR', href: '/hr', moduleId: 'hr' },
  { label: 'Tickets', href: '/tickets', moduleId: 'tickets' },
  { label: 'Settings', href: '/settings', moduleId: 'settings' }
];

export default function TopNavigation() {
  const pathname = usePathname();
  const { t } = useTranslations();
  const [allowedModules, setAllowedModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user permissions from localStorage
    const permissionsStr = globalThis.localStorage?.getItem('ontime.userPermissions');
    
    if (permissionsStr) {
      try {
        const permissions = JSON.parse(permissionsStr);
        setAllowedModules(permissions.modules || []);
      } catch (error) {
        console.error('Error parsing user permissions:', error);
        // Default to showing all modules if there's an error
        setAllowedModules(navigationItems.map(item => item.moduleId));
      }
    } else {
      // Default to showing all modules if no permissions found
      setAllowedModules(navigationItems.map(item => item.moduleId));
    }
    
    setIsLoading(false);
  }, []);

  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => 
    allowedModules.includes(item.moduleId)
  );

  if (isLoading) {
    return null; // or return a loading skeleton
  }

  return (
    <nav className="border-t border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <ul className="flex flex-wrap gap-2 text-sm text-slate-600 transition-colors dark:text-slate-300">
          {filteredNavigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  'block rounded-lg px-4 py-2 font-medium transition',
                  pathname === item.href || pathname?.startsWith(item.href + '/')
                    ? 'bg-primary-500/15 text-primary-700 ring-1 ring-primary-500/40 dark:bg-primary-500/20 dark:text-primary-200'
                    : 'hover:bg-slate-200 hover:text-primary-700 dark:hover:bg-slate-800 dark:hover:text-white'
                )}
              >
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
