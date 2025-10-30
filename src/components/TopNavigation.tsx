'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/patients' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Schedules', href: '/schedules' },
  { label: 'Insurances', href: '/insurances' },
  { label: 'Complaints', href: '/complaints' },
  { label: 'Licenses', href: '/licenses' },
  { label: 'Medication', href: '/medication' },
  { label: 'HR', href: '/hr' },
  { label: 'Tickets', href: '/tickets' }
];

export default function TopNavigation() {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <nav className="border-t border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-transparent">
      <ul className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-4 text-sm text-slate-600 transition-colors dark:text-slate-300">
        {navigationItems.map((item) => (
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
    </nav>
  );
}
