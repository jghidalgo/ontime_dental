'use client';

import { FormEvent, Fragment, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { GET_BILLING_CASES } from '@/graphql/billing-queries';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';

type LabCase = {
  id: string;
  caseId: string;
  companyId: string;
  clinic: string;
  clinicId?: string;
  procedure: string;
  price?: number;
  reservationDate: string;
  actualCompletion?: string;
  status: string;
  createdAt: string;
};

type AggregatedProcedure = {
  key: string;
  procedure: string;
  quantity: number;
  amount: number;
};

type AggregatedClinic = {
  clinic: string;
  clinicId?: string;
  totalQuantity: number;
  totalAmount: number;
  procedures: AggregatedProcedure[];
};

type AggregatedData = {
  clinics: AggregatedClinic[];
  totalQuantity: number;
  totalAmount: number;
  procedureCount: number;
  clinicCount: number;
};

const defaultFilters = {
  startDate: '2025-10-01',
  endDate: '2025-11-16'
};

export default function LaboratoryBillingPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const locale = 'en-US';

  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [canSwitchEntity, setCanSwitchEntity] = useState<boolean>(false);
  const [formStartDate, setFormStartDate] = useState<string>(defaultFilters.startDate);
  const [formEndDate, setFormEndDate] = useState<string>(defaultFilters.endDate);
  const [filters, setFilters] = useState({
    companyId: '',
    startDate: defaultFilters.startDate,
    endDate: defaultFilters.endDate
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch billing cases from GraphQL
  const { data: billingData, loading } = useQuery(GET_BILLING_CASES, {
    variables: {
      companyId: filters.companyId,
      startDate: filters.startDate,
      endDate: filters.endDate
    },
    skip: !filters.companyId
  });

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
    [locale]
  );

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');
                    {(() => {
                      if (loading) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                              {t('Loading billing data...')}
                            </td>
                          </tr>
                        );
                      }

                      if (aggregated.clinics.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                              {t('No billing records found for the selected period.')}
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <>
                          {aggregated.clinics.map((entry) => (
                            <Fragment key={entry.clinicId || entry.clinic}>
                              <tr>
                                <td
                                  colSpan={4}
                                  className="bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary-200/80"
                                >
                                  {entry.clinic}
                                </td>
                              </tr>
                              {entry.procedures.map((procedure) => (
                                <tr key={`${entry.clinicId || entry.clinic}-${procedure.key}`} className="text-sm text-slate-200">
                                  <td className="px-6 py-4 font-medium text-white">{procedure.procedure}</td>
                                  <td className="px-6 py-4 text-center">{procedure.quantity}</td>
                                  <td className="px-6 py-4 text-slate-300">{currencyFormatter.format(procedure.amount)}</td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      type="button"
                                      className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/40 hover:text-primary-50"
                                    >
                                      {t('Export')}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </Fragment>
                          ))}
                        </>
                      );
                    })()}
      }
    >();

    let totalQuantity = 0;
    let totalAmount = 0;

    for (const labCase of cases) {
      const clinicKey = labCase.clinicId || labCase.clinic;
      
      let clinicEntry = clinicMap.get(clinicKey);
      if (!clinicEntry) {
        clinicEntry = {
          clinic: labCase.clinic,
          clinicId: labCase.clinicId,
          totalQuantity: 0,
          totalAmount: 0,
          procedureMap: new Map()
        };
        clinicMap.set(clinicKey, clinicEntry);
      }

      const procedureKey = labCase.procedure;
      let procedureEntry = clinicEntry.procedureMap.get(procedureKey);
      if (!procedureEntry) {
        procedureEntry = {
          key: procedureKey,
          procedure: labCase.procedure,
          quantity: 0,
          amount: 0
        };
        clinicEntry.procedureMap.set(procedureKey, procedureEntry);
      }

      const casePrice = labCase.price || 0;
      procedureEntry.quantity += 1;
      procedureEntry.amount += casePrice;
      clinicEntry.totalQuantity += 1;
      clinicEntry.totalAmount += casePrice;
      totalQuantity += 1;
      totalAmount += casePrice;
    }

    const clinicsWithRecords = Array.from(clinicMap.values())
      .map<AggregatedClinic>((entry) => ({
        clinic: entry.clinic,
        clinicId: entry.clinicId,
        totalQuantity: entry.totalQuantity,
        totalAmount: entry.totalAmount,
        procedures: Array.from(entry.procedureMap.values())
      }));

    const procedureCount = clinicsWithRecords.reduce((sum, clinic) => sum + clinic.procedures.length, 0);

    return {
      clinics: clinicsWithRecords,
      totalQuantity,
      totalAmount,
      procedureCount,
      clinicCount: clinicsWithRecords.length
    };
  }, [billingData]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (formStartDate && formEndDate) {
      if (formStartDate > formEndDate) {
        setFormError(t('Start date must be on or before end date.'));
        return;
      }
    }

    setFilters({
      companyId: selectedEntityId,
      startDate: formStartDate,
      endDate: formEndDate
    });
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <PageHeader
          category={t('Laboratory')}
          title={t('Billing Control Center')}
          subtitle={t('Review production invoices by clinic, procedure, and totals.')}
            showEntitySelector={canSwitchEntity}
          entityLabel={t('Company')}
          selectedEntityId={selectedEntityId}
            onEntityChange={(id) => {
              if (!canSwitchEntity) return;
              setSelectedEntityId(id);
            }}
        />
        <TopNavigation />
      </div>

      <div className="relative mx-auto w-full max-w-[120rem]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
          <section className="mt-8">
            <form
              onSubmit={handleSubmit}
              className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-xl sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  {t('Start date')}
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(event) => setFormStartDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-white transition focus:border-primary-400/60 focus:outline-none"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  {t('End date')}
                </label>
                <input
                  type="date"
                  value={formEndDate}
                  onChange={(event) => setFormEndDate(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-white transition focus:border-primary-400/60 focus:outline-none"
                />
              </div>

                <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-2">
                  <button
                    type="submit"
                    className="rounded-full bg-primary-500/90 px-6 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-primary-400"
                  >
                    {t('Apply')}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                  >
                    {t('Reports')}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-dashed border-primary-400/40 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/70"
                  >
                    {t('Legacy billing')}
                  </button>
                </div>
              </form>
              {formError && (
                <p className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
                  {formError}
                </p>
              )}
            </section>

            <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Clinics with activity')}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{aggregated.clinicCount}</p>
                <p className="text-xs text-slate-400">{t('Billing')}</p>
              </div>
              <div className="rounded-2xl border border-primary-400/30 bg-primary-500/10 px-4 py-5 text-primary-50">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Procedures in period')}</p>
                <p className="mt-3 text-3xl font-semibold">{aggregated.procedureCount}</p>
                <p className="text-xs text-primary-100/70">{t('Procedure')}</p>
              </div>
              <div className="rounded-2xl border border-slate-400/30 bg-slate-500/10 px-4 py-5 text-slate-100">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">{t('Units billed')}</p>
                <p className="mt-3 text-3xl font-semibold">{aggregated.totalQuantity}</p>
                <p className="text-xs text-slate-400">{t('Quantity')}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-5 text-emerald-100">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">{t('Total amount billed')}</p>
                <p className="mt-3 text-3xl font-semibold">{currencyFormatter.format(aggregated.totalAmount)}</p>
                <p className="text-xs text-emerald-200/70">USD</p>
              </div>
            </section>

            <section className="mt-10">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] shadow-xl">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.35em] text-slate-400">
                      <th className="px-6 py-4 font-semibold">{t('Procedure')}</th>
                      <th className="px-6 py-4 text-center font-semibold">{t('Quantity')}</th>
                      <th className="px-6 py-4 font-semibold">{t('Total amount')}</th>
                      <th className="px-6 py-4 text-right font-semibold">{t('Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                          {t('Loading billing data...')}
                        </td>
                      </tr>
                    ) : aggregated.clinics.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                          {t('No billing records found for the selected period.')}
                        </td>
                      </tr>
                    ) : (
                      <>
                        {aggregated.clinics.map((entry) => (
                          <Fragment key={entry.clinicId || entry.clinic}>
                            <tr>
                              <td
                                colSpan={4}
                                className="bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary-200/80"
                              >
                                {entry.clinic}
                              </td>
                            </tr>
                            {entry.procedures.map((procedure) => (
                              <tr key={`${entry.clinicId || entry.clinic}-${procedure.key}`} className="text-sm text-slate-200">
                                <td className="px-6 py-4 font-medium text-white">{procedure.procedure}</td>
                                <td className="px-6 py-4 text-center">{procedure.quantity}</td>
                                <td className="px-6 py-4 text-slate-300">{currencyFormatter.format(procedure.amount)}</td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    type="button"
                                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                                  >
                                    {t('Download detail')}
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="text-sm font-semibold text-primary-100">
                              <td className="px-6 py-3">{t('Total by clinic')}</td>
                              <td className="px-6 py-3 text-center">{entry.totalQuantity}</td>
                              <td className="px-6 py-3">{currencyFormatter.format(entry.totalAmount)}</td>
                              <td className="px-6 py-3" />
                            </tr>
                          </Fragment>
                        ))}
                        <tr className="text-sm font-semibold uppercase tracking-wide text-primary-100">
                          <td className="px-6 py-4">{t('Grand total')}</td>
                          <td className="px-6 py-4 text-center">{aggregated.totalQuantity}</td>
                          <td className="px-6 py-4">{currencyFormatter.format(aggregated.totalAmount)}</td>
                          <td className="px-6 py-4" />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
    </main>
  );
}

