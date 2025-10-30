'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';

type NavigationProps = {
  className?: string;
};

const primaryNavigation = [
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

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <nav className={clsx('flex flex-col gap-1 text-sm text-slate-300', className)}>
      {primaryNavigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center justify-between rounded-2xl border px-4 py-3 transition',
              isActive
                ? 'border-primary-400/40 bg-primary-500/20 text-primary-100 shadow-lg shadow-primary-900/30'
                : 'border-white/5 bg-white/[0.02] hover:border-primary-400/30 hover:text-white'
            )}
          >
            <span className="font-medium">{t(item.label)}</span>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('Go')}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation({ className }: NavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <div className={clsx('flex gap-2', className)}>
      {primaryNavigation.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'whitespace-nowrap rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
              isActive
                ? 'border-primary-400/40 bg-primary-500/20 text-primary-100'
                : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-primary-400/30 hover:text-white'
            )}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </div>
  );
}
