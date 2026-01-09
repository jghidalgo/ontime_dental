'use client';

import { useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_DATA } from '@/graphql/dashboard-queries';

type AdminDashboardProps = {
  companyId?: string;
};

export default function AdminDashboard({ companyId }: Readonly<AdminDashboardProps>) {
  const { t } = useTranslations();
  
  const { data } = useQuery(GET_DASHBOARD_DATA, {
    variables: { companyId: companyId || null },
    pollInterval: 30000, // Refresh every 30 seconds
  });

  const metrics = useMemo(() => data?.dashboardData?.metrics || [], [data]);
  const priorityTasks = useMemo(() => data?.dashboardData?.priorityTasks || [], [data]);
  const revenueTrend = useMemo(() => data?.dashboardData?.revenueTrend || [], [data]);
  const announcements = useMemo(() => data?.dashboardData?.announcements || [], [data]);

  const hasRevenueTrendData = useMemo(() => {
    return revenueTrend.some((item: any) => Number(item?.value ?? 0) > 0);
  }, [revenueTrend]);

  const revenueMax = useMemo(() => {
    const values = revenueTrend
      .map((item: any) => Number(item?.value ?? 0))
      .filter((value: number) => Number.isFinite(value));
    const max = values.length > 0 ? Math.max(...values) : 0;
    return Math.max(1, max);
  }, [revenueTrend]);

  const revenueTrendDeltaLabel = useMemo(() => {
    if (revenueTrend.length < 2) return null;
    const first = Number(revenueTrend[0]?.value ?? 0);
    const last = Number(revenueTrend[revenueTrend.length - 1]?.value ?? 0);
    if (!Number.isFinite(first) || !Number.isFinite(last) || first <= 0) return null;
    const pct = Math.round(((last - first) / first) * 100);
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct}%`;
  }, [revenueTrend]);

  const getTrendColor = (trend: string) => {
    if (trend === 'positive') return 'text-emerald-300';
    if (trend === 'negative') return 'text-rose-300';
    return 'text-slate-400';
  };

  const getAnnouncementBadgeClasses = (badge: string) => {
    if (badge === 'URGENT' || badge === 'Critical') return 'bg-rose-500/20 text-rose-300';
    if (badge === 'Priority') return 'bg-amber-500/20 text-amber-300';
    return 'bg-emerald-500/20 text-emerald-300';
  };

  const getTaskBadgeClasses = (badge: string) => {
    if (badge === 'URGENT') return 'bg-rose-500/20 text-rose-300';
    if (badge === 'DELAYED') return 'bg-amber-500/20 text-amber-300';
    if (badge === 'YESTERDAY') return 'bg-sky-500/20 text-sky-300';
    return 'bg-emerald-500/20 text-emerald-300';
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/20 border-t-primary-500" />
          <p className="text-slate-400">{t('Loading dashboard data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Grid - Now 3 columns for better layout */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric: any) => (
          <div
            key={metric.label}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl transition hover:border-primary-400/30 hover:bg-white/[0.06] hover:shadow-primary-900/20"
          >
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t(metric.label)}</p>
              <p className="text-3xl font-bold text-slate-50">{metric.value}</p>
              <div className="flex items-center gap-2">
                {metric.trend === 'positive' && (
                  <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )}
                {metric.trend === 'negative' && (
                  <svg className="h-4 w-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                )}
                <span
                  className={`text-xs font-semibold ${getTrendColor(metric.trend)}`}
                >
                  {t(metric.delta)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Chart */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Performance')}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Lab Case Completions')}</h2>
              <p className="mt-1 text-sm text-slate-400">{t('Production volume over the last six months')}</p>
            </div>
            {hasRevenueTrendData && (
              <div className="flex-shrink-0 rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200 whitespace-nowrap">
                {revenueTrendDeltaLabel ?? '—'}
              </div>
            )}
          </div>
          {hasRevenueTrendData ? (
            <div className="mt-8 flex items-end gap-4 overflow-x-auto pb-2">
              {revenueTrend.map((point: any) => (
                <div key={point.month} className="flex w-full min-w-[40px] flex-col items-center gap-3">
                  <div
                    className="w-full rounded-2xl bg-gradient-to-t from-primary-500/10 via-primary-400/50 to-primary-300/80 shadow-inner shadow-primary-900/40"
                    style={{ height: `${(Number(point.value ?? 0) / revenueMax) * 160 + 24}px` }}
                  />
                  <p className="text-xs font-medium text-slate-400 whitespace-nowrap">{t(point.month)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-primary-400/20 bg-primary-500/10">
                <div className="relative h-10 w-10 rounded-full border border-white/10 bg-white/[0.03]">
                  <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-3 -translate-y-1.5 rounded-full bg-slate-200/80" />
                  <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 translate-x-1.5 -translate-y-1.5 rounded-full bg-slate-200/80" />
                  <div className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 translate-y-2 rounded-full bg-slate-200/50" />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-200">{t('No data to display')}</p>
              <p className="mt-2 text-xs text-slate-500">{t('Complete some lab cases to see the trend here.')}</p>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Today')}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-50 truncate">{t('Priority Tasks')}</h2>
              <p className="mt-1 text-sm text-slate-400 truncate">{t('Urgent items requiring attention')}</p>
            </div>
            <button className="flex-shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white whitespace-nowrap">
              {t('View all')}
            </button>
          </div>
          <div className="mt-8 space-y-4">
            {priorityTasks.length > 0 ? (
              priorityTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-primary-400/30 hover:bg-white/[0.06]"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${getTaskBadgeClasses(
                          String(task.badge ?? '')
                        )}`}
                      >
                        {t(String(task.badge ?? ''))}
                      </span>
                      <p className="text-sm font-semibold text-slate-100 truncate">{task.title}</p>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{task.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right text-xs text-slate-400">
                    <p className="font-semibold text-slate-100 whitespace-nowrap">{task.kind === 'lab' ? t('Lab') : t('Ticket')}</p>
                    <p className="whitespace-nowrap">{task.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
                <p className="text-sm font-semibold text-slate-200">{t('No priority tasks')}</p>
                <p className="mt-2 text-xs text-slate-500">{t('You are all caught up for now.')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/10 via-slate-900/70 to-slate-950 p-8 shadow-2xl shadow-primary-900/40 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80 truncate">{t('System Insights')}</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-50 truncate">{t("What's happening")}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="space-y-2 rounded-2xl border border-primary-500/15 bg-white/[0.02] p-4 overflow-hidden">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${getAnnouncementBadgeClasses(
                  item.badge
                )}`}
              >
                {t(item.badge)}
              </span>
              <p className="text-sm font-semibold text-slate-100 break-words">{t(item.title)}</p>
              <p className="text-xs text-slate-400 break-words">{t(item.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
