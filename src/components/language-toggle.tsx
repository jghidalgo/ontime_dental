'use client';

import { useLanguage, useTranslations } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-[0_10px_30px_rgba(30,64,175,0.1)] backdrop-blur transition-colors dark:border-white/10 dark:bg-slate-950/80 dark:text-slate-200 dark:shadow-lg dark:shadow-slate-950/50">
      <span className="font-semibold text-slate-700 transition-colors dark:text-slate-200">{t('Language')}</span>
      <div className="flex items-center gap-1">
        {(['en', 'es'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className={`rounded-full px-3 py-1 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
              language === option
                ? 'bg-primary-500 text-white shadow-inner shadow-primary-900/30 dark:text-slate-900'
                : 'text-slate-500 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            {option === 'en' ? t('English') : t('Spanish')}
          </button>
        ))}
      </div>
    </div>
  );
}
