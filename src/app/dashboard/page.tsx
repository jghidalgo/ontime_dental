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

const metrics = [
  {
    label: 'Active Patients',
    value: '1,248',
    delta: '+5.2% vs last month',
    trend: 'positive'
  },
  {
    label: 'Scheduled Appointments',
    value: '86',
    delta: '12 today',
    trend: 'neutral'
  },
  {
    label: 'Treatment Acceptance',
    value: '78%',
    delta: '+2.1% this week',
    trend: 'positive'
  },
  {
    label: 'Outstanding Balances',
    value: '$12.4K',
    delta: '-$3.1K since Monday',
    trend: 'negative'
  }
];

const upcomingAppointments = [
  {
    time: '09:30 AM',
    patient: 'Amelia Rivers',
    treatment: 'Invisalign Checkup',
    practitioner: 'Dr. Carter'
  },
  {
    time: '10:15 AM',
    patient: 'Jonah Mills',
    treatment: 'Implant Consultation',
    practitioner: 'Dr. Patel'
  },
  {
    time: '01:00 PM',
    patient: 'Sophie Becker',
    treatment: 'Hygiene Maintenance',
    practitioner: 'Alexis Stone, RDH'
  },
  {
    time: '03:45 PM',
    patient: 'Micah Lang',
    treatment: 'Whitening Touch-Up',
    practitioner: 'Dr. Carter'
  }
];

const revenueTrend = [
  { month: 'Apr', value: 42 },
  { month: 'May', value: 48 },
  { month: 'Jun', value: 51 },
  { month: 'Jul', value: 57 },
  { month: 'Aug', value: 62 },
  { month: 'Sep', value: 66 }
];

const teamActivity = [
  {
    id: 1,
    title: 'New note added to Amelia Rivers',
    timestamp: '12 minutes ago',
    owner: 'Alexis Stone'
  },
  {
    id: 2,
    title: 'Treatment plan approved: Jonah Mills',
    timestamp: '43 minutes ago',
    owner: 'Dr. Patel'
  },
  {
    id: 3,
    title: 'Invoice sent to Sophie Becker',
    timestamp: '1 hour ago',
    owner: 'Sanjay Mehta'
  }
];

const announcements = [
  {
    title: 'Autumn promotion launching Monday',
    description:
      'Front office team to send reminder emails Friday. Include whitening upgrade for eligible patients.',
    badge: 'Marketing'
  },
  {
    title: 'New OSHA documentation posted',
    description: 'Please review and acknowledge by the end of the week in the compliance portal.',
    badge: 'Compliance'
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  const revenueMax = useMemo(() => Math.max(...revenueTrend.map((item) => item.value)), []);

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

            <nav className="mt-10 space-y-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? 'border-primary-400/60 bg-primary-500/15 text-white shadow-lg shadow-primary-900/30'
                        : 'border-white/5 text-slate-300 hover:border-primary-400/40 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${isActive ? 'text-primary-200' : 'text-slate-500'}`}>
                      {isActive ? '•' : '→'}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary-200/70">Support</p>
            <p className="mt-3 text-base font-semibold text-slate-50">Need a quick overview?</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Download the daily executive summary to share performance highlights with your leadership team.
            </p>
            <button className="mt-4 w-full rounded-2xl border border-primary-400/30 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-50 transition hover:bg-primary-400/30">
              Daily Briefing
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">Dashboard</p>
                  <h1 className="text-2xl font-semibold text-slate-50">Welcome back, {userName || 'team'}.</h1>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition ${
                          isActive
                            ? 'border-primary-400/60 bg-primary-500/20 text-primary-100'
                            : 'border-white/10 text-slate-300 hover:border-primary-400/30 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-auto">
                <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 shadow-inner shadow-primary-900/20 transition hover:border-primary-400/30 hover:text-white">
                  Generate Report
                </button>
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
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition hover:border-primary-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        metric.trend === 'positive'
                          ? 'text-emerald-300'
                          : metric.trend === 'negative'
                          ? 'text-rose-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {metric.delta}
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-50">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Performance</p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-50">Monthly Production</h2>
                    <p className="mt-1 text-sm text-slate-400">Revenue trend across the last six months</p>
                  </div>
                  <div className="rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200">
                    +9.5%
                  </div>
                </div>
                <div className="mt-8 flex items-end gap-4">
                  {revenueTrend.map((point) => (
                    <div key={point.month} className="flex w-full flex-col items-center gap-3">
                      <div
                        className="w-full rounded-2xl bg-gradient-to-t from-primary-500/10 via-primary-400/50 to-primary-300/80 shadow-inner shadow-primary-900/40"
                        style={{ height: `${(point.value / revenueMax) * 160 + 24}px` }}
                      />
                      <p className="text-xs font-medium text-slate-400">{point.month}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Today</p>
                    <h2 className="mt-3 text-xl font-semibold text-slate-50">Upcoming Appointments</h2>
                    <p className="mt-1 text-sm text-slate-400">Confirm readiness and chair availability</p>
                  </div>
                  <button className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                    View schedule
                  </button>
                </div>
                <div className="mt-8 space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={`${appointment.time}-${appointment.patient}`}
                      className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-primary-400/30 hover:bg-white/[0.06]"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-100">{appointment.patient}</p>
                        <p className="text-xs text-slate-400">{appointment.treatment}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p className="font-semibold text-slate-100">{appointment.time}</p>
                        <p>{appointment.practitioner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Team pulse</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-50">Activity Feed</h2>
              <p className="mt-1 text-sm text-slate-400">Real-time updates across your team</p>
              <div className="mt-6 space-y-4">
                {teamActivity.map((activity) => (
                  <div key={activity.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="text-sm font-semibold text-slate-100">{activity.title}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>{activity.owner}</span>
                      <span>{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/10 via-slate-900/70 to-slate-950 p-8 shadow-2xl shadow-primary-900/40 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Announcements</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-50">What&apos;s happening</h2>
              <div className="mt-6 space-y-5">
                {announcements.map((item) => (
                  <div key={item.title} className="space-y-2 rounded-2xl border border-primary-500/15 bg-white/[0.02] p-4">
                    <span className="inline-flex items-center rounded-full bg-primary-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-200">
                      {item.badge}
                    </span>
                    <p className="text-sm font-semibold text-slate-100">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      </div>
    </div>
  </div>
    );
  }
