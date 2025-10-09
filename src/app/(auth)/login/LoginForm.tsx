'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type LoginResponse = {
  data?: {
    login: {
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `mutation Login($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                token
                user {
                  id
                  name
                  email
                }
              }
            }`,
            variables: { email, password }
          })
        });

        const payload = (await response.json()) as LoginResponse;

        if (!response.ok || payload.errors) {
          throw new Error(payload.errors?.[0]?.message ?? 'Unable to login');
        }

        const token = payload.data?.login.token;
        if (token) {
          window.localStorage.setItem('ontime.authToken', token);
        }

        setSuccess(`Welcome back, ${payload.data?.login.user.name ?? 'clinician'}!`);
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-200">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
          placeholder="you@clinic.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-200">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/40"
          placeholder="••••••••"
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-primary-500" />
          Remember me
        </label>
        <Link href="#" className="font-medium text-primary-300 hover:text-primary-200">
          Forgot password?
        </Link>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:-translate-y-0.5 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
