'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation, MobileNavigation } from '@/components/navigation';
import TopNavigation from '@/components/TopNavigation';
import HrSubNavigation from '@/components/hr/HrSubNavigation';
import { useTranslations } from '@/lib/i18n';

type DepartmentShare = {
  id: string;
  label: string;
  value: number;
  color: string;
};

type PTOStat = {
  label: string;
  value: string;
  helper: string;
};

type HighlightMetric = {
  id: string;
  label: string;
  value: string;
  change: string;
  tone: 'positive' | 'negative' | 'neutral';
};

type TeamUpdate = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
};

type EmployeeMoment = {
  id: string;
  name: string;
  department: string;
  date: string;
  type: 'anniversary' | 'birthday' | 'new-hire';
};

type CompanyProfile = {
  id: string;
  name: string;
  location: string;
  headcount: number;
  openRoles: number;
  activePTO: number;
  departmentDistribution: DepartmentShare[];
  ptoStats: PTOStat[];
  highlights: HighlightMetric[];
  updates: TeamUpdate[];
  peopleMoments: EmployeeMoment[];
};

const companies: CompanyProfile[] = [
  {
    id: 'complete-dental-solutions',
    name: 'Complete Dental Solutions of Florida',
    location: 'Jacksonville, FL',
    headcount: 128,
    openRoles: 6,
    activePTO: 14,
    departmentDistribution: [
      { id: 'tamami', label: 'TAMAMI', value: 38, color: '#34d399' },
      { id: 'lilite', label: 'LILITE', value: 28, color: '#60a5fa' },
      { id: 'harama', label: 'HARAMA', value: 22, color: '#f97316' },
      { id: 'pinecrest', label: 'PINECREST', value: 18, color: '#a855f7' },
      { id: 'lab', label: 'LAB', value: 12, color: '#f472b6' },
      { id: 'support', label: 'SUPPORT', value: 10, color: '#38bdf8' }
    ],
    ptoStats: [
      { label: 'Pending PTOs', value: '8', helper: 'Awaiting manager review' },
      { label: 'Approved PTOs', value: '108', helper: 'Scheduled across teams' },
      { label: 'Return Today', value: '4', helper: 'Employees coming back from PTO' }
    ],
    highlights: [
      { id: 'headcount', label: 'Total Headcount', value: '128', change: '+3 vs last month', tone: 'positive' },
      { id: 'new-hires', label: 'New Hires (30d)', value: '5', change: 'Onboarding complete', tone: 'neutral' },
      { id: 'engagement', label: 'Engagement Index', value: '82', change: '+4 pts vs Q1', tone: 'positive' },
      { id: 'turnover', label: 'Turnover Risk', value: '6%', change: '-1.5 pts vs avg', tone: 'positive' }
    ],
    updates: [
      {
        id: 'leadership-huddle',
        title: 'Leadership huddle scheduled',
        description: 'Agenda shared for Q4 staffing forecast review.',
        timestamp: '30 minutes ago'
      },
      {
        id: 'benefits-window',
        title: 'Open enrollment reminder',
        description: 'Communications sent to all employees with benefit guides.',
        timestamp: '1 hour ago'
      },
      {
        id: 'training-series',
        title: 'Clinical onboarding series',
        description: 'Four new hygienists assigned mentors for week one.',
        timestamp: 'Yesterday'
      }
    ],
    peopleMoments: [
      { id: 'anniversary-01', name: 'Maria Sanchez', department: 'Front Office', date: 'Today', type: 'anniversary' },
      { id: 'birthday-01', name: 'Jordan Ellis', department: 'Clinical Ops', date: 'Tomorrow', type: 'birthday' },
      { id: 'newhire-01', name: 'Vanessa Lee', department: 'Dental Assistant', date: 'Next Monday', type: 'new-hire' }
    ]
  },
  {
    id: 'blanco-dental-group',
    name: 'Blanco Jamris Dental Group',
    location: 'Orlando, FL',
    headcount: 86,
    openRoles: 4,
    activePTO: 9,
    departmentDistribution: [
      { id: 'tamami', label: 'TAMAMI', value: 24, color: '#34d399' },
      { id: 'lilite', label: 'LILITE', value: 20, color: '#60a5fa' },
      { id: 'harama', label: 'HARAMA', value: 14, color: '#f97316' },
      { id: 'pinecrest', label: 'PINECREST', value: 12, color: '#a855f7' },
      { id: 'lab', label: 'LAB', value: 9, color: '#f472b6' },
      { id: 'support', label: 'SUPPORT', value: 7, color: '#38bdf8' }
    ],
    ptoStats: [
      { label: 'Pending PTOs', value: '5', helper: 'Awaiting manager review' },
      { label: 'Approved PTOs', value: '72', helper: 'Scheduled across teams' },
      { label: 'Return Today', value: '2', helper: 'Employees coming back from PTO' }
    ],
    highlights: [
      { id: 'headcount', label: 'Total Headcount', value: '86', change: '+1 vs last month', tone: 'positive' },
      { id: 'new-hires', label: 'New Hires (30d)', value: '3', change: 'Two start this week', tone: 'neutral' },
      { id: 'engagement', label: 'Engagement Index', value: '78', change: '+2 pts vs Q1', tone: 'positive' },
      { id: 'turnover', label: 'Turnover Risk', value: '8%', change: '+0.5 pts vs avg', tone: 'negative' }
    ],
    updates: [
      {
        id: 'recruiting-event',
        title: 'Local career fair recap',
        description: 'Seven hygienist candidates advanced to interviews.',
        timestamp: '45 minutes ago'
      },
      {
        id: 'policy-refresh',
        title: 'Policy refresh published',
        description: 'Updated attendance guidelines now in effect.',
        timestamp: '2 hours ago'
      },
      {
        id: 'culture-lab',
        title: 'Culture lab session',
        description: 'Leaders reviewing employee listening feedback next week.',
        timestamp: 'Yesterday'
      }
    ],
    peopleMoments: [
      { id: 'anniversary-02', name: 'Chris Howard', department: 'IT & Systems', date: 'Today', type: 'anniversary' },
      { id: 'birthday-02', name: 'Mei Chen', department: 'Billing', date: 'Friday', type: 'birthday' },
      { id: 'newhire-02', name: 'Kendra Price', department: 'Practice Manager', date: 'Next Tuesday', type: 'new-hire' }
    ]
  },
  {
    id: 'complete-dental-lab',
    name: 'Complete Dental Lab',
    location: 'Tampa, FL',
    headcount: 64,
    openRoles: 3,
    activePTO: 6,
    departmentDistribution: [
      { id: 'production', label: 'Production', value: 28, color: '#34d399' },
      { id: 'design', label: 'Design', value: 14, color: '#60a5fa' },
      { id: 'qa', label: 'Quality Assurance', value: 10, color: '#f97316' },
      { id: 'logistics', label: 'Logistics', value: 6, color: '#a855f7' },
      { id: 'support', label: 'Support', value: 6, color: '#f472b6' }
    ],
    ptoStats: [
      { label: 'Pending PTOs', value: '2', helper: 'Awaiting manager review' },
      { label: 'Approved PTOs', value: '34', helper: 'Scheduled across teams' },
      { label: 'Return Today', value: '1', helper: 'Employees coming back from PTO' }
    ],
    highlights: [
      { id: 'headcount', label: 'Total Headcount', value: '64', change: 'Stable this month', tone: 'neutral' },
      { id: 'new-hires', label: 'New Hires (30d)', value: '2', change: 'Offer letters accepted', tone: 'positive' },
      { id: 'engagement', label: 'Engagement Index', value: '80', change: '+3 pts vs Q1', tone: 'positive' },
      { id: 'turnover', label: 'Turnover Risk', value: '5%', change: '-0.5 pts vs avg', tone: 'positive' }
    ],
    updates: [
      {
        id: 'shift-coverage',
        title: 'Weekend coverage secured',
        description: 'All crowns and bridges shifts staffed through month-end.',
        timestamp: '15 minutes ago'
      },
      {
        id: 'skills-lab',
        title: 'Digital impressions workshop',
        description: 'Training roster confirmed for upcoming CAD refresh.',
        timestamp: 'Today'
      },
      {
        id: 'wellness',
        title: 'Wellness challenge launched',
        description: 'Participation packs delivered to each production line.',
        timestamp: 'Yesterday'
      }
    ],
    peopleMoments: [
      { id: 'anniversary-03', name: 'Robert King', department: 'Production', date: 'Today', type: 'anniversary' },
      { id: 'birthday-03', name: 'Adriana Lopez', department: 'Design', date: 'Next Thursday', type: 'birthday' },
      { id: 'newhire-03', name: 'Jared Stone', department: 'Logistics', date: 'Next Wednesday', type: 'new-hire' }
    ]
  }
];

