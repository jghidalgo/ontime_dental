'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';

type NavigationItem = {
  label: string;
  href: string;
};

type SubSectionId =
  | 'dashboard'
  | 'case-search'
  | 'reservations'
  | 'production-board'
  | 'transit-tracking'
  | 'remakes-quality'
  | 'billing';

type SubNavigationItem = {
  id: SubSectionId;
  label: string;
  description: string;
  planned?: boolean;
};

type HighlightMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  change: string;
  trend: 'positive' | 'negative' | 'neutral';
};

type CaseCategory = {
  id: string;
  label: string;
  cases: number;
  trend: 'up' | 'down' | 'steady';
};

type PipelineStage = {
  id: string;
  label: string;
  completion: number;
  status: 'on-track' | 'attention' | 'warning';
  detail: string;
};

type TransitRoute = {
  id: string;
  region: string;
  cases: number;
  clinics: number;
  departure: string;
  status: 'On time' | 'Delayed' | 'Departed';
};

type ClinicSnapshot = {
  id: string;
  clinic: string;
  dentist: string;
  cases: number;
  satisfaction: number;
  focus: string;
};

type QualityInsight = {
  id: string;
  label: string;
  value: string;
  delta: string;
  sentiment: 'positive' | 'negative' | 'neutral';
};

type CaseSearchRecord = {
  caseId: string;
  lab: string;
  clinic: string;
  patientFirstName: string;
  patientLastName: string;
  birthday: string;
  reservationDate: string;
  doctor: string;
  procedure: string;
  status: 'En producción' | 'En tránsito' | 'Completado' | 'En planificación';
};

const navigationItems: NavigationItem[] = [
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

const laboratorySubNavigation: SubNavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Production health, KPIs and live operations overview.'
  },
  {
    id: 'case-search',
    label: 'Case Search',
    description: 'Lookup cases across labs, clinics and statuses.'
  },
  {
    id: 'reservations',
    label: 'Reservations',
    description: 'Agenda operativa de casos por procedimiento y día.'
  },
  {
    id: 'production-board',
    label: 'Production Board',
    description: 'Work-in-progress by stage and technician workload.',
    planned: true
  },
  {
    id: 'transit-tracking',
    label: 'Transit Tracking',
    description: 'Routes to clinics, courier SLAs and delivery ETAs.',
    planned: true
  },
  {
    id: 'remakes-quality',
    label: 'Remakes & Quality',
    description: 'Root causes, remake approvals and satisfaction trends.',
    planned: true
  },
  {
    id: 'billing',
    label: 'Billing',
    description: 'Statements, adjustments and COD tracking.',
    planned: true
  }
];

const highlightMetrics: HighlightMetric[] = [
  {
    id: 'total-cases',
    label: 'Cases this month',
    value: '428',
    helper: 'Goal 400 · Period through Sept 18',
    change: '+12.5% vs last month',
    trend: 'positive'
  },
  {
    id: 'in-transit',
    label: 'In transit to clinics',
    value: '38',
    helper: 'Across 12 clinics · Avg transit 1.8 days',
    change: '-4 vs last week',
    trend: 'positive'
  },
  {
    id: 'rush-cases',
    label: 'Rush / priority cases',
    value: '24',
    helper: '8 due today · 3 digital impressions pending',
    change: '+5 in last 24 hours',
    trend: 'negative'
  },
  {
    id: 'remake-ratio',
    label: 'Remake ratio',
    value: '2.4%',
    helper: 'Target 3.0% · 10 remakes closed this month',
    change: '-0.6 pts vs target',
    trend: 'positive'
  }
];

const caseCategories: CaseCategory[] = [
  { id: 'crowns', label: 'Crowns & Bridges', cases: 168, trend: 'up' },
  { id: 'implants', label: 'Implant Restorations', cases: 92, trend: 'up' },
  { id: 'tryins', label: 'Try-in / Wax Setups', cases: 74, trend: 'down' },
  { id: 'aligners', label: 'Aligners & Ortho', cases: 54, trend: 'steady' },
  { id: 'repairs', label: 'Repairs & Adjustments', cases: 40, trend: 'steady' }
];

