'use client';

import { LanguageProvider } from '@/lib/i18n';
import { LanguageToggle } from '@/components/language-toggle';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <LanguageToggle />
      {children}
    </LanguageProvider>
  );
}
