'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/patients' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Schedules', href: '/schedules' },
  { label: 'Insurances', href: '/insurances' },
  { label: 'Complaints', href: '/complaints' },
  { label: 'Licenses', href: '/licenses' },
  { label: 'Medication', href: '/medication' },
  { label: 'HR', href: '/hr' },
  { label: 'Tickets', href: '/tickets' }
];

const insurers = [
  {
    id: 'solis',
    name: 'SOLIS',
    summary:
      'SOLIS partners with OnTime Dental to provide flexible coverage for preventive and specialty dentistry for Puerto Rico-based clinics.',
    contact: {
      phone: '(787) 555-1200',
      fax: '(787) 555-1299',
      email: 'support@solisdental.com',
      website: 'https://solisdental.com'
    },
    accountManager: {
      name: 'Luisa Fernández',
      phone: '(787) 555-2211',
      email: 'lfernandez@solisdental.com'
    },
    plans: [
      {
        id: '893',
        name: 'SOLIS ELITE PLUS 5000',
        year: '2025',
        url: '#'
      },
      {
        id: '894',
        name: 'SOLIS SELF-INSURED PLANS 3500',
        year: '2024',
        url: '#'
      },
      {
        id: '896',
        name: 'SOLIS SELECT FAMILY ANNUAL',
        year: '2023',
        url: '#'
      }
    ],
    updates: [
      {
        title: 'Digital claims pilot',
        description: 'Submit pre-authorizations electronically starting October 1st.',
        badge: 'Operations'
      },
      {
        title: 'Fee schedule refresh',
        description: 'Updated reimbursement codes for orthodontics effective January 2025.',
        badge: 'Finance'
      }
    ]
  },
  {
    id: 'mediatech',
    name: 'Mediatech',
    summary:
      'Mediatech offers nationwide employer plans with high utilization of orthodontics and restorative dentistry.',
    contact: {
      phone: '(305) 555-0045',
      fax: '(305) 555-0099',
      email: 'providerrelations@mediatechhealth.com',
      website: 'https://mediatechhealth.com'
    },
    accountManager: {
      name: 'Andrew Collins',
      phone: '(305) 555-0102',
      email: 'acollins@mediatechhealth.com'
    },
    plans: [
      {
        id: '741',
        name: 'Mediatech Premium 2000',
        year: '2025',
        url: '#'
      },
      {
        id: '742',
        name: 'Mediatech Hybrid PPO',
        year: '2024',
        url: '#'
      }
    ],
    updates: [
      {
        title: 'Quarterly utilization report',
        description: 'Shared usage trends for adult orthodontics and whitening add-ons.',
        badge: 'Analytics'
      }
    ]
  },
  {
    id: 'medicare',
    name: 'Medicare',
    summary:
      'Federal coverage program with supplemental dental riders for senior patients.',
    contact: {
      phone: '(800) 633-4227',
      fax: '(877) 486-2048',
      email: 'medicare@cms.gov',
      website: 'https://www.medicare.gov'
    },
    accountManager: {
      name: 'Provider Services',
      phone: '(800) 633-4227',
      email: 'provider.services@cms.gov'
    },
    plans: [
      {
        id: '512',
        name: 'Medicare Advantage Dental Rider',
        year: '2025',
        url: '#'
      },
      {
        id: '513',
        name: 'Medicare Preventive Only',
        year: '2023',
        url: '#'
      }
    ],
    updates: [
      {
        title: 'CY 2025 coverage notice',
        description: 'Review the annual notice of changes for preventive coverage allowances.',
        badge: 'Compliance'
      }
    ]
  }
];

