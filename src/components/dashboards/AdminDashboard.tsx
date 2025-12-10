'use client';

import { useMemo } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_DATA } from '@/graphql/dashboard-queries';

export default function AdminDashboard() {
  const { t } = useTranslations();
  
  const { data } = useQuery(GET_DASHBOARD_DATA, {
    pollInterval: 30000, // Refresh every 30 seconds
  });

  const metrics = useMemo(() => data?.dashboardData?.metrics || [], [data]);
  const upcomingAppointments = useMemo(() => data?.dashboardData?.upcomingAppointments || [], [data]);
  const revenueTrend = useMemo(() => data?.dashboardData?.revenueTrend || [], [data]);
  const announcements = useMemo(() => data?.dashboardData?.announcements || [], [data]);

  const revenueMax = useMemo(() => {
    if (revenueTrend.length === 0) return 100;
    return Math.max(...revenueTrend.map((item: any) => item.value));
  }, [revenueTrend]);

  const getTrendColor = (trend: string) => {
    if (trend === 'positive') return 'text-emerald-300';
    if (trend === 'negative') return 'text-rose-300';
    return 'text-slate-400';
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
            <div className="flex-shrink-0 rounded-full border border-primary-400/20 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-200 whitespace-nowrap">
              {revenueTrend.length > 1 ? `+${Math.round(((revenueTrend[revenueTrend.length - 1].value - revenueTrend[0].value) / revenueTrend[0].value) * 100)}%` : '+9.5%'}
            </div>
          </div>
          <div className="mt-8 flex items-end gap-4 overflow-x-auto pb-2">
            {revenueTrend.map((point: any) => (
              <div key={point.month} className="flex w-full min-w-[40px] flex-col items-center gap-3">
                <div
                  className="w-full rounded-2xl bg-gradient-to-t from-primary-500/10 via-primary-400/50 to-primary-300/80 shadow-inner shadow-primary-900/40"
                  style={{ height: `${(point.value / revenueMax) * 160 + 24}px` }}
                />
                <p className="text-xs font-medium text-slate-400 whitespace-nowrap">{t(point.month)}</p>
              </div>
            ))}
          </div>
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
            {upcomingAppointments.map((appointment: any, index: number) => (
              <div
                key={`${appointment.time}-${appointment.patient}-${index}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-primary-400/30 hover:bg-white/[0.06]"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">{appointment.patient}</p>
                  <p className="text-xs text-slate-400 truncate">{t(appointment.treatment)}</p>
                </div>
                <div className="text-right text-xs text-slate-400 flex-shrink-0">
                  <p className="font-semibold text-slate-100 whitespace-nowrap">{appointment.time}</p>
                  <p className="truncate max-w-[120px]">{appointment.practitioner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-primary-500/10 via-slate-900/70 to-slate-950 p-8 shadow-2xl shadow-primary-900/40 backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80 truncate">{t('System Insights')}</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-50 truncate">{t("What's happening")}</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item: any, index: number) => (
            <div key={`${item.title}-${index}`} className="space-y-2 rounded-2xl border border-primary-500/15 bg-white/[0.02] p-4 overflow-hidden">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                item.badge === 'URGENT' || item.badge === 'Critical'
                  ? 'bg-rose-500/20 text-rose-300'
                  : item.badge === 'Priority'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
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
