'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';

const hrNavigationItems = [
  { label: 'Overview', href: '/hr' },
  { label: 'Employees', href: '/hr/employees' }
];

export default function HrSubNavigation() {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-300">
      {hrNavigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-2xl border px-4 py-2 transition ${
              isActive
                ? 'border-primary-400/40 bg-primary-500/20 text-primary-100 shadow-lg shadow-primary-900/20'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-primary-400/30 hover:text-white'
            }`}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
