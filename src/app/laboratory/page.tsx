'use client';

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { Language, useTranslations } from '@/lib/i18n';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LAB_CASES, GET_LABORATORIES } from '@/graphql/lab-queries';
import { CREATE_LAB_CASE } from '@/graphql/lab-mutations';
import { GET_CLINIC_LOCATIONS } from '@/graphql/queries';
import { GET_USERS } from '@/graphql/user-queries';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';

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

type CaseStatus = 'in-production' | 'in-transit' | 'completed' | 'in-planning';

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
  status: CaseStatus;
  qrCode?: string;
  qrCodeData?: string;
};

type LocalizedField = Record<Language, string>;

type LocalizedCaseSearchRecord = {
  caseId: string;
  lab: LocalizedField;
  clinic: LocalizedField;
  patientFirstName: LocalizedField;
  patientLastName: LocalizedField;
  birthday: string;
  reservationDate: string;
  doctor: LocalizedField;
  procedure: LocalizedField;
  status: CaseStatus;
};

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
    description: 'Statements, adjustments and COD tracking.'
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

const same = (value: string): LocalizedField => ({ en: value, es: value });

const caseSearchRecordData: LocalizedCaseSearchRecord[] = [
  {
    caseId: 'LAB-10234',
    lab: same('Miami Central Lab'),
    clinic: same('Miller Dental - Coral Gables'),
    patientFirstName: same('Lucía'),
    patientLastName: same('Ramírez'),
    birthday: '14/02/1986',
    reservationDate: '18/09/2023',
    doctor: same('Dr. Alexis Stone'),
    procedure: {
      en: 'Zirconia crown #14',
      es: 'Corona zirconia #14'
    },
    status: 'in-production'
  },
  {
    caseId: 'LAB-10287',
    lab: same('Miami Central Lab'),
    clinic: same('Bayfront Smiles'),
    patientFirstName: same('Mateo'),
    patientLastName: same('Salazar'),
    birthday: '22/11/1992',
    reservationDate: '16/09/2023',
    doctor: same('Dr. Maya Jensen'),
    procedure: {
      en: 'Single implant #30',
      es: 'Implante unitario #30'
    },
    status: 'in-transit'
  },
  {
    caseId: 'LAB-10302',
    lab: same('Orlando Digital Lab'),
    clinic: same('Sunset Orthodontics'),
    patientFirstName: same('Valeria'),
    patientLastName: same('González'),
    birthday: '05/05/2001',
    reservationDate: '15/09/2023',
    doctor: same('Dr. Luis Carmona'),
    procedure: {
      en: 'Aligner series 3',
      es: 'Alineador serie 3'
    },
    status: 'in-production'
  },
  {
    caseId: 'LAB-10345',
    lab: same('Tampa Ceramics'),
    clinic: same('Coral Ridge Family Dental'),
    patientFirstName: same('Andrés'),
    patientLastName: same('Patiño'),
    birthday: '19/07/1978',
    reservationDate: '12/09/2023',
    doctor: {
      en: 'Dr. Olivia Reyes',
      es: 'Dra. Olivia Reyes'
    },
    procedure: {
      en: 'Upper partial denture',
      es: 'Prótesis parcial superior'
    },
    status: 'completed'
  },
  {
    caseId: 'LAB-10367',
    lab: same('Miami Central Lab'),
    clinic: same('Harbor Point Dental'),
    patientFirstName: same('Camila'),
    patientLastName: same('Torres'),
    birthday: '30/09/1989',
    reservationDate: '19/09/2023',
    doctor: same('Dr. Ethan Wells'),
    procedure: {
      en: 'Feldspathic veneers #7-10',
      es: 'Carillas feldespáticas #7-10'
    },
    status: 'in-planning'
  },
  {
    caseId: 'LAB-10392',
    lab: same('Orlando Digital Lab'),
    clinic: same('Lakeview Dental Studio'),
    patientFirstName: same('Sofía'),
    patientLastName: same('Martel'),
    birthday: '11/03/1983',
    reservationDate: '13/09/2023',
    doctor: same('Dr. Daniel Ortiz'),
    procedure: {
      en: '3-unit bridge',
      es: 'Puente 3 unidades'
    },
    status: 'in-transit'
  },
  {
    caseId: 'LAB-10410',
    lab: same('Tampa Ceramics'),
    clinic: same('Biscayne Smiles'),
    patientFirstName: same('Héctor'),
    patientLastName: same('Navarro'),
    birthday: '02/01/1971',
    reservationDate: '17/09/2023',
    doctor: {
      en: 'Dr. Isabel Vega',
      es: 'Dra. Isabel Vega'
    },
    procedure: {
      en: 'Zirconia oxide crown',
      es: 'Corona de óxido de zirconio'
    },
    status: 'in-production'
  },
  {
    caseId: 'LAB-10428',
    lab: same('Fort Lauderdale Lab'),
    clinic: same('Key Biscayne Dental'),
    patientFirstName: same('María'),
    patientLastName: same('Suárez'),
    birthday: '26/12/1995',
    reservationDate: '10/09/2023',
    doctor: same('Dr. Javier Molina'),
    procedure: {
      en: 'CAD/CAM temporary crown',
      es: 'Corona temporal CAD/CAM'
    },
    status: 'completed'
  }
];

