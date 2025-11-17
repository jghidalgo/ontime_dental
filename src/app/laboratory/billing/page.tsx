'use client';

import Link from 'next/link';
import { FormEvent, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { Language, useTranslations } from '@/lib/i18n';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { GET_COMPANIES } from '@/graphql/company-queries';

type LocalizedField = Record<Language, string>;

type Company = {
  id: string;
  name: LocalizedField;
};

type Office = {
  id: string;
  companyId: string;
  order: number;
  name: LocalizedField;
};

type BillingRecord = {
  id: string;
  companyId: string;
  officeId: string;
  procedure: LocalizedField;
  quantity: number;
  amount: number;
  date: string; // YYYY-MM-DD
};

type AggregatedProcedure = {
  key: string;
  procedure: LocalizedField;
  quantity: number;
  amount: number;
};

type AggregatedOffice = {
  office: Office;
  totalQuantity: number;
  totalAmount: number;
  procedures: AggregatedProcedure[];
};

type AggregatedData = {
  offices: AggregatedOffice[];
  totalQuantity: number;
  totalAmount: number;
  procedureCount: number;
  officeCount: number;
};

const same = (value: string): LocalizedField => ({ en: value, es: value });

const companies: Company[] = [
  { id: 'blanco-janis', name: same('Blanco Janis Dental Group') },
  { id: 'complete-dental', name: same('Complete Dental Solutions of Florida') },
  { id: 'crosar-dental', name: same('Crosar Dental') },
  { id: 'doral-isles', name: same('Doral Isles Plaza Dentists') },
  { id: 'total-dental', name: same('Total Dental Care of Florida') },
  { id: 'vivadent', name: same('Vivadent DLD') }
];

const offices: Office[] = [
  { id: 'viv-west-hialeah', companyId: 'vivadent', order: 1, name: same('Vivadent West Hialeah') },
  { id: 'bisco-coral-gables', companyId: 'vivadent', order: 2, name: same('Bisco Coral Gables') },
  { id: 'bisco-miller', companyId: 'vivadent', order: 3, name: same('Bisco Miller') },
  { id: 'blanco-brickell', companyId: 'blanco-janis', order: 1, name: same('Blanco Janis · Brickell') },
  { id: 'blanco-sunrise', companyId: 'blanco-janis', order: 2, name: same('Blanco Janis · Sunrise') },
  { id: 'complete-orlando', companyId: 'complete-dental', order: 1, name: same('Complete Dental · Orlando') },
  { id: 'complete-tampa', companyId: 'complete-dental', order: 2, name: same('Complete Dental · Tampa') },
  { id: 'crosar-south-miami', companyId: 'crosar-dental', order: 1, name: same('Crosar Dental · South Miami') },
  { id: 'doral-isles-office', companyId: 'doral-isles', order: 1, name: same('Doral Isles Plaza Dentists') },
  { id: 'total-hialeah', companyId: 'total-dental', order: 1, name: same('Total Dental Care · Hialeah') },
  { id: 'total-fort-lauderdale', companyId: 'total-dental', order: 2, name: same('Total Dental Care · Fort Lauderdale') }
];

const billingRecords: BillingRecord[] = [
  {
    id: 'viv-2025-10-01-bite',
    companyId: 'vivadent',
    officeId: 'viv-west-hialeah',
    procedure: { en: 'Bite registration', es: 'Registro de mordida' },
    quantity: 2,
    amount: 40,
    date: '2025-10-01'
  },
  {
    id: 'viv-2025-10-03-try',
    companyId: 'vivadent',
    officeId: 'viv-west-hialeah',
    procedure: { en: 'Try-in', es: 'Prueba en boca' },
    quantity: 1,
    amount: 18,
    date: '2025-10-03'
  },
  {
    id: 'viv-2025-10-05-crown',
    companyId: 'vivadent',
    officeId: 'viv-west-hialeah',
    procedure: { en: 'Layered zirconia crown', es: 'Corona de zirconia estratificada' },
    quantity: 3,
    amount: 960,
    date: '2025-10-05'
  },
  {
    id: 'viv-2025-10-04-finish',
    companyId: 'vivadent',
    officeId: 'bisco-coral-gables',
    procedure: { en: 'Finishing and polish', es: 'Terminación y pulido' },
    quantity: 2,
    amount: 120,
    date: '2025-10-04'
  },
  {
    id: 'viv-2025-10-08-crown',
    companyId: 'vivadent',
    officeId: 'bisco-coral-gables',
    procedure: { en: 'Layered zirconia crown', es: 'Corona de zirconia estratificada' },
    quantity: 2,
    amount: 640,
    date: '2025-10-08'
  },
  {
    id: 'viv-2025-10-10-remake',
    companyId: 'vivadent',
    officeId: 'bisco-coral-gables',
    procedure: { en: 'Remake adjustment', es: 'Ajuste de rehacer' },
    quantity: 1,
    amount: 85,
    date: '2025-10-10'
  },
  {
    id: 'viv-2025-10-09-implant',
    companyId: 'vivadent',
    officeId: 'bisco-miller',
    procedure: { en: 'Implant custom abutment', es: 'Pilar personalizado para implante' },
    quantity: 1,
    amount: 280,
    date: '2025-10-09'
  },
  {
    id: 'viv-2025-10-11-wax',
    companyId: 'vivadent',
    officeId: 'bisco-miller',
    procedure: { en: 'Diagnostic wax-up', es: 'Encerado diagnóstico' },
    quantity: 1,
    amount: 150,
    date: '2025-10-11'
  },
  {
    id: 'viv-2025-09-25-guard',
    companyId: 'vivadent',
    officeId: 'viv-west-hialeah',
    procedure: { en: 'Night guard', es: 'Placa de descanso' },
    quantity: 1,
    amount: 110,
    date: '2025-09-25'
  },
  {
    id: 'viv-2025-10-16-bite',
    companyId: 'vivadent',
    officeId: 'viv-west-hialeah',
    procedure: { en: 'Bite registration', es: 'Registro de mordida' },
    quantity: 1,
    amount: 20,
    date: '2025-10-16'
  },
  {
    id: 'blanco-2025-10-02-aligner',
    companyId: 'blanco-janis',
    officeId: 'blanco-brickell',
    procedure: { en: 'Aligner set', es: 'Juego de alineadores' },
    quantity: 4,
    amount: 520,
    date: '2025-10-02'
  },
  {
    id: 'blanco-2025-10-07-partial',
    companyId: 'blanco-janis',
    officeId: 'blanco-sunrise',
    procedure: { en: 'Partial denture', es: 'Prótesis parcial' },
    quantity: 2,
    amount: 780,
    date: '2025-10-07'
  },
  {
    id: 'blanco-2025-10-12-repair',
    companyId: 'blanco-janis',
    officeId: 'blanco-sunrise',
    procedure: { en: 'Repair and polish', es: 'Reparación y pulido' },
    quantity: 1,
    amount: 95,
    date: '2025-10-12'
  },
  {
    id: 'complete-2025-10-04-implant',
    companyId: 'complete-dental',
    officeId: 'complete-orlando',
    procedure: { en: 'Implant ceramic crown', es: 'Corona cerámica sobre implante' },
    quantity: 2,
    amount: 890,
    date: '2025-10-04'
  },
  {
    id: 'complete-2025-10-09-aligner',
    companyId: 'complete-dental',
    officeId: 'complete-tampa',
    procedure: { en: 'Aligner refinement', es: 'Refinamiento de alineadores' },
    quantity: 3,
    amount: 360,
    date: '2025-10-09'
  },
  {
    id: 'complete-2025-10-14-bite',
    companyId: 'complete-dental',
    officeId: 'complete-orlando',
    procedure: { en: 'Bite registration', es: 'Registro de mordida' },
    quantity: 2,
    amount: 40,
    date: '2025-10-14'
  },
  {
    id: 'crosar-2025-10-05-3d',
    companyId: 'crosar-dental',
    officeId: 'crosar-south-miami',
    procedure: { en: '3D printed model', es: 'Modelo impreso 3D' },
    quantity: 5,
    amount: 250,
    date: '2025-10-05'
  },
  {
    id: 'crosar-2025-10-13-guard',
    companyId: 'crosar-dental',
    officeId: 'crosar-south-miami',
    procedure: { en: 'Night guard', es: 'Placa de descanso' },
    quantity: 2,
    amount: 220,
    date: '2025-10-13'
  },
  {
    id: 'doral-2025-10-06-crown',
    companyId: 'doral-isles',
    officeId: 'doral-isles-office',
    procedure: { en: 'Full contour crown', es: 'Corona de contorno completo' },
    quantity: 2,
    amount: 540,
    date: '2025-10-06'
  },
  {
    id: 'doral-2025-10-08-try',
    companyId: 'doral-isles',
    officeId: 'doral-isles-office',
    procedure: { en: 'Try-in', es: 'Prueba en boca' },
    quantity: 1,
    amount: 18,
    date: '2025-10-08'
  },
  {
    id: 'total-2025-10-03-partial',
    companyId: 'total-dental',
    officeId: 'total-hialeah',
    procedure: { en: 'Partial denture', es: 'Prótesis parcial' },
    quantity: 1,
    amount: 385,
    date: '2025-10-03'
  },
  {
    id: 'total-2025-10-11-implant',
    companyId: 'total-dental',
    officeId: 'total-fort-lauderdale',
    procedure: { en: 'Implant custom abutment', es: 'Pilar personalizado para implante' },
    quantity: 2,
    amount: 560,
    date: '2025-10-11'
  }
];

const parseISODate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const defaultFilters = {
  companyId: 'vivadent',
  startDate: '2025-10-01',
  endDate: '2025-10-14'
};


export default function LaboratoryBillingPage() {
  const router = useRouter();
  const { t, language } = useTranslations();
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const [selectedEntityId, setSelectedEntityId] = useState<string>('complete-dental-solutions');
  const [formStartDate, setFormStartDate] = useState<string>(defaultFilters.startDate);
  const [formEndDate, setFormEndDate] = useState<string>(defaultFilters.endDate);
  const [filters, setFilters] = useState({
    companyId: 'complete-dental-solutions',
    startDate: defaultFilters.startDate,
    endDate: defaultFilters.endDate
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch companies from GraphQL
  const { data: companiesData } = useQuery(GET_COMPANIES);

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

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium'
      }),
    [locale]
  );

  const localize = useCallback((field: LocalizedField) => field[language], [language]);

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  // Update filters when company selector changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      companyId: selectedEntityId
    }));
  }, [selectedEntityId]);

  const aggregated = useMemo<AggregatedData>(() => {
    const officeLookup = new Map<string, Office>();
    for (const office of offices) {
      if (office.companyId === filters.companyId) {
        officeLookup.set(office.id, office);
      }
    }

    const start = filters.startDate ? parseISODate(filters.startDate) : null;
    const end = filters.endDate ? parseISODate(filters.endDate) : null;

    const officeMap = new Map<
      string,
      {
        office: Office;
        totalQuantity: number;
        totalAmount: number;
        order: number;
        procedureMap: Map<string, AggregatedProcedure>;
      }
    >();

    let totalQuantity = 0;
    let totalAmount = 0;

    for (const record of billingRecords) {
      if (record.companyId !== filters.companyId) continue;
      const office = officeLookup.get(record.officeId);
      if (!office) continue;

      const recordDate = parseISODate(record.date);
      if (start && recordDate < start) continue;
      if (end && recordDate > end) continue;

      let officeEntry = officeMap.get(office.id);
      if (!officeEntry) {
        officeEntry = {
          office,
          totalQuantity: 0,
          totalAmount: 0,
          order: office.order,
          procedureMap: new Map()
        };
        officeMap.set(office.id, officeEntry);
      }

      const key = record.procedure.en;
      let procedureEntry = officeEntry.procedureMap.get(key);
      if (!procedureEntry) {
        procedureEntry = {
          key,
          procedure: record.procedure,
          quantity: 0,
          amount: 0
        };
        officeEntry.procedureMap.set(key, procedureEntry);
      }

      procedureEntry.quantity += record.quantity;
      procedureEntry.amount += record.amount;
      officeEntry.totalQuantity += record.quantity;
      officeEntry.totalAmount += record.amount;
      totalQuantity += record.quantity;
      totalAmount += record.amount;
    }

    const officesWithRecords = Array.from(officeMap.values())
      .sort((a, b) => a.order - b.order)
      .map<AggregatedOffice>((entry) => ({
        office: entry.office,
        totalQuantity: entry.totalQuantity,
        totalAmount: entry.totalAmount,
        procedures: Array.from(entry.procedureMap.values())
      }));

    const procedureCount = officesWithRecords.reduce((sum, office) => sum + office.procedures.length, 0);

    return {
      offices: officesWithRecords,
      totalQuantity,
      totalAmount,
      procedureCount,
      officeCount: officesWithRecords.length
    };
  }, [filters]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (formStartDate && formEndDate) {
      const startDate = parseISODate(formStartDate);
      const endDate = parseISODate(formEndDate);

      if (startDate > endDate) {
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
          showEntitySelector={true}
          entityLabel={t('Company')}
          selectedEntityId={selectedEntityId}
          onEntityChange={(id) => setSelectedEntityId(id)}
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
                <p className="mt-3 text-3xl font-semibold text-white">{aggregated.officeCount}</p>
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
                    {aggregated.offices.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                          {t('No billing records found for the selected period.')}
                        </td>
                      </tr>
                    ) : (
                      <>
                        {aggregated.offices.map((entry) => (
                          <Fragment key={entry.office.id}>
                            <tr>
                              <td
                                colSpan={4}
                                className="bg-white/[0.04] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-primary-200/80"
                              >
                                {localize(entry.office.name)}
                              </td>
                            </tr>
                            {entry.procedures.map((procedure) => (
                              <tr key={`${entry.office.id}-${procedure.key}`} className="text-sm text-slate-200">
                                <td className="px-6 py-4 font-medium text-white">{localize(procedure.procedure)}</td>
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
                              <td className="px-6 py-3">{t('Total by office')}</td>
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