const toneStyles: Record<HighlightMetric['tone'], string> = {
  positive: 'text-emerald-300',
  neutral: 'text-slate-400',
  negative: 'text-rose-300'
};

const momentBadges: Record<EmployeeMoment['type'], { label: string; style: string }> = {
  anniversary: { label: 'Anniversary', style: 'bg-primary-500/10 text-primary-200' },
  birthday: { label: 'Birthday', style: 'bg-amber-500/10 text-amber-200' },
  'new-hire': { label: 'New Hire', style: 'bg-emerald-500/10 text-emerald-200' }
};

export default function HRDashboardPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id ?? '');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Admin');
  }, [router]);

  const company = useMemo(
    () => companies.find((entry) => entry.id === selectedCompanyId) ?? companies[0],
    [selectedCompanyId]
  );

  const departmentGradient = useMemo(() => {
    if (!company) return '';

    const total = company.departmentDistribution.reduce((sum, item) => sum + item.value, 0);
    let current = 0;

    return company.departmentDistribution
      .map((item) => {
        const start = (current / total) * 360;
        current += item.value;
        const end = (current / total) * 360;
        return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
      })
      .join(', ');
  }, [company]);

  if (!company) {
    return null;
  }

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

            <Navigation className="mt-10 space-y-1" />
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary-200/70">{t('Need help?')}</p>
            <p className="mt-3 text-base font-semibold text-slate-50">{t('HR playbook update')}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t('Download the refreshed HR operations guide for clinic administrators and team leads.')}
            </p>
            <button className="mt-4 w-full rounded-2xl border border-primary-400/30 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-50 transition hover:bg-primary-400/30">
              {t('Download brief')}
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('HR')}</p>
                  <h1 className="text-2xl font-semibold text-slate-50">{t('People operations dashboard')}</h1>
                  <p className="text-sm text-slate-400">{t('Welcome back, {name}.', { name: userName || t('team') })}</p>
                </div>

                <MobileNavigation className="flex gap-2 overflow-x-auto pb-1 lg:hidden" />
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-72">
                  <label htmlFor="company-select" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                    {t('Select company')}
                  </label>
                  <div className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 shadow-inner shadow-primary-900/20">
                    <span className="text-xs uppercase tracking-[0.35em] text-primary-300">{t('HR')}</span>
                    <select
                      id="company-select"
                      value={selectedCompanyId}
                      onChange={(event) => setSelectedCompanyId(event.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-slate-100 focus:outline-none"
                    >
                      {companies.map((option) => (
                        <option key={option.id} value={option.id} className="bg-slate-900 text-slate-100">
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{company.location}</p>
                </div>

                <button className="rounded-2xl bg-primary-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400">
                  {t('Create announcement')}
                </button>
              </div>
            </div>
          </header>

          <TopNavigation />

          <main className="relative mx-auto max-w-6xl px-6 py-12 lg:px-10">
            <HrSubNavigation />
            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {company.highlights.map((metric) => (
                    <div
                      key={metric.id}
                      className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition hover:border-primary-400/30 hover:bg-white/[0.06]"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t(metric.label)}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-50">{metric.value}</p>
                      <p className={`mt-2 text-[11px] font-semibold uppercase tracking-wider ${toneStyles[metric.tone]}`}>
                        {t(metric.change)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Headcount')}</p>
                        <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Employees by department')}</h2>
                        <p className="mt-1 text-sm text-slate-400">{t('Visualize distribution across your teams')}</p>
                      </div>
                      <div className="flex-shrink-0 rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200">
                        {company.headcount} {t('people')}
                      </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
                      <div className="mx-auto h-48 w-48 rounded-full border border-white/10 bg-white/[0.02] p-6">
                        <div
                          className="relative h-full w-full rounded-full"
                          style={{ backgroundImage: `conic-gradient(${departmentGradient})` }}
                        >
                          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/90" />
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {company.departmentDistribution.map((item) => (
                          <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                              <p className="text-xs text-slate-400">{Math.round((item.value / company.headcount) * 100)}% {t('of team')}</p>
                            </div>
                            <p className="text-sm font-semibold text-slate-100">{item.value}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Time away')}</p>
                        <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('PTO activity')}</h2>
                        <p className="mt-1 text-sm text-slate-400">{t('Track approvals and returns at a glance')}</p>
                      </div>
                      <div className="flex-shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                        {company.activePTO} {t('active today')}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {company.ptoStats.map((stat) => (
                        <div key={stat.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-100">{t(stat.label)}</p>
                            <p className="text-xs text-slate-400">{t(stat.helper)}</p>
                          </div>
                          <p className="text-2xl font-semibold text-slate-50">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <button className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                      {t('View PTO calendar')}
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Team updates')}</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Field communications')}</h2>
                      <p className="mt-1 text-sm text-slate-400">{t('Surface important actions for clinic leaders')}</p>
                    </div>
                    <button className="flex-shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                      {t('View archive')}
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {company.updates.map((update) => (
                      <div key={update.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-primary-400/30 hover:bg-white/[0.05]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-100">{update.title}</p>
                            <p className="text-xs text-slate-400">{update.description}</p>
                          </div>
                          <span className="flex-shrink-0 text-xs uppercase tracking-wide text-slate-500">{update.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Watchlist')}</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Critical follow-ups')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t('Top priorities surfaced from workforce analytics')}</p>

                  <ul className="mt-6 space-y-3 text-sm text-slate-300">
                    <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="font-semibold text-slate-100">{t('Finalize staffing plan for Pinecrest expansion')}</p>
                      <p className="text-xs text-slate-400">{t('Draft ready for approval · Due Friday')}</p>
                    </li>
                    <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="font-semibold text-slate-100">{t('Review compensation adjustments for Q4')}</p>
                      <p className="text-xs text-slate-400">{t('Finance inputs received · Schedule exec briefing')}</p>
                    </li>
                    <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <p className="font-semibold text-slate-100">{t('Launch retention pulse for hygiene teams')}</p>
                      <p className="text-xs text-slate-400">{t('Survey draft ready · Need localization review')}</p>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('People moments')}</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Celebrate your teams')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t('Upcoming milestones across clinics')}</p>

                  <div className="mt-6 space-y-4">
                    {company.peopleMoments.map((moment) => (
                      <div key={moment.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-100">{moment.name}</p>
                          <p className="text-xs text-slate-400">{moment.department}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          <p className="font-semibold text-slate-100">{moment.date}</p>
                          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${momentBadges[moment.type].style}`}>
                            {t(momentBadges[moment.type].label)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Open roles')}</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Recruiting snapshot')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t('Monitor active searches and candidate flow')}</p>

                  <div className="mt-6 grid gap-4">
                    <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{t('Active job postings')}</p>
                        <p className="text-xs text-slate-400">{t('Clinical, operations, leadership')}</p>
                      </div>
                      <p className="text-2xl font-semibold text-slate-50">{company.openRoles}</p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-xs uppercase tracking-wide text-slate-400">
                        <span>{t('Role')}</span>
                        <span>{t('Stage')}</span>
                      </div>
                      <ul className="divide-y divide-white/5 text-sm text-slate-300">
                        <li className="flex items-center justify-between px-4 py-3">
                          <span>{t('Dental Hygienist · Pinecrest')}</span>
                          <span className="rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-200">{t('Offers out')}</span>
                        </li>
                        <li className="flex items-center justify-between px-4 py-3">
                          <span>{t('Practice Manager · Lilite')}</span>
                          <span className="rounded-full bg-primary-500/10 px-3 py-0.5 text-xs font-semibold text-primary-200">{t('Panel interviews')}</span>
                        </li>
                        <li className="flex items-center justify-between px-4 py-3">
                          <span>{t('Dental Assistant · Harama')}</span>
                          <span className="rounded-full bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-200">{t('Second round')}</span>
                        </li>
                      </ul>
                    </div>

                    <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                      {t('Open recruiting workspace')}
                    </button>
                  </div>
                </div>
              </aside>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