const pipelineStages: PipelineStage[] = [
  {
    id: 'design',
    label: 'CAD Design',
    completion: 86,
    status: 'on-track',
    detail: 'Digital team processed 57 scans overnight.'
  },
  {
    id: 'milling',
    label: 'Milling / Printing',
    completion: 72,
    status: 'attention',
    detail: 'Zirconia mill 2 scheduled downtime at 4:30 PM.'
  },
  {
    id: 'finishing',
    label: 'Finishing & QC',
    completion: 64,
    status: 'warning',
    detail: '3 remakes waiting for shade confirmation.'
  },
  {
    id: 'packing',
    label: 'Packing & Dispatch',
    completion: 58,
    status: 'on-track',
    detail: 'Route D consolidated · Courier pickup at 5:15 PM.'
  }
];

const transitRoutes: TransitRoute[] = [
  { id: 'route-a', region: 'Miami Metro', cases: 14, clinics: 6, departure: '2:30 PM', status: 'On time' },
  { id: 'route-b', region: 'Broward Coastal', cases: 9, clinics: 4, departure: '3:15 PM', status: 'Departed' },
  { id: 'route-c', region: 'Orlando Corridor', cases: 8, clinics: 3, departure: '4:05 PM', status: 'On time' },
  { id: 'route-d', region: 'Tampa Bay', cases: 7, clinics: 3, departure: '5:20 PM', status: 'Delayed' }
];

const clinicSnapshots: ClinicSnapshot[] = [
  {
    id: 'clinic-1',
    clinic: 'Miller Dental - Coral Gables',
    dentist: 'Dr. Alexis Stone',
    cases: 28,
    satisfaction: 97,
    focus: 'Prefers layered zirconia · digital-only'
  },
  {
    id: 'clinic-2',
    clinic: 'Bayfront Smiles',
    dentist: 'Dr. Maya Jensen',
    cases: 22,
    satisfaction: 94,
    focus: 'Increase aligner slots · loves scan feedback loops'
  },
  {
    id: 'clinic-3',
    clinic: 'Sunset Orthodontics',
    dentist: 'Dr. Luis Carmona',
    cases: 18,
    satisfaction: 91,
    focus: 'Requests expedited thermoform production on Mondays'
  }
];

const qualityInsights: QualityInsight[] = [
  {
    id: 'ontime-rate',
    label: 'On-time delivery',
    value: '96.4%',
    delta: '+1.2 pts vs SLA',
    sentiment: 'positive'
  },
  {
    id: 'turnaround',
    label: 'Average turnaround',
    value: '6.3 days',
    delta: '-0.8 days vs last month',
    sentiment: 'positive'
  },
  {
    id: 'digital-adoption',
    label: 'Digital impressions',
    value: '72%',
    delta: '+9 scans submitted this week',
    sentiment: 'neutral'
  }
];

const caseSearchRecords: CaseSearchRecord[] = [
  {
    caseId: 'LAB-10234',
    lab: 'Miami Central Lab',
    clinic: 'Miller Dental - Coral Gables',
    patientFirstName: 'Lucía',
    patientLastName: 'Ramírez',
    birthday: '14/02/1986',
    reservationDate: '18/09/2023',
    doctor: 'Dr. Alexis Stone',
    procedure: 'Corona zirconia #14',
    status: 'En producción'
  },
  {
    caseId: 'LAB-10287',
    lab: 'Miami Central Lab',
    clinic: 'Bayfront Smiles',
    patientFirstName: 'Mateo',
    patientLastName: 'Salazar',
    birthday: '22/11/1992',
    reservationDate: '16/09/2023',
    doctor: 'Dr. Maya Jensen',
    procedure: 'Implante unitario #30',
    status: 'En tránsito'
  },
  {
    caseId: 'LAB-10302',
    lab: 'Orlando Digital Lab',
    clinic: 'Sunset Orthodontics',
    patientFirstName: 'Valeria',
    patientLastName: 'González',
    birthday: '05/05/2001',
    reservationDate: '15/09/2023',
    doctor: 'Dr. Luis Carmona',
    procedure: 'Alineador serie 3',
    status: 'En producción'
  },
  {
    caseId: 'LAB-10345',
    lab: 'Tampa Ceramics',
    clinic: 'Coral Ridge Family Dental',
    patientFirstName: 'Andrés',
    patientLastName: 'Patiño',
    birthday: '19/07/1978',
    reservationDate: '12/09/2023',
    doctor: 'Dra. Olivia Reyes',
    procedure: 'Prótesis parcial superior',
    status: 'Completado'
  },
  {
    caseId: 'LAB-10367',
    lab: 'Miami Central Lab',
    clinic: 'Harbor Point Dental',
    patientFirstName: 'Camila',
    patientLastName: 'Torres',
    birthday: '30/09/1989',
    reservationDate: '19/09/2023',
    doctor: 'Dr. Ethan Wells',
    procedure: 'Carillas feldespáticas #7-10',
    status: 'En planificación'
  },
  {
    caseId: 'LAB-10392',
    lab: 'Orlando Digital Lab',
    clinic: 'Lakeview Dental Studio',
    patientFirstName: 'Sofía',
    patientLastName: 'Martel',
    birthday: '11/03/1983',
    reservationDate: '13/09/2023',
    doctor: 'Dr. Daniel Ortiz',
    procedure: 'Puente 3 unidades',
    status: 'En tránsito'
  },
  {
    caseId: 'LAB-10410',
    lab: 'Tampa Ceramics',
    clinic: 'Biscayne Smiles',
    patientFirstName: 'Héctor',
    patientLastName: 'Navarro',
    birthday: '02/01/1971',
    reservationDate: '17/09/2023',
    doctor: 'Dra. Isabel Vega',
    procedure: 'Corona de óxido de zirconio',
    status: 'En producción'
  },
  {
    caseId: 'LAB-10428',
    lab: 'Fort Lauderdale Lab',
    clinic: 'Key Biscayne Dental',
    patientFirstName: 'María',
    patientLastName: 'Suárez',
    birthday: '26/12/1995',
    reservationDate: '10/09/2023',
    doctor: 'Dr. Javier Molina',
    procedure: 'Corona temporal CAD/CAM',
    status: 'Completado'
  }
];

