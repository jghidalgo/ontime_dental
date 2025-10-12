import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import clsx from 'clsx';
import './globals.css';
import AppProviders from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnTime Dental Portal',
  description: 'A modern management platform for dental clinics.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={clsx(inter.className, 'min-h-screen bg-slate-950 text-slate-100')}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
