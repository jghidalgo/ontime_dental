import Image from 'next/image';
import Link from 'next/link';

const integrationPills = ['Open Dental', 'Dentrix', 'Eaglesoft', 'Curve Dental', 'Custom API'];

const featureCards = [
  {
    title: 'Unify Clinical + Lab Operations',
    description:
      'Coordinate front desk, providers, labs, and support teams in one shared workflow for cases, schedules, documents, and requests.',
  },
  {
    title: 'AI Productivity Insights',
    description:
      'Analyze chair time, provider output, and lab turnaround with AI-powered signals that uncover bottlenecks before they impact care.',
  },
  {
    title: 'Integration-First Architecture',
    description:
      'Connect to Open Dental and other dental practice management systems without replacing your existing operational stack.',
  },
];

const audienceCards = [
  'Dental clinics and multi-location groups',
  'Dental laboratories and production teams',
  'Support organizations and central operations',
  'Growth-minded practices adopting AI workflows',
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b1d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(56,189,248,0.25),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.18),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.26),transparent_45%)]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logoOntime.png"
            alt="Complete Dental Solutions"
            width={136}
            height={42}
            className="h-9 w-auto"
            priority
          />
          <span className="hidden text-sm text-slate-300/80 md:inline">Complete Dental Solutions</span>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
        >
          Login
        </Link>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 pb-16 pt-6 text-center sm:pb-24 sm:pt-10">
        <span className="inline-flex items-center rounded-full border border-cyan-200/30 bg-cyan-200/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
          Calm Operations For Modern Dentistry
        </span>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
          Bring clarity to your clinics, labs, and teams—every single day.
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-200/90">
          Complete Dental Solutions is a serene command center for dental operations. Integrate with your current provider
          systems, including Open Dental, and let AI reveal how to improve productivity, reduce delays, and scale confidently.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-7 py-3 text-sm font-semibold text-cyan-950 transition hover:bg-cyan-200"
          >
            Login to the App
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Explore Platform
          </a>
        </div>

        <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-2xl font-semibold text-white">360°</p>
            <p className="mt-1 text-sm text-slate-200/90">Operational visibility across teams</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-2xl font-semibold text-white">AI</p>
            <p className="mt-1 text-sm text-slate-200/90">Predictive productivity intelligence</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-2xl font-semibold text-white">Secure</p>
            <p className="mt-1 text-sm text-slate-200/90">Role-based access and governance</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-8">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-200/90">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-8 pt-10">
        <div className="rounded-3xl border border-cyan-200/25 bg-gradient-to-br from-cyan-300/15 via-blue-300/10 to-indigo-300/10 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Built for your dental ecosystem</p>
          <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Designed for clinics, labs, DSOs, and operational excellence teams.
          </h3>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {audienceCards.map((audience) => (
              <div key={audience} className="rounded-xl border border-white/10 bg-[#0b1736]/60 px-4 py-3 text-sm text-slate-100">
                {audience}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-10" id="integrations">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Integrations</p>
          <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Keep your systems. Add one intelligent operations layer.
          </h3>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-slate-200/90">
            Plug into Open Dental and other provider management systems, then orchestrate schedules, lab logistics, and AI-driven
            analytics from a single platform.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {integrationPills.map((integration) => (
              <span
                key={integration}
                className="inline-flex items-center rounded-full border border-cyan-100/30 bg-cyan-100/10 px-4 py-2 text-xs font-medium text-cyan-50"
              >
                {integration}
              </span>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Login to Complete Dental Solutions
          </Link>
        </div>
      </section>
    </main>
  );
}
