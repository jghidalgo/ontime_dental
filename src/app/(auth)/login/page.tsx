import { Metadata } from 'next';
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

      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl shadow-primary-900/40 backdrop-blur-lg md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden min-h-full flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-10 py-12 text-slate-100 md:flex">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-500/15 px-3 py-1 text-sm font-semibold text-primary-200">
              Secure Access
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Manage your clinic with confidence
            </h1>
            <p className="mt-4 text-base text-slate-300">
              Centralize patient care, streamline scheduling, and keep your team aligned with a platform built for modern dental clinics.
            </p>
          </div>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-200">1</span>
              <p>Bank-grade security with encrypted authentication tokens.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-200">2</span>
              <p>Role-based permissions to safeguard sensitive patient data.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-200">3</span>
              <p>Audit-ready logs for compliance and operational insight.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-slate-900/50 px-8 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-md space-y-10">
            <div className="space-y-3 text-center md:text-left">
              <h2 className="text-3xl font-semibold text-slate-50">Sign in to OnTime Dental</h2>
              <p className="text-sm text-slate-400">
                Enter your credentials to continue. Need an account? Contact your administrator.
              </p>
            </div>

            <LoginForm />

            <p className="text-center text-xs text-slate-500 md:text-left">
              By continuing you agree to our{' '}
              <a href="#" className="font-medium text-primary-300 hover:text-primary-200">
                terms
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-primary-300 hover:text-primary-200">
                privacy policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
