'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useTranslations();

  const handleLogout = () => {
    globalThis.localStorage.removeItem('ontime.authToken');
    globalThis.localStorage.removeItem('ontime.userPermissions');
    router.push('/login');
  };

  return (
    <div className="flex justify-end border-b border-slate-800/60 bg-slate-900/40 px-6 py-3">
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 ring-1 ring-red-500/30 transition hover:bg-red-500/20 dark:text-red-400 dark:ring-red-500/40 dark:hover:bg-red-500/30"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
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
  );
}
