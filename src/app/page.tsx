import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-center">
      <div className="max-w-xl space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-10 shadow-2xl shadow-primary-900/40 backdrop-blur">
        <span className="inline-flex items-center rounded-full bg-primary-500/10 px-3 py-1 text-sm font-semibold text-primary-200">
          OnTime Dental Platform
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
          Welcome to your clinic&apos;s control center
        </h1>
        <p className="text-lg text-slate-300">
          Manage appointments, patient records, and staff scheduling with a secure, cloud-native experience.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:-translate-y-0.5 hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
        >
          Go to login
        </Link>
      </div>
    </main>
  );
}