export default function InsurancesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>(insurers[0]?.id ?? '');

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  const selectedInsurer = useMemo(
    () => insurers.find((insurer) => insurer.id === selectedInsurerId) ?? insurers[0],
    [selectedInsurerId]
  );

  const handleLogout = () => {
    window.localStorage.removeItem('ontime.authToken');
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[120rem]">
        <aside className="hidden w-72 flex-col border-r border-white/5 bg-white/[0.02] px-6 py-10 backdrop-blur-2xl lg:flex">
          <div>
            <div className="flex items-center gap-3 text-slate-100">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500/15 text-sm font-semibold uppercase tracking-[0.35em] text-primary-100 ring-1 ring-primary-400/30">
                OD
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary-200/70">OnTime</p>
                <p className="text-base font-semibold text-slate-50">Dental OS</p>
              </div>
            </div>

            <nav className="mt-12 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary-500/20 text-primary-100 ring-1 ring-primary-400/40'
                        : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/30">Go</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-xs text-slate-400">
            <p className="text-sm font-semibold text-slate-100">Need help?</p>
            <p>Access our onboarding kit for carrier credentialing, claims status, and escalation contacts.</p>
            <button className="w-full rounded-xl border border-primary-400/30 bg-primary-500/10 px-3 py-2 text-xs font-semibold text-primary-100 transition hover:bg-primary-500/20">
              View guide
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex flex-col gap-8 border-b border-white/5 bg-white/[0.02] px-6 pb-10 pt-10 backdrop-blur-2xl lg:px-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">Insurance hub</p>
                <h1 className="text-3xl font-semibold text-slate-50">Manage payer documents</h1>
                <p className="max-w-xl text-sm text-slate-400">
                  Review carrier-specific documentation, credentialing requirements, and plan summaries. Switch between contracted insurers using the selector below.
                </p>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Signed in as <span className="font-semibold text-slate-100">{userName || 'team'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-2xl bg-primary-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="relative mx-auto max-w-6xl px-6 py-12 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <section className="space-y-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Active insurer</p>
                        <h2 className="mt-2 text-3xl font-semibold text-slate-50">{selectedInsurer?.name}</h2>
                        <p className="mt-4 text-sm text-slate-400">{selectedInsurer?.summary}</p>
                      </div>

                      <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <p className="text-xs uppercase tracking-widest text-white/40">Phone</p>
                          <p className="mt-1 font-semibold text-slate-100">{selectedInsurer?.contact.phone}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <p className="text-xs uppercase tracking-widest text-white/40">Fax</p>
                          <p className="mt-1 font-semibold text-slate-100">{selectedInsurer?.contact.fax}</p>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <p className="text-xs uppercase tracking-widest text-white/40">Email</p>
                          <a
                            href={`mailto:${selectedInsurer?.contact.email}`}
                            className="mt-1 block font-semibold text-primary-100 hover:text-primary-200"
                          >
                            {selectedInsurer?.contact.email}
                          </a>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                          <p className="text-xs uppercase tracking-widest text-white/40">Website</p>
                          <a
                            href={selectedInsurer?.contact.website}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block font-semibold text-primary-100 hover:text-primary-200"
                          >
                            {selectedInsurer?.contact.website.replace('https://', '')}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="w-full max-w-xs">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                        Select insurer
                      </label>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 shadow-inner shadow-slate-950/40">
                        <select
                          value={selectedInsurerId}
                          onChange={(event) => setSelectedInsurerId(event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-200 outline-none transition focus:border-primary-400/60 focus:text-white"
                        >
                          {insurers.map((insurer) => (
                            <option key={insurer.id} value={insurer.id}>
                              {insurer.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-6 space-y-2 rounded-2xl border border-primary-400/20 bg-primary-500/10 p-4 text-sm text-primary-100">
                        <p className="text-xs uppercase tracking-[0.35em] text-primary-200/80">Account manager</p>
                        <p className="text-base font-semibold text-slate-50">{selectedInsurer?.accountManager.name}</p>
                        <p className="text-slate-100">{selectedInsurer?.accountManager.phone}</p>
                        <a
                          href={`mailto:${selectedInsurer?.accountManager.email}`}
                          className="block text-sm font-medium text-primary-100 underline-offset-4 hover:underline"
                        >
                          {selectedInsurer?.accountManager.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Plans</p>
                      <h3 className="mt-2 text-2xl font-semibold text-slate-50">Plan documentation</h3>
                      <p className="mt-1 text-sm text-slate-400">Download benefit summaries, credentialing packets, and fee schedules by plan.</p>
                    </div>
                    <button className="self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                      Export list
                    </button>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
                    <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-200">
                      <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
                        <tr>
                          <th className="px-4 py-3 font-medium">ID</th>
                          <th className="px-4 py-3 font-medium">Plan</th>
                          <th className="px-4 py-3 font-medium">Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedInsurer?.plans.map((plan) => (
                          <tr key={plan.id} className="transition hover:bg-primary-500/10">
                            <td className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/60">{plan.id}</td>
                            <td className="px-4 py-3">
                              <a
                                href={plan.url}
                                className="font-semibold text-primary-100 hover:text-primary-200"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {plan.name}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-300">{plan.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/10 via-slate-900/70 to-slate-950 p-8 shadow-2xl shadow-primary-900/40 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Reminders</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-50">Latest from {selectedInsurer?.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">Keep your team aligned with carrier notices and operational updates.</p>
                  <div className="mt-6 space-y-5">
                    {selectedInsurer?.updates.map((update) => (
                      <div key={update.title} className="space-y-2 rounded-2xl border border-primary-500/15 bg-white/[0.02] p-4">
                        <span className="inline-flex items-center rounded-full bg-primary-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-200">
                          {update.badge}
                        </span>
                        <p className="text-sm font-semibold text-slate-100">{update.title}</p>
                        <p className="text-xs text-slate-400">{update.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl text-sm text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Credentialing checklist</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Verify license expiration dates</p>
                        <p className="text-xs text-slate-400">Upload renewed documents at least 30 days before carrier review cycles.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Confirm tax ID and W-9</p>
                        <p className="text-xs text-slate-400">Ensure the latest W-9 is attached to avoid claim delays.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-400" />
                      <div>
                        <p className="font-semibold text-slate-100">Track re-credentialing cycles</p>
                        <p className="text-xs text-slate-400">Set reminders for {selectedInsurer?.name} at least 60 days in advance.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