const localizeCaseSearchRecords = (language: Language): CaseSearchRecord[] =>
  caseSearchRecordData.map((record) => ({
    caseId: record.caseId,
    lab: record.lab[language],
    clinic: record.clinic[language],
    patientFirstName: record.patientFirstName[language],
    patientLastName: record.patientLastName[language],
    birthday: record.birthday,
    reservationDate: record.reservationDate,
    doctor: record.doctor[language],
    procedure: record.procedure[language],
    status: record.status
  }));

const caseSearchRecordsByLanguage: Record<Language, CaseSearchRecord[]> = {
  en: localizeCaseSearchRecords('en'),
  es: localizeCaseSearchRecords('es')
};

const statusOrder: CaseStatus[] = ['in-production', 'in-transit', 'completed', 'in-planning'];

type CaseSearchForm = {
  caseId: string;
  lab: string;
  clinic: string;
  patientFirstName: string;
  patientLastName: string;
  doctor: string;
  procedure: string;
  status: CaseStatus | '';
};

export default function LaboratoryPage() {
  const router = useRouter();
  const { t, language } = useTranslations();
  const [selectedEntityId, setSelectedEntityId] = useState<string>('complete-dental-solutions');
  const [userName, setUserName] = useState<string>('');
  const [activeSection, setActiveSection] = useState<SubSectionId>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchForm, setSearchForm] = useState<CaseSearchForm>({
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
  const [searchFeedback, setSearchFeedback] = useState(() => t('Please perform a search.'));
  const [lastEmptyMessageKey, setLastEmptyMessageKey] = useState<string | undefined>(undefined);
  const [selectedCase, setSelectedCase] = useState<CaseSearchRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  console.log('=== SELECTED ENTITY ID ===', selectedEntityId);

  const { data: labCasesData, loading: loadingCases, refetch: refetchCases } = useQuery(GET_LAB_CASES, {
    variables: { companyId: selectedEntityId },
  });
  
  console.log('Lab cases loading:', loadingCases, 'data:', labCasesData);
  
  const { data: laboratoriesData, loading: loadingLabs } = useQuery(GET_LABORATORIES);
  
  console.log('Laboratories loading:', loadingLabs, 'data:', laboratoriesData);
  
  const { data: clinicsData, loading: loadingClinics } = useQuery(GET_CLINIC_LOCATIONS, {
    variables: { companyId: undefined }, // Temporarily fetch all clinics to debug
    onCompleted: (data) => {
      console.log('GET_CLINIC_LOCATIONS query completed:', data);
    },
    onError: (error) => {
      console.error('GET_CLINIC_LOCATIONS query error:', error);
    }
  });
  
  const { data: usersData, loading: loadingUsers } = useQuery(GET_USERS, {
    variables: { companyId: selectedEntityId },
  });
  
  const [createLabCase] = useMutation(CREATE_LAB_CASE, {
    onCompleted: () => {
      refetchCases();
      setShowCreateModal(false);
    },
  });

  // Transform lab cases from GraphQL to search format
  const caseSearchRecords = useMemo(() => {
    if (!labCasesData?.labCases) {
      console.log('No lab cases data:', labCasesData);
      return [];
    }
    console.log('Lab cases data:', labCasesData.labCases);
    
    return labCasesData.labCases.map((labCase: any) => ({
      caseId: labCase.caseId,
      lab: labCase.lab,
      clinic: labCase.clinic,
      patientFirstName: labCase.patientFirstName,
      patientLastName: labCase.patientLastName,
      birthday: new Date(labCase.birthday).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      reservationDate: new Date(labCase.reservationDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      doctor: labCase.doctor,
      procedure: labCase.procedure,
      status: labCase.status as CaseStatus,
      qrCode: labCase.qrCode,
      qrCodeData: labCase.qrCodeData
    }));
  }, [labCasesData]);

  // Fallback to mock data if no real data is available
  const caseSearchRecordsFallback = useMemo(
    () => caseSearchRecordsByLanguage[language],
    [language]
  );

  const activeCaseRecords = caseSearchRecords.length > 0 ? caseSearchRecords : caseSearchRecordsFallback;

  useEffect(() => {
    console.log('Active case records:', activeCaseRecords);
  }, [activeCaseRecords]);

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

  // Get laboratories from database
  const availableLabs = useMemo(() => {
    if (!laboratoriesData?.laboratories) return [];
    return laboratoriesData.laboratories
      .map((lab: any) => lab.name)
      .sort((a: string, b: string) => a.localeCompare(b));
  }, [laboratoriesData]);

  // Get clinics from database
  const availableClinics = useMemo(() => {
    console.log('=== CLINIC SELECTOR DEBUG ===');
    console.log('Raw clinicsData:', clinicsData);
    
    if (!clinicsData) {
      console.log('clinicsData is undefined or null');
      return [];
    }
    
    if (!clinicsData.clinicLocations) {
      console.log('clinicLocations property is missing');
      return [];
    }
    
    console.log('Number of clinic locations:', clinicsData.clinicLocations.length);
    console.log('Clinic locations data:', JSON.stringify(clinicsData.clinicLocations, null, 2));
    
    const allClinics: string[] = [];
    
    for (const location of clinicsData.clinicLocations) {
      console.log('Processing location:', location);
      
      if (!location.clinics || !Array.isArray(location.clinics)) {
        console.log('Location has no clinics array:', location);
        continue;
      }
      
      console.log('Location has', location.clinics.length, 'clinics');
      
      for (const clinic of location.clinics) {
        console.log('Processing clinic:', clinic);
        if (clinic && clinic.name) {
          allClinics.push(clinic.name);
          console.log('Added clinic:', clinic.name);
        } else {
          console.log('Clinic has no name:', clinic);
        }
      }
    }
    
    console.log('Final available clinics:', allClinics);
    return allClinics.sort((a, b) => a.localeCompare(b));
  }, [clinicsData]);

  // Get doctors from database (users with position="Dentist")
  const availableDoctors = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users
      .filter((user: any) => user.position === 'Dentist')
      .map((user: any) => user.name)
      .sort((a: string, b: string) => a.localeCompare(b));
  }, [usersData]);

  const availableStatuses = useMemo(
    () => statusOrder.filter((status) => activeCaseRecords.some((record) => record.status === status)),
    [activeCaseRecords]
  );

  const caseStatusLabels: Record<CaseStatus, string> = {
    'in-production': 'In production',
    'in-transit': 'In transit',
    completed: 'Completed',
    'in-planning': 'In planning'
  };

  const formatFeedback = useCallback(
    (count: number, emptyMessageKey?: string) => {
      if (count > 0) {
        return count === 1
          ? t('One case found.')
          : t('{count} cases found.', { count });
      }

      if (emptyMessageKey) {
        return t(emptyMessageKey);
      }

      return t('No cases were found with the selected criteria.');
    },
    [t]
  );

  const updateResults = (records: CaseSearchRecord[], emptyMessageKey?: string) => {
    setSearchResults(records);
    setHasSearched(true);
    setLastEmptyMessageKey(emptyMessageKey);
    setSearchFeedback(formatFeedback(records.length, emptyMessageKey));
  };

  useEffect(() => {
    if (!hasSearched) {
      setSearchFeedback(t('Please perform a search.'));
      return;
    }

    setSearchFeedback(formatFeedback(searchResults.length, lastEmptyMessageKey));
  }, [formatFeedback, hasSearched, lastEmptyMessageKey, searchResults.length, t]);

  const matchesSearchCriteria = (record: any) => {
    console.log('Checking record:', record);
    
    if (searchForm.caseId && record.caseId && !record.caseId.toLowerCase().includes(searchForm.caseId.toLowerCase())) {
      console.log('Failed on caseId:', searchForm.caseId, 'vs', record.caseId);
      return false;
    }

    if (searchForm.lab && searchForm.lab.trim() !== '' && record.lab && !record.lab.toLowerCase().includes(searchForm.lab.toLowerCase())) {
      console.log('Failed on lab:', searchForm.lab, 'vs', record.lab);
      return false;
    }

    if (searchForm.clinic && searchForm.clinic.trim() !== '' && record.clinic && !record.clinic.toLowerCase().includes(searchForm.clinic.toLowerCase())) {
      console.log('Failed on clinic:', searchForm.clinic, 'vs', record.clinic);
      return false;
    }

    if (
      searchForm.patientFirstName && record.patientFirstName &&
      !record.patientFirstName.toLowerCase().includes(searchForm.patientFirstName.toLowerCase())
    ) {
      console.log('Failed on patientFirstName:', searchForm.patientFirstName, 'vs', record.patientFirstName);
      return false;
    }

    if (
      searchForm.patientLastName && record.patientLastName &&
      !record.patientLastName.toLowerCase().includes(searchForm.patientLastName.toLowerCase())
    ) {
      console.log('Failed on patientLastName:', searchForm.patientLastName, 'vs', record.patientLastName);
      return false;
    }

    if (searchForm.doctor && record.doctor && !record.doctor.toLowerCase().includes(searchForm.doctor.toLowerCase())) {
      console.log('Failed on doctor:', searchForm.doctor, 'vs', record.doctor);
      return false;
    }

    if (searchForm.procedure && record.procedure && !record.procedure.toLowerCase().includes(searchForm.procedure.toLowerCase())) {
      console.log('Failed on procedure:', searchForm.procedure, 'vs', record.procedure);
      return false;
    }

    if (searchForm.status && record.status && record.status !== searchForm.status) {
      console.log('Failed on status:', searchForm.status, 'vs', record.status);
      return false;
    }

    console.log('Record matches!');
    return true;
  };

  const renderSearchResults = () => {
    if (!hasSearched) {
      return (
        <div className="px-8 py-16 text-center text-sm text-slate-400">
          {t('Select a filter and press "Search" to display results.')}
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="px-8 py-16 text-center text-sm text-slate-400">
          {searchFeedback}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.35em] text-slate-400">
              <th className="px-6 py-4">{t('Case ID')}</th>
              <th className="px-6 py-4">{t('Patient')}</th>
              <th className="px-6 py-4">{t('Lab')}</th>
              <th className="px-6 py-4">{t('Clinic')}</th>
              <th className="px-6 py-4">{t('Status')}</th>
              <th className="px-6 py-4 text-center">{t('Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-slate-200">
            {searchResults.map((record) => (
              <tr key={record.caseId} className="hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-white">{record.caseId}</td>
                <td className="px-6 py-4">
                  {record.patientFirstName} {record.patientLastName}
                </td>
                <td className="px-6 py-4">{record.lab}</td>
                <td className="px-6 py-4">{record.clinic}</td>
                <td className="px-6 py-4">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                      statusBadgeClass(record.status)
                    )}
                  >
                    {t(caseStatusLabels[record.status])}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCase(record);
                      setShowDetailsModal(true);
                    }}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/40 hover:text-primary-50"
                  >
                    {t('View details')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'Delayed') return 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-400/30';
    if (status === 'Departed') return 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-400/30';
    return 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-400/30';
  };

  const getCategoryTrendText = (trend: string) => {
    if (trend === 'up') return 'Rising demand';
    if (trend === 'down') return 'Slight dip · review scheduling';
    return 'Holding steady';
  };

  const renderActiveSectionContent = () => {
    if (activeSection === 'case-search') {
      return (
        <div className="space-y-8">
          {/* Case Search Content will be rendered here by the parent component */}
        </div>
      );
    }

    if (activeSection !== 'dashboard') {
      return (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-slate-400">
          <h2 className="text-2xl font-semibold text-white">
            {laboratorySubNavigation.find((section) => section.id === activeSection)?.label ?? 'Coming soon'}
          </h2>
          <p className="mt-3 text-sm">
            This workspace is on our roadmap. Let the product team know what workflows you&apos;d like to streamline here.
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-primary-200/70">Module in discovery</p>
        </div>
      );
    }

    return null; // Dashboard content will be rendered inline
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log('Search form:', searchForm);
    console.log('Active case records to filter:', activeCaseRecords);
    const results = activeCaseRecords.filter(matchesSearchCriteria);
    console.log('Search results:', results);

    updateResults(results);
  };

  const handleNameSearch = () => {
    const first = searchForm.patientFirstName.trim().toLowerCase();
    const last = searchForm.patientLastName.trim().toLowerCase();

    if (!first && !last) {
      updateResults([], 'Enter at least a first or last name to search.');
      return;
    }

    const results = activeCaseRecords.filter((record) => {
      const matchesFirst = first ? record.patientFirstName.toLowerCase().includes(first) : true;
      const matchesLast = last ? record.patientLastName.toLowerCase().includes(last) : true;

      return matchesFirst && matchesLast;
    });

    updateResults(results);
  };

  const handleInputChange = <Field extends keyof CaseSearchForm>(field: Field) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setSearchForm((prev) => ({
        ...prev,
        [field]: value as CaseSearchForm[Field]
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

  const statusBadgeClass = (status: CaseStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400/40';
      case 'in-transit':
        return 'bg-sky-500/10 text-sky-200 ring-1 ring-sky-400/40';
      case 'in-planning':
        return 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-400/40';
      default:
        return 'bg-primary-500/10 text-primary-100 ring-1 ring-primary-400/40';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[120rem]">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category="Laboratory"
            title="Operations Command Center"
            subtitle="Monitor the production floor, shipping timelines and clinic satisfaction at a glance."
            showEntitySelector={true}
            entityLabel="Entity"
            selectedEntityId={selectedEntityId}
            onEntityChange={(id) => setSelectedEntityId(id)}
          />

          <TopNavigation />
        </div>

        <main className="overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">

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
                      if (section.id === 'billing') {
                        router.push('/laboratory/billing');
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
              {activeSection === 'dashboard' && (
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
                                Trend: {getCategoryTrendText(category.trend)}
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
                                  getStatusBadgeClass(route.status)
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
              )}

              {activeSection === 'case-search' && (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-8 shadow-lg shadow-black/20 backdrop-blur">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-[0.45em] text-primary-200/70">{t('Laboratory Lookup')}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{t('Case Search')}</h2>
                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                          {t(
                            'Filter by lab, clinic, doctor or procedure to locate an active case. Search through all laboratory cases in real-time.'
                          )}
                        </p>
                        {loadingCases && (
                          <p className="mt-2 text-sm text-primary-400">
                            {t('Loading cases...')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3">
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-400 whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {t('Create Case')}
                        </button>
                        <span
                          className={clsx(
                            'inline-flex items-center justify-center rounded-xl border px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap',
                            hasSearched && searchResults.length > 0
                              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                              : 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                          )}
                        >
                          {searchFeedback}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSearch} className="mt-8 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Case ID')}</span>
                          <input
                            type="text"
                            value={searchForm.caseId}
                            onChange={handleInputChange('caseId')}
                            placeholder={t('LAB-10XXX')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Lab')}</span>
                          <select
                            value={searchForm.lab}
                            onChange={handleInputChange('lab')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">{t('All')}</option>
                            {availableLabs.map((lab) => (
                              <option key={lab} value={lab}>
                                {lab}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Clinic')}</span>
                          <select
                            value={searchForm.clinic}
                            onChange={handleInputChange('clinic')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">{t('All')}</option>
                            {availableClinics.map((clinic) => (
                              <option key={clinic} value={clinic}>
                                {clinic}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Status')}</span>
                          <select
                            value={searchForm.status}
                            onChange={handleInputChange('status')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">{t('Any')}</option>
                            {availableStatuses.map((status) => (
                              <option key={status} value={status}>
                                {t(caseStatusLabels[status])}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Patient first name')}</span>
                          <input
                            type="text"
                            value={searchForm.patientFirstName}
                            onChange={handleInputChange('patientFirstName')}
                            placeholder={t('First name')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Patient last name')}</span>
                          <input
                            type="text"
                            value={searchForm.patientLastName}
                            onChange={handleInputChange('patientLastName')}
                            placeholder={t('Last name')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Doctor')}</span>
                          <select
                            value={searchForm.doctor}
                            onChange={handleInputChange('doctor')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                          >
                            <option value="">{t('All')}</option>
                            {availableDoctors.map((doctor) => (
                              <option key={doctor} value={doctor}>
                                {doctor}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{t('Procedure')}</span>
                          <input
                            type="text"
                            value={searchForm.procedure}
                            onChange={handleInputChange('procedure')}
                            placeholder={t('Procedure placeholder')}
                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                          />
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="submit"
                          disabled={loadingCases}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          {t('Search')}
                        </button>
                        <button
                          type="button"
                          onClick={handleNameSearch}
                          disabled={loadingCases}
                          className="inline-flex items-center gap-2 rounded-xl border border-primary-400/50 bg-transparent px-4 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-300 hover:text-primary-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {t('Search by name')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchForm({
                              caseId: '',
                              lab: '',
                              clinic: '',
                              patientFirstName: '',
                              patientLastName: '',
                              doctor: '',
                              procedure: '',
                              status: ''
                            });
                            setSearchResults([]);
                            setHasSearched(false);
                            setSearchFeedback(t('Please perform a search.'));
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-transparent px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-slate-200"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          {t('Reset')}
                        </button>
                        <div className="ml-auto text-sm text-slate-400">
                          {activeCaseRecords.length} {t('total cases')}
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="rounded-3xl border border-white/5 bg-white/[0.02] shadow-lg shadow-black/10 backdrop-blur">
                    {renderSearchResults()}
                  </div>
                </div>
              )}

              {activeSection !== 'dashboard' && activeSection !== 'case-search' && (
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

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-7xl max-h-[75vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-6 sm:px-8 py-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">{t('Create New Lab Case')}</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-400">{t('Fill in the details below to create a new laboratory case')}</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toothNumbersValue = formData.get('toothNumbers');
                const toothNumbers = toothNumbersValue && typeof toothNumbersValue === 'string' 
                  ? toothNumbersValue.split(',').map(t => t.trim()).filter(Boolean) 
                  : [];
                
                createLabCase({
                  variables: {
                    input: {
                      lab: formData.get('lab'),
                      clinic: formData.get('clinic'),
                      patientFirstName: formData.get('patientFirstName'),
                      patientLastName: formData.get('patientLastName'),
                      birthday: formData.get('birthday'),
                      reservationDate: formData.get('reservationDate'),
                      doctor: formData.get('doctor'),
                      procedure: formData.get('procedure'),
                      category: formData.get('category'),
                      priority: formData.get('priority') || 'normal',
                      shadeGuide: formData.get('shadeGuide') || undefined,
                      materialType: formData.get('materialType') || undefined,
                      notes: formData.get('notes') || undefined,
                      toothNumbers: toothNumbers.length > 0 ? toothNumbers : undefined,
                      estimatedCompletion: formData.get('estimatedCompletion') || undefined,
                      technician: formData.get('technician') || undefined,
                    },
                  },
                });
              }}
              className="p-6 sm:p-8 space-y-5"
            >
              {/* Patient Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Patient Information')}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('First Name')} *</span>
                    <input
                      type="text"
                      name="patientFirstName"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="John"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Last Name')} *</span>
                    <input
                      type="text"
                      name="patientLastName"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Doe"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Birthday')} *</span>
                    <input
                      type="date"
                      name="birthday"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Reservation Date')} *</span>
                    <input
                      type="date"
                      name="reservationDate"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                    />
                  </label>
                </div>
              </div>

              {/* Case Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Case Details')}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Lab')} *</span>
                    <input
                      type="text"
                      name="lab"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Complete Lab"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Clinic')} *</span>
                    <input
                      type="text"
                      name="clinic"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Miller Dental - Coral Gables"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Doctor')} *</span>
                    <input
                      type="text"
                      name="doctor"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Dr. Alexis Stone"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Procedure')} *</span>
                    <input
                      type="text"
                      name="procedure"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Crown - Anterior"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Category')} *</span>
                    <select
                      name="category"
                      required
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                    >
                      <option value="">Select category...</option>
                      <option value="Crowns & Bridges">Crowns & Bridges</option>
                      <option value="Implant Restorations">Implant Restorations</option>
                      <option value="Try-in / Wax Setups">Try-in / Wax Setups</option>
                      <option value="Aligners & Ortho">Aligners & Ortho</option>
                      <option value="Repairs & Adjustments">Repairs & Adjustments</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Priority')}</span>
                    <select
                      name="priority"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="rush">Rush</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Technical Specifications')}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Shade Guide')}</span>
                    <input
                      type="text"
                      name="shadeGuide"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="A2, B1, etc."
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Material Type')}</span>
                    <input
                      type="text"
                      name="materialType"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Layered Zirconia, E-max, etc."
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Tooth Numbers')}</span>
                    <input
                      type="text"
                      name="toothNumbers"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="8, 9, 10 (comma separated)"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-300">{t('Estimated Completion')}</span>
                    <input
                      type="date"
                      name="estimatedCompletion"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                    />
                  </label>
                  <label className="block lg:col-span-2">
                    <span className="text-sm font-medium text-slate-300">{t('Technician')}</span>
                    <input
                      type="text"
                      name="technician"
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                      placeholder="Assigned technician name"
                    />
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Additional Notes')}</h3>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('Notes')}</span>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none resize-none"
                    placeholder="Any special instructions or notes..."
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 sm:flex-none rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-none rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                >
                  {t('Create Case')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Details Modal */}
      {showDetailsModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">{t('Case Details')}</h2>
                  <p className="mt-1 text-sm text-slate-400">{selectedCase.caseId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCase(null);
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t('Status')}:</span>
                <span
                  className={clsx(
                    'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                    statusBadgeClass(selectedCase.status)
                  )}
                >
                  {t(caseStatusLabels[selectedCase.status])}
                </span>
              </div>

              {/* Patient Information */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Patient Information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">{t('First Name')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.patientFirstName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Last Name')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.patientLastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Birthday')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.birthday}</p>
                  </div>
                </div>
              </div>

              {/* Case Information */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Case Information')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">{t('Laboratory')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.lab}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Clinic')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.clinic}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Doctor')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.doctor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Procedure')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.procedure}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('Reservation Date')}</p>
                    <p className="mt-1 text-sm font-medium text-white">{selectedCase.reservationDate}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {selectedCase.qrCode && (
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('QR Code')}</h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-lg bg-white p-4">
                      <img 
                        src={selectedCase.qrCode} 
                        alt="Case QR Code" 
                        className="w-48 h-48"
                      />
                    </div>
                    {selectedCase.qrCodeData && (
                      <div className="w-full">
                        <p className="text-xs text-slate-400 mb-1">{t('QR Code Data')}</p>
                        <p className="text-sm font-mono text-white bg-slate-950/60 rounded-lg px-3 py-2 break-all">{selectedCase.qrCodeData}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  {t('Edit Case')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedCase(null);
                  }}
                  className="flex-1 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                >
                  {t('Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

