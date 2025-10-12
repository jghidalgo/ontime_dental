'use client';

import { useLanguage, useTranslations } from '@/lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslations();

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs text-slate-200 shadow-lg shadow-slate-950/50 backdrop-blur">
      <span className="font-semibold text-slate-200">{t('Language')}</span>
      <div className="flex items-center gap-1">
        {(['en', 'es'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className={`rounded-full px-3 py-1 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
              language === option
                ? 'bg-primary-500 text-slate-900 shadow-inner shadow-primary-900/30'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {option === 'en' ? t('English') : t('Spanish')}
          </button>
        ))}
      </div>
    </div>
  );
}
