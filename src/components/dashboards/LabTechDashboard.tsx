'use client';

import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import { GET_LAB_CASES } from '@/graphql/lab-queries';

export default function LabTechDashboard() {
  const { t } = useTranslations();
  
  const { data, loading } = useQuery(GET_LAB_CASES);

  const cases = data?.labCases || [];
  
  const activeCases = cases.filter((c: any) => c.status !== 'Delivered' && c.status !== 'Cancelled');
  const urgentCases = cases.filter((c: any) => c.urgency === 'Rush' || c.urgency === 'Emergency');
  const inProductionCases = cases.filter((c: any) => c.status === 'In Production');
  const readyForDelivery = cases.filter((c: any) => c.status === 'Ready for Delivery');

  const todaysCases = activeCases.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Lab Tech Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-cyan-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Active Cases')}</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">{activeCases.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('In your queue')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-rose-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Urgent Cases')}</p>
          <p className="mt-2 text-3xl font-bold text-rose-300">{urgentCases.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Rush & emergency')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-amber-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('In Production')}</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">{inProductionCases.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Currently working')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-emerald-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Ready for Delivery')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">{readyForDelivery.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Awaiting pickup')}</p>
        </div>
      </div>

      {/* Today's Cases */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">{t('Today')}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('My Active Cases')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('Cases currently in production')}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Case ID')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Patient')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Procedure')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Status')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Due Date')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">{t('Urgency')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {todaysCases.length > 0 ? (
                todaysCases.map((labCase: any) => (
                  <tr key={labCase.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-4 text-sm font-medium text-cyan-300">{labCase.caseId}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{labCase.patientName}</td>
                    <td className="px-4 py-4 text-sm text-slate-300">{labCase.procedureType}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                        {labCase.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-400">
                      {new Date(labCase.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        labCase.urgency === 'Rush' || labCase.urgency === 'Emergency'
                          ? 'bg-rose-500/10 text-rose-300'
                          : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {labCase.urgency}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                    {t('No active cases at the moment')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20">
            <svg className="h-6 w-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Case Search')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Find and update case status')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
            <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Transit Tracking')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Monitor deliveries and shipments')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20">
            <svg className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Quality Reports')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Document remakes and issues')}</p>
        </div>
      </div>
    </div>
  );
}
