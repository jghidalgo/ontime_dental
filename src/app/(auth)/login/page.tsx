import { Metadata } from 'next';
import Image from 'next/image';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Login | OnTime Dental',
  description: 'Access the OnTime Dental management platform securely.'
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-primary-900/30 backdrop-blur-lg">
        <div className="border-b border-slate-800/70 bg-slate-950/40 px-8 py-8">
          <div className="space-y-3 text-left">
            <div className="flex items-center justify-end">
              <Image
                src="/logoOntime.png"
                alt="OnTime Dental"
                width={120}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-semibold text-slate-50">Sign in</h1>
            <p className="text-sm text-slate-400">Use your work email and password to continue.</p>
          </div>
        </div>

        <div className="px-8 py-10">
          <LoginForm />

          <p className="mt-8 text-center text-xs text-slate-500">
            Need access? Contact your administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
