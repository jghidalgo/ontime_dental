'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { useApolloClient } from '@apollo/client';
import { GET_TICKETS } from '@/graphql/ticket-queries';
import { GET_DASHBOARD_DATA } from '@/graphql/dashboard-queries';
import { GET_ALL_DIRECTORY_DATA } from '@/graphql/queries';
import { GET_FRONT_DESK_SCHEDULES, GET_DOCTOR_SCHEDULES } from '@/graphql/schedule-queries';
import { GET_DOCUMENT_ENTITIES } from '@/graphql/document-queries';

export const navigationItems = [
  { label: 'Dashboard', href: '/dashboard', prefetch: 'dashboardData' },
  { label: 'Patients', href: '/patients', prefetch: null },
  { label: 'Laboratory', href: '/laboratory', prefetch: null },
  { label: 'Documents', href: '/documents', prefetch: 'documentEntities' },
  { label: 'Contacts', href: '/contacts', prefetch: 'contacts' },
  { label: 'Schedules', href: '/schedules', prefetch: 'schedules' },
  { label: 'Insurances', href: '/insurances', prefetch: null },
  { label: 'Complaints', href: '/complaints', prefetch: null },
  { label: 'Licenses', href: '/licenses', prefetch: null },
  { label: 'Medication', href: '/medication', prefetch: null },
  { label: 'HR', href: '/hr', prefetch: null },
  { label: 'Tickets', href: '/tickets', prefetch: 'tickets' }
];

export function Navigation({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useTranslations();
  const client = useApolloClient();
  const router = useRouter();

  const prefetchData = async (type: string | null) => {
    if (!type) return;

    try {
      switch (type) {
        case 'dashboardData':
          await client.query({
            query: GET_DASHBOARD_DATA,
            fetchPolicy: 'cache-first',
          });
          break;
        case 'tickets':
          await client.query({
            query: GET_TICKETS,
            fetchPolicy: 'cache-first',
          });
          break;
        case 'contacts':
          await client.query({
            query: GET_ALL_DIRECTORY_DATA,
            fetchPolicy: 'cache-first',
          });
          break;
        case 'schedules':
          await Promise.all([
            client.query({
              query: GET_FRONT_DESK_SCHEDULES,
              fetchPolicy: 'cache-first',
            }),
            client.query({
              query: GET_DOCTOR_SCHEDULES,
              fetchPolicy: 'cache-first',
            }),
          ]);
          break;
        case 'documentEntities':
          await client.query({
            query: GET_DOCUMENT_ENTITIES,
            fetchPolicy: 'cache-first',
          });
          break;
      }
    } catch (error) {
      // Silently fail prefetch - data will be fetched normally on navigation
      if (error instanceof Error) {
        console.log('Prefetch skipped:', type, error.message);
      }
    }
  };

  const handleMouseEnter = (item: typeof navigationItems[0]) => {
    // Prefetch route
    router.prefetch(item.href);
    // Prefetch data
    prefetchData(item.prefetch);
  };

  return (
    <nav className={className}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            onMouseEnter={() => handleMouseEnter(item)}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'border-primary-400/60 bg-primary-500/15 text-white shadow-lg shadow-primary-900/30'
                : 'border-white/5 text-slate-300 hover:border-primary-400/40 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            <span>{t(item.label)}</span>
            <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${isActive ? 'text-primary-200' : 'text-slate-500'}`}>
              {isActive ? '•' : '→'}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation({ className = '' }: { className?: string }) {
  const pathname = usePathname();
  const { t } = useTranslations();

  return (
    <div className={className}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${
              isActive
                ? 'border-primary-400/60 bg-primary-500/20 text-primary-100'
                : 'border-white/10 text-slate-300 hover:border-primary-400/30 hover:text-white'
            }`}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </div>
  );
}