export default function LaboratoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [activeSection, setActiveSection] = useState<SubSectionId>('dashboard');
  const [searchForm, setSearchForm] = useState({
    caseId: '',
    lab: '',
    clinic: '',
    patientFirstName: '',
    patientLastName: '',
    doctor: '',
    procedure: '',
    status: ''
  });
  const [searchResults, setSearchResults] = useState<CaseSearchRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('Debe realizar una búsqueda.');

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  const totalCases = useMemo(
    () => caseCategories.reduce((sum, category) => sum + category.cases, 0),
    []
  );

  const transitCases = useMemo(
    () => transitRoutes.reduce((sum, route) => sum + route.cases, 0),
    []
  );

  const availableLabs = useMemo(
    () => Array.from(new Set(caseSearchRecords.map((record) => record.lab))).sort(),
    []
  );

  const availableClinics = useMemo(
    () => Array.from(new Set(caseSearchRecords.map((record) => record.clinic))).sort(),
    []
  );

  const availableStatuses = useMemo(
    () => Array.from(new Set(caseSearchRecords.map((record) => record.status))),
    []
  );

  const updateResults = (records: CaseSearchRecord[], emptyMessage?: string) => {
    setSearchResults(records);
    setHasSearched(true);
    setSearchFeedback(
      records.length > 0
        ? `Se encontraron ${records.length} caso${records.length === 1 ? '' : 's'}.`
        : emptyMessage ?? 'No se encontraron casos con los criterios seleccionados.'
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const results = caseSearchRecords.filter((record) => {
      if (searchForm.caseId && !record.caseId.toLowerCase().includes(searchForm.caseId.toLowerCase())) {
        return false;
      }

      if (searchForm.lab && record.lab !== searchForm.lab) {
        return false;
      }

      if (searchForm.clinic && record.clinic !== searchForm.clinic) {
        return false;
      }

      if (
        searchForm.patientFirstName &&
        !record.patientFirstName.toLowerCase().includes(searchForm.patientFirstName.toLowerCase())
      ) {
        return false;
      }

      if (
        searchForm.patientLastName &&
        !record.patientLastName.toLowerCase().includes(searchForm.patientLastName.toLowerCase())
      ) {
        return false;
      }

      if (searchForm.doctor && !record.doctor.toLowerCase().includes(searchForm.doctor.toLowerCase())) {
        return false;
      }

      if (searchForm.procedure && !record.procedure.toLowerCase().includes(searchForm.procedure.toLowerCase())) {
        return false;
      }

      if (searchForm.status && record.status !== searchForm.status) {
        return false;
      }

      return true;
    });

    updateResults(results);
  };

  const handleNameSearch = () => {
    const first = searchForm.patientFirstName.trim().toLowerCase();
    const last = searchForm.patientLastName.trim().toLowerCase();

    if (!first && !last) {
      updateResults([], 'Ingresa al menos un nombre o apellido para buscar.');
      return;
    }

    const results = caseSearchRecords.filter((record) => {
      const matchesFirst = first ? record.patientFirstName.toLowerCase().includes(first) : true;
      const matchesLast = last ? record.patientLastName.toLowerCase().includes(last) : true;

      return matchesFirst && matchesLast;
    });

    updateResults(results);
  };

  const handleInputChange = (field: keyof typeof searchForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setSearchForm((prev) => ({
        ...prev,
        [field]: value
      }));
    };

  const trendBadgeClass = (trend: HighlightMetric['trend']) => {
    switch (trend) {
      case 'positive':
        return 'text-emerald-400';
      case 'negative':
        return 'text-rose-400';
      default:
        return 'text-slate-400';
    }
  };

  const qualitySentimentClass = (sentiment: QualityInsight['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30';
      case 'negative':
        return 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30';
      default:
        return 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-400/30';
    }
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
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition',
                    pathname === item.href
                      ? 'bg-primary-500/15 text-primary-100 ring-1 ring-primary-400/30'
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                  )}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto space-y-1 text-sm text-slate-400">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Signed in as</p>
            <p className="font-medium text-slate-200">{userName || 'Loading...'}</p>
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem('ontime.authToken');
                router.push('/login');
              }}
              className="text-left text-xs font-medium text-slate-500 transition hover:text-primary-200"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <header className="flex flex-col gap-4 border-b border-white/5 pb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-primary-200/70">Laboratory</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">Operations Command Center</h1>
                </div>
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-right text-xs text-primary-100">
                  <p className="font-semibold uppercase tracking-[0.35em]">Today</p>
                  <p className="mt-1 text-sm font-medium text-primary-50">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}
                  </p>
                  <p className="text-[11px] text-primary-200/70">Dispatch window 2:00 PM - 6:00 PM</p>
                </div>
              </div>
              <p className="max-w-3xl text-sm text-slate-400">
                Monitor the production floor, shipping timelines and clinic satisfaction at a glance. The dashboard surfaces key
                actions for the fabrication team and keeps leadership aligned with today&apos;s volume.
              </p>
            </header>

            <section className="mt-10">
              <div className="flex flex-wrap gap-3">
                {laboratorySubNavigation.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => {
                      if (section.planned) return;
                      if (section.id === 'reservations') {
                        router.push('/laboratory/reservations');
                        return;
                      }
                      setActiveSection(section.id);
                    }}
                    className={clsx(
                      'group flex min-w-[14rem] flex-1 items-start gap-3 rounded-2xl border px-4 py-4 text-left transition sm:min-w-[15rem] md:max-w-[18rem]',
                      section.id === activeSection
                        ? 'border-primary-400/60 bg-primary-500/15 text-primary-100'
                        : 'border-white/10 bg-white/[0.02] text-slate-200 hover:border-primary-400/40 hover:bg-primary-500/10 hover:text-primary-50',
                      section.planned && 'cursor-not-allowed opacity-60'
                    )}
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary-400/80" />
                    <div>
                      <p className="text-sm font-semibold">{section.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{section.description}</p>
                      {section.planned && (
                        <span className="mt-3 inline-flex rounded-full border border-dashed border-primary-400/40 bg-primary-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-200/80">
                          Planned
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-12">
              {activeSection === 'dashboard' ? (
                <div className="space-y-10">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {highlightMetrics.map((metric) => (
                      <div
                        key={metric.id}
                        className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 shadow-lg shadow-black/10 backdrop-blur"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{metric.label}</p>
                        <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
                        <p className="mt-2 text-xs text-slate-400">{metric.helper}</p>
                        <p className={clsx('mt-4 text-sm font-medium', trendBadgeClass(metric.trend))}>{metric.change}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-white">Case mix by category</h2>
                          <p className="text-sm text-slate-400">{totalCases} active cases · includes remakes</p>
                        </div>
                        <span className="rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
                          Updated 15 min ago
                        </span>
                      </div>

                      <div className="mt-6 space-y-4">
                        {caseCategories.map((category) => {
                          const percentage = Math.round((category.cases / totalCases) * 100);
                          return (
                            <div key={category.id} className="space-y-2">
                              <div className="flex items-center justify-between text-sm text-slate-300">
                                <p className="font-medium text-white">{category.label}</p>
                                <span className="text-xs text-slate-400">{category.cases} cases · {percentage}%</span>
                              </div>
                              <div className="relative h-3 overflow-hidden rounded-full border border-white/10 bg-slate-900/60">
                                <div
                                  className={clsx(
                                    'h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300 transition-all',
                                    category.trend === 'up' && 'shadow-[0_0_20px_rgba(56,189,248,0.35)]',
                                    category.trend === 'down' && 'from-rose-500 via-rose-400 to-amber-300'
                                  )}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-500">
                                Trend:{' '}
                                {category.trend === 'up'
                                  ? 'Rising demand'
                                  : category.trend === 'down'
                                  ? 'Slight dip · review scheduling'
                                  : 'Holding steady'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Transit overview</h2>
                        <span className="text-xs text-slate-400">{transitCases} cases in motion</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Courier board synced at 1:10 PM · Next scan in 20 minutes.</p>

                      <div className="mt-5 space-y-4">
                        {transitRoutes.map((route) => (
                          <div
                            key={route.id}
                            className="rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3 text-sm text-slate-200"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-white">{route.region}</p>
                              <span
                                className={clsx(
                                  'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                                  route.status === 'Delayed'
                                    ? 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30'
                                    : route.status === 'Departed'
                                    ? 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30'
                                    : 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30'
                                )}
                              >
                                {route.status}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                              <p>
                                {route.cases} cases · {route.clinics} clinics
                              </p>
                              <p>Departure {route.departure}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Production pipeline</h2>
                        <span className="text-xs text-slate-400">Live work-in-progress load</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Technician schedule locked · auto-refresh every 5 minutes.</p>

                      <div className="mt-6 space-y-4">
                        {pipelineStages.map((stage) => (
                          <div key={stage.id} className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">{stage.label}</p>
                              <span className="text-sm font-semibold text-primary-100">{stage.completion}%</span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={clsx(
                                  'h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-200',
                                  stage.status === 'attention' && 'from-amber-400 via-amber-300 to-amber-200',
                                  stage.status === 'warning' && 'from-rose-500 via-rose-400 to-amber-300'
                                )}
                                style={{ width: `${stage.completion}%` }}
                              />
                            </div>
                            <p className="mt-3 text-xs text-slate-400">{stage.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
                        <h2 className="text-lg font-semibold text-white">Clinic sentiment</h2>
                        <p className="mt-1 text-xs text-slate-500">Weekly NPS survey pulse across partner clinics.</p>

                        <div className="mt-5 space-y-4">
                          {clinicSnapshots.map((clinic) => (
                            <div key={clinic.id} className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-white">{clinic.clinic}</p>
                                  <p className="text-xs text-slate-400">{clinic.dentist}</p>
                                </div>
                                <span className="text-sm font-semibold text-primary-100">{clinic.satisfaction}%</span>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                                <p>{clinic.cases} active cases</p>
                                <p className="text-right">{clinic.focus}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
                        <h2 className="text-lg font-semibold text-white">Quality & SLAs</h2>
                        <p className="mt-1 text-xs text-slate-500">Monitor commitments before tomorrow&apos;s huddle.</p>

                        <div className="mt-5 space-y-3">
                          {qualityInsights.map((insight) => (
                            <div
                              key={insight.id}
                              className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-900/60 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-white">{insight.label}</p>
                                <p className="text-xs text-slate-400">{insight.delta}</p>
                              </div>
                              <span
                                className={clsx(
                                  'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                  qualitySentimentClass(insight.sentiment)
                                )}
                              >
                                {insight.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeSection === 'case-search' ? (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 shadow-lg shadow-black/20 backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.45em] text-primary-200/70">Laboratory Lookup</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Buscar casos en los laboratorios</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                          Filtra por laboratorio, clínica, odontólogo o procedimiento para localizar un expediente activo. Los datos a continuación son de prueba para validar el flujo de trabajo.
                        </p>
                      </div>
                      <span
                        className={clsx(
                          'inline-flex rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-wide',
                          hasSearched && searchResults.length > 0
                            ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                            : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                        )}
                      >
                        {searchFeedback}
                      </span>
                    </div>

                    <form onSubmit={handleSearch} className="mt-8 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Case ID</span>
                          <input
                            type="text"
                            value={searchForm.caseId}
                            onChange={handleInputChange('caseId')}
                            placeholder="LAB-10XXX"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Laboratorio</span>
                          <select
                            value={searchForm.lab}
                            onChange={handleInputChange('lab')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">Todos</option>
                            {availableLabs.map((lab) => (
                              <option key={lab} value={lab}>
                                {lab}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Clínica</span>
                          <select
                            value={searchForm.clinic}
                            onChange={handleInputChange('clinic')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">Todas</option>
                            {availableClinics.map((clinic) => (
                              <option key={clinic} value={clinic}>
                                {clinic}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Estado</span>
                          <select
                            value={searchForm.status}
                            onChange={handleInputChange('status')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">Cualquiera</option>
                            {availableStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Nombre del paciente</span>
                          <input
                            type="text"
                            value={searchForm.patientFirstName}
                            onChange={handleInputChange('patientFirstName')}
                            placeholder="Nombre"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Apellido del paciente</span>
                          <input
                            type="text"
                            value={searchForm.patientLastName}
                            onChange={handleInputChange('patientLastName')}
                            placeholder="Apellido"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Odontólogo</span>
                          <input
                            type="text"
                            value={searchForm.doctor}
                            onChange={handleInputChange('doctor')}
                            placeholder="Dr. o Dra."
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Procedimiento</span>
                          <input
                            type="text"
                            value={searchForm.procedure}
                            onChange={handleInputChange('procedure')}
                            placeholder="Tipo de trabajo"
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                        >
                          Buscar
                        </button>
                        <button
                          type="button"
                          onClick={handleNameSearch}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary-400/50 bg-transparent px-4 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-300 hover:text-primary-50"
                        >
                          Buscar por nombre
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-lg shadow-black/10 backdrop-blur">
                    {hasSearched ? (
                      searchResults.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-white/5">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-[0.35em] text-slate-400">
                                <th className="px-6 py-4">Case ID</th>
                                <th className="px-6 py-4">Laboratorio</th>
                                <th className="px-6 py-4">Clínica</th>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Nacimiento</th>
                                <th className="px-6 py-4">Reserva</th>
                                <th className="px-6 py-4">Doctor</th>
                                <th className="px-6 py-4">Procedimiento</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-center">Acción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                              {searchResults.map((record) => (
                                <tr key={record.caseId} className="hover:bg-white/5">
                                  <td className="px-6 py-4 font-semibold text-white">{record.caseId}</td>
                                  <td className="px-6 py-4">{record.lab}</td>
                                  <td className="px-6 py-4">{record.clinic}</td>
                                  <td className="px-6 py-4">
                                    {record.patientFirstName} {record.patientLastName}
                                  </td>
                                  <td className="px-6 py-4 text-slate-400">{record.birthday}</td>
                                  <td className="px-6 py-4 text-slate-400">{record.reservationDate}</td>
                                  <td className="px-6 py-4">{record.doctor}</td>
                                  <td className="px-6 py-4">{record.procedure}</td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={clsx(
                                        'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                        record.status === 'Completado'
                                          ? 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/40'
                                          : record.status === 'En tránsito'
                                          ? 'bg-sky-500/10 text-sky-200 ring-1 ring-sky-400/40'
                                          : record.status === 'En planificación'
                                          ? 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/40'
                                          : 'bg-primary-500/10 text-primary-100 ring-1 ring-primary-400/40'
                                      )}
                                    >
                                      {record.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      type="button"
                                      className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/40 hover:text-primary-50"
                                    >
                                      Ver detalle
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="px-8 py-16 text-center text-sm text-slate-400">
                          {searchFeedback}
                        </div>
                      )
                    ) : (
                      <div className="px-8 py-16 text-center text-sm text-slate-400">
                        {'Selecciona un criterio y presiona "Buscar" para visualizar resultados.'}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
                  <h2 className="text-2xl font-semibold text-white">
                    {laboratorySubNavigation.find((section) => section.id === activeSection)?.label ?? 'Coming soon'}
                  </h2>
                  <p className="mt-3 text-sm">
                    This workspace is on our roadmap. Let the product team know what workflows you&apos;d like to streamline here.
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-[0.4em] text-primary-200/70">Module in discovery</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

