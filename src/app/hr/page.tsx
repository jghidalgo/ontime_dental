'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { GET_EMPLOYEE_LOCATION_DISTRIBUTION } from '@/graphql/hr-dashboard-queries';
import { GET_PTOS } from '@/graphql/pto-queries';
import { GET_COMPANIES } from '@/graphql/company-queries';
import { APPROVE_PTO, REJECT_PTO } from '@/graphql/pto-mutations';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import HrSubNavigation from '@/components/hr/HrSubNavigation';
import { useTranslations } from '@/lib/i18n';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';

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
  updates: TeamUpdate[];
  peopleMoments: EmployeeMoment[];
};

// Template-only content (updates + moments). These get attached to real companies from the DB.
const companyTemplates: Array<Pick<CompanyProfile, 'updates' | 'peopleMoments'>> = [
  {
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
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [ptoActionError, setPtoActionError] = useState<string | null>(null);
  const [ptoActionId, setPtoActionId] = useState<string | null>(null);

  const { data: companiesData } = useQuery(GET_COMPANIES, {
    fetchPolicy: 'cache-first',
    skip: isCheckingAccess
  });

  // Fetch employee location distribution from database
  const { data: locationData, loading } = useQuery(GET_EMPLOYEE_LOCATION_DISTRIBUTION, {
    variables: {
      companyId: selectedCompanyId
    },
    pollInterval: 30000, // Refresh every 30 seconds
    skip: isCheckingAccess || !selectedCompanyId
  });

  // Fetch PTOs for the selected company
  const { data: ptosData, error: ptosError, refetch: refetchPTOs } = useQuery(GET_PTOS, {
    variables: { companyId: selectedCompanyId },
    pollInterval: 30000, // Refresh every 30 seconds
    fetchPolicy: 'network-only', // Always fetch fresh data
    notifyOnNetworkStatusChange: true,
    skip: isCheckingAccess || !selectedCompanyId
  });

  const [approvePTO, { loading: approving }] = useMutation(APPROVE_PTO);
  const [rejectPTO, { loading: rejecting }] = useMutation(REJECT_PTO);

  // Log any PTO query errors
  useEffect(() => {
    if (ptosError) {
      console.error('Error fetching PTOs:', ptosError);
    }
  }, [ptosError]);

  const locationDistribution = useMemo(() => {
    return locationData?.employeeLocationDistribution || [];
  }, [locationData]);

  // Calculate PTO stats from real data
  const ptoStats = useMemo(() => {
    const ptos = ptosData?.ptos || [];

    const pending = ptos.filter((pto: any) => pto.status === 'pending').length;
    const approved = ptos.filter((pto: any) => pto.status === 'approved').length;
    const activePTO = ptos.filter((pto: any) => {
      if (pto.status !== 'approved') return false;
      const now = new Date();
      const start = new Date(pto.startDate);
      const end = new Date(pto.endDate);
      return start <= now && now <= end;
    }).length;

    return [
      { label: 'Pending PTOs', value: pending.toString(), helper: 'Awaiting manager review' },
      { label: 'Approved PTOs', value: approved.toString(), helper: 'Scheduled across teams' },
      { label: 'Active PTOs', value: activePTO.toString(), helper: 'Currently out of office' }
    ];
  }, [ptosData, selectedCompanyId]);

  const pendingPTOs = useMemo(() => {
    const ptos = ptosData?.ptos || [];
    return ptos
      .filter((pto: any) => pto.status === 'pending')
      .slice(0, 8);
  }, [ptosData]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString();
  };

  const handleApprove = async (ptoId: string) => {
    setPtoActionError(null);
    setPtoActionId(ptoId);
    try {
      const user = getUserSession();
      const reviewedBy = user?.email || user?.name || 'admin';
      await approvePTO({ variables: { id: ptoId, reviewedBy } });
      await refetchPTOs();
    } catch (error) {
      setPtoActionError(error instanceof Error ? error.message : 'Failed to approve PTO');
    } finally {
      setPtoActionId(null);
    }
  };

  const handleReject = async (ptoId: string) => {
    setPtoActionError(null);
    setPtoActionId(ptoId);
    try {
      const user = getUserSession();
      const reviewedBy = user?.email || user?.name || 'admin';
      await rejectPTO({ variables: { id: ptoId, reviewedBy } });
      await refetchPTOs();
    } catch (error) {
      setPtoActionError(error instanceof Error ? error.message : 'Failed to reject PTO');
    } finally {
      setPtoActionId(null);
    }
  };

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.replace('/login');
      return;
    }

    const user = getUserSession();
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!hasModuleAccess(user, 'hr')) {
      router.replace('/dashboard');
      return;
    }

    // Only admins and managers can see full HR dashboard
    const role = (user.role || '').toLowerCase();
    const userIsAdmin = role === 'admin' || role === 'manager';

    // For non-admin users, redirect to their personal HR view before rendering admin UI
    if (!userIsAdmin) {
      router.replace('/hr/my-info');
      return;
    }

    // Set default company ID (admin: persisted selection; otherwise from session)
    const savedCompanyId = globalThis.localStorage.getItem('ontime.selectedCompanyId');
    if (userIsAdmin && savedCompanyId) {
      setSelectedCompanyId((prev) => prev || savedCompanyId);
    } else if (user.companyId) {
      setSelectedCompanyId((prev) => prev || user.companyId || '');
    }

    setIsCheckingAccess(false);
  }, [router]);

  // Calculate total headcount from location distribution
  const totalHeadcount = useMemo(() => {
    return locationDistribution.reduce((sum: number, item: any) => sum + item.count, 0);
  }, [locationDistribution]);

  const company = useMemo(() => {
    const activeCompanies = (companiesData?.companies || []).filter((c: any) => c.isActive);
    if (activeCompanies.length === 0) {
      return {
        id: selectedCompanyId || 'unknown',
        name: 'Company',
        location: '',
        ...companyTemplates[0]
      } satisfies CompanyProfile;
    }

    const selected = activeCompanies.find((c: any) => c.id === selectedCompanyId) || activeCompanies[0];
    const templateIndex = Math.max(0, activeCompanies.findIndex((c: any) => c.id === selected.id));
    const template = companyTemplates[templateIndex % companyTemplates.length];

    return {
      id: selected.id,
      name: selected.shortName || selected.name,
      location: selected.location || '',
      ...template
    } satisfies CompanyProfile;
  }, [companiesData, selectedCompanyId]);

  const locationGradient = useMemo(() => {
    const total = locationDistribution.reduce((sum: number, item: any) => sum + item.count, 0);
    if (!total) return '';

    let current = 0;
    return locationDistribution
      .map((item: any) => {
        const start = (current / total) * 360;
        current += item.count;
        const end = (current / total) * 360;
        return `${item.color} ${start.toFixed(2)}deg ${end.toFixed(2)}deg`;
      })
      .join(', ');
  }, [locationDistribution]);

  const highlights = useMemo<HighlightMetric[]>(() => {
    const pending = Number(ptoStats[0]?.value || 0);
    const approved = Number(ptoStats[1]?.value || 0);
    const active = Number(ptoStats[2]?.value || 0);

    return [
      {
        id: 'headcount',
        label: 'Total Headcount',
        value: totalHeadcount.toString(),
        change: 'Active employees',
        tone: 'neutral'
      },
      {
        id: 'pto-pending',
        label: 'Pending PTOs',
        value: pending.toString(),
        change: 'Awaiting manager review',
        tone: pending > 0 ? 'negative' : 'positive'
      },
      {
        id: 'pto-approved',
        label: 'Approved PTOs',
        value: approved.toString(),
        change: 'Scheduled across teams',
        tone: 'neutral'
      },
      {
        id: 'pto-active',
        label: 'Active PTOs',
        value: active.toString(),
        change: 'Currently out of office',
        tone: 'neutral'
      }
    ];
  }, [ptoStats, totalHeadcount]);

  const renderLocationContent = () => {
    if (loading) {
      return (
        <div className="mt-8 flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
        </div>
      );
    }

    if (locationDistribution.length === 0) {
      return (
        <div className="mt-8 text-center text-sm text-slate-400">
          {t('No employee data available')}
        </div>
      );
    }

    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="mx-auto h-48 w-48 rounded-full border border-white/10 bg-white/[0.02] p-6">
          <div
            className="relative h-full w-full rounded-full"
            style={{ backgroundImage: `conic-gradient(${locationGradient})` }}
          >
            <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-slate-950/90" />
          </div>
        </div>
        <ul className="space-y-3">
          {locationDistribution.map((item: any) => (
            <li
              key={item.location}
              className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-100">{item.location}</p>
                <p className="text-xs text-slate-400">
                  {totalHeadcount > 0 ? Math.round((item.count / totalHeadcount) * 100) : 0}% {t('of team')}
                </p>
              </div>
              <p className="text-sm font-semibold text-slate-100">{item.count}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (isCheckingAccess) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-slate-950">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

        <div className="relative w-full">
          <div className="border-b border-slate-800 bg-slate-900/60">
            <PageHeader
              category={t('HR')}
              title={t('People operations dashboard')}
              showEntitySelector={false}
            />
            <TopNavigation />
          </div>

          <main className="mx-auto max-w-7xl px-6 py-10">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('HR')}
            title={t('People operations dashboard')}
            // subtitle={t('Welcome back, {name}.', { name: userName || t('team') })}
            showEntitySelector={true}
            entityLabel={t('Entity')}
            selectedEntityId={selectedCompanyId}
            onEntityChange={setSelectedCompanyId}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <HrSubNavigation />
            <button className="rounded-2xl bg-primary-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400">
              {t('Create announcement')}
            </button>
          </div>
            <section className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {highlights.map((metric) => (
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

              {/* Main Content Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Employees by Location */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Headcount')}</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Employees by clinic location')}</h2>
                      <p className="mt-1 text-sm text-slate-400">{t('Visualize distribution across your clinics')}</p>
                    </div>
                    <div className="flex-shrink-0 rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200">
                      {loading ? '...' : totalHeadcount} {t('people')}
                    </div>
                  </div>

                  {renderLocationContent()}
                </div>

                {/* PTO Activity */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Time away')}</p>
                      <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('PTO activity')}</h2>
                      <p className="mt-1 text-sm text-slate-400">{t('Track approvals and returns at a glance')}</p>
                    </div>
                    <div className="flex-shrink-0 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                      {ptoStats[2]?.value || '0'} {t('active today')}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {ptoStats.map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{t(stat.label)}</p>
                          <p className="text-xs text-slate-400">{t(stat.helper)}</p>
                        </div>
                        <p className="text-2xl font-semibold text-slate-50">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-sm font-semibold text-slate-100">{t('Pending PTO requests')}</h3>
                      <span className="text-xs text-slate-400">{pendingPTOs.length}</span>
                    </div>

                    {ptoActionError && (
                      <p className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                        {ptoActionError}
                      </p>
                    )}

                    {pendingPTOs.length === 0 ? (
                      <p className="mt-3 text-xs text-slate-400">{t('No pending PTO requests')}</p>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {pendingPTOs.map((pto: any) => {
                          const isBusy = (approving || rejecting) && ptoActionId === pto.id;
                          return (
                            <div
                              key={pto.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3"
                            >
                              <div className="min-w-[14rem]">
                                <p className="text-sm font-semibold text-slate-100">
                                  {pto.policyLeaveTypeName || pto.leaveType || t('PTO')}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {t('Employee')}: {pto.employeeId} • {formatDate(pto.startDate)} - {formatDate(pto.endDate)} • {pto.requestedDays} {t('days')}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleApprove(pto.id)}
                                  className="rounded-xl bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isBusy ? t('Working...') : t('Approve')}
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleReject(pto.id)}
                                  className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isBusy ? t('Working...') : t('Deny')}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                    {t('View PTO calendar')}
                  </button>
                </div>
              </div>

              {/* Bottom Row Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Field Communications */}
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
                            <p className="text-sm font-semibold text-slate-100">{t(update.title)}</p>
                            <p className="text-xs text-slate-400">{t(update.description)}</p>
                          </div>
                          <span className="flex-shrink-0 text-xs uppercase tracking-wide text-slate-500">
                            {t(update.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* People Moments */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('People moments')}</p>
                  <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Celebrate your teams')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t('Upcoming milestones across clinics')}</p>

                  <div className="mt-6 space-y-4">
                    {company.peopleMoments.map((moment) => (
                      <div key={moment.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-100">{moment.name}</p>
                          <p className="text-xs text-slate-400">{t(moment.department)}</p>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          <p className="font-semibold text-slate-100">{t(moment.date)}</p>
                          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${momentBadges[moment.type].style}`}>
                            {t(momentBadges[moment.type].label)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
      </div>
    </div>
  );
}

