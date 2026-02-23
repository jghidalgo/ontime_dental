import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/15 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/10 blur-3xl" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logoOntime.png"
            alt="Complete Dental Solutions"
            width={132}
            height={40}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden text-sm text-slate-400 sm:inline">Complete Dental Solutions</span>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
        >
          Login to App
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-14 pt-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:pt-16">
        <div className="space-y-7">
          <span className="inline-flex items-center rounded-full border border-primary-400/40 bg-primary-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-200">
            Dental Operations Platform
          </span>

          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            Modern operations for clinics, labs, and multi-location dental groups
          </h1>

          <p className="max-w-2xl text-lg text-slate-300">
            Complete Dental Solutions helps teams centralize scheduling, laboratory workflows, documents, and service tickets while connecting with provider management systems like Open Dental.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
            >
              Access Portal
            </Link>
            <a
              href="#capabilities"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
            >
              Explore Capabilities
            </a>
          </div>

          <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <p className="text-2xl font-semibold text-white">360°</p>
              <p>Unified operational visibility</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <p className="text-2xl font-semibold text-white">AI</p>
              <p>Productivity insights and trend analysis</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
              <p className="text-2xl font-semibold text-white">API</p>
              <p>Integration-ready architecture</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-primary-900/20 backdrop-blur">
          <p className="mb-4 text-sm font-medium text-primary-200">What your team gets</p>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">Clinic and laboratory coordination in one workspace</li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">Real-time task tracking for scheduling, cases, and tickets</li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">Operational dashboards with AI-assisted productivity signals</li>
            <li className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">Secure role-based access for administrative and clinical teams</li>
          </ul>
        </div>
      </section>

      <section id="capabilities" className="mx-auto w-full max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Provider Integrations</h2>
            <p className="mt-3 text-sm text-slate-300">
              Connect with dental management systems including Open Dental and other provider ecosystems through flexible integration pathways.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Multi-Entity Operations</h2>
            <p className="mt-3 text-sm text-slate-300">
              Coordinate clinics, labs, and support teams with standardized workflows for schedules, documents, and case lifecycle tracking.
            </p>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">AI Productivity Layer</h2>
            <p className="mt-3 text-sm text-slate-300">
              Surface operational bottlenecks, identify throughput opportunities, and support better staffing and planning decisions.
            </p>
          </article>
        </div>

        <div className="mt-10 rounded-3xl border border-primary-400/30 bg-primary-500/10 p-8 text-center">
          <h3 className="text-2xl font-semibold text-white">Ready to access your operations command center?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
            Sign in to manage your dental ecosystem from one secure platform built for modern clinic and laboratory teams.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-primary-400"
          >
            Login to OnTime Dental
          </Link>
        </div>
      </section>
    </main>
  );
}
