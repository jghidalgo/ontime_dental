'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';

type NavigationItem = {
  label: string;
  href: string;
};

type ReservationStatus =
  | 'Programado'
  | 'En fabricación'
  | 'Listo para envío'
  | 'Entregado'
  | 'Pendiente confirmación';

type ReservationCase = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  procedure: string;
  doctor: string;
  clinic: string;
  patient: string;
  chair: string;
  durationMinutes: number;
  status: ReservationStatus;
};

type ViewMode = 'month' | 'week' | 'day';

type CreateCaseFormState = {
  procedure: string;
  phase: string;
  productType: string;
  shade: string;
  patient: string;
  doctor: string;
  clinic: string;
  status: ReservationStatus;
  chair: string;
  time: string;
  durationMinutes: number;
  notes: string;
};

const doctorOptions = [
  'Dr. Alexis Stone',
  'Dr. Maya Jensen',
  'Dr. Luis Carmona',
  'Dr. Javier Molina',
  'Dr. Daniel Ortiz',
  'Dr. Ethan Wells',
  'Dra. Olivia Reyes',
  'Dra. Sofía Delgado',
  'Dra. Isabel Vega'
];

const clinicOptions = [
  'Miller Dental - Coral Gables',
  'Bayfront Smiles',
  'Sunset Orthodontics',
  'Key Biscayne Dental',
  'Lakeview Dental Studio',
  'Harbor Point Dental',
  'Coral Ridge Family Dental',
  'Brickell Aligners',
  'Biscayne Smiles'
];

const patientOptions = [
  'Lucía Ramírez',
  'Mateo Salazar',
  'Valeria González',
  'María Suárez',
  'Sofía Martel',
  'Camila Torres',
  'Andrés Patiño',
  'Héctor Navarro'
];

const chairOptions = ['CAD-01', 'CAD-02', 'CAD-03', 'ALN-01', 'ALN-02', 'MILL-02', 'CER-02', 'CER-03', 'EST-02'];

const phaseOptions = ['Try-in', 'Finish', 'Wax setup', 'Adjustment', 'Repair'];

const productTypeOptions = [
  'Upper full denture',
  'Lower full denture',
  'Upper metallic partial',
  'Lower metallic partial',
  'Upper acrylic partial',
  'Lower acrylic partial',
  'Crown'
];

const shadeOptions = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2'];

const durationOptions = [45, 60, 75, 90, 120];

const statusOptions: ReservationStatus[] = [
  'Programado',
  'En fabricación',
  'Listo para envío',
  'Entregado',
  'Pendiente confirmación'
];

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

const createInitialFormState = (procedure: string): CreateCaseFormState => ({
  procedure,
  phase: phaseOptions[0],
  productType: productTypeOptions[0],
  shade: shadeOptions[0],
  patient: patientOptions[0],
  doctor: doctorOptions[0],
  clinic: clinicOptions[0],
  status: 'Programado',
  chair: chairOptions[0],
  time: '09:00',
  durationMinutes: durationOptions[1],
  notes: ''
});

const initialReservationCases: ReservationCase[] = [
  {
    id: 'RES-2041',
    date: '2025-10-01',
    time: '08:30',
    procedure: 'Corona zirconia #14',
    doctor: 'Dr. Alexis Stone',
    clinic: 'Miller Dental - Coral Gables',
    patient: 'Lucía Ramírez',
    chair: 'CAD-01',
    durationMinutes: 75,
    status: 'En fabricación'
  },
  {
    id: 'RES-2042',
    date: '2025-10-01',
    time: '10:00',
    procedure: 'Implante unitario #30',
    doctor: 'Dr. Maya Jensen',
    clinic: 'Bayfront Smiles',
    patient: 'Mateo Salazar',
    chair: 'CAD-02',
    durationMinutes: 90,
    status: 'Programado'
  },
  {
    id: 'RES-2048',
    date: '2025-10-02',
    time: '09:00',
    procedure: 'Alineador serie 3',
    doctor: 'Dr. Luis Carmona',
    clinic: 'Sunset Orthodontics',
    patient: 'Valeria González',
    chair: 'ALN-01',
    durationMinutes: 60,
    status: 'En fabricación'
  },
  {
    id: 'RES-2049',
    date: '2025-10-02',
    time: '11:30',
    procedure: 'Corona temporal CAD/CAM',
    doctor: 'Dr. Javier Molina',
    clinic: 'Key Biscayne Dental',
    patient: 'María Suárez',
    chair: 'MILL-02',
    durationMinutes: 45,
    status: 'Listo para envío'
  },
  {
    id: 'RES-2053',
    date: '2025-10-03',
    time: '08:15',
    procedure: 'Puente 3 unidades',
    doctor: 'Dr. Daniel Ortiz',
    clinic: 'Lakeview Dental Studio',
    patient: 'Sofía Martel',
    chair: 'CER-03',
    durationMinutes: 110,
    status: 'En fabricación'
  },
  {
    id: 'RES-2054',
    date: '2025-10-03',
    time: '13:00',
    procedure: 'Carillas feldespáticas #7-10',
    doctor: 'Dr. Ethan Wells',
    clinic: 'Harbor Point Dental',
    patient: 'Camila Torres',
    chair: 'EST-02',
    durationMinutes: 95,
    status: 'Programado'
  },
  {
    id: 'RES-2058',
    date: '2025-10-04',
    time: '10:45',
    procedure: 'Corona zirconia #3',
    doctor: 'Dra. Olivia Reyes',
    clinic: 'Coral Ridge Family Dental',
    patient: 'Andrés Patiño',
    chair: 'CAD-03',
    durationMinutes: 70,
    status: 'Entregado'
  },
  {
    id: 'RES-2060',
    date: '2025-10-05',
    time: '09:30',
    procedure: 'Corona zirconia #14',
    doctor: 'Dr. Alexis Stone',
    clinic: 'Miller Dental - Coral Gables',
    patient: 'Lucía Ramírez',
    chair: 'CAD-01',
    durationMinutes: 75,
    status: 'Entregado'
  },
  {
    id: 'RES-2061',
    date: '2025-10-05',
    time: '15:00',
    procedure: 'Alineador control serie 4',
    doctor: 'Dra. Sofía Delgado',
    clinic: 'Brickell Aligners',
    patient: 'Héctor Navarro',
    chair: 'ALN-02',
    durationMinutes: 55,
    status: 'Programado'
  },
  {
    id: 'RES-2065',
    date: '2025-10-07',
    time: '11:15',
    procedure: 'Prótesis parcial superior',
    doctor: 'Dra. Isabel Vega',
    clinic: 'Biscayne Smiles',
    patient: 'Héctor Navarro',
    chair: 'CER-02',
    durationMinutes: 120,
    status: 'En fabricación'
  },
  {
    id: 'RES-2070',
    date: '2025-10-09',
    time: '08:45',
    procedure: 'Corona zirconia #9',
    doctor: 'Dr. Alexis Stone',
    clinic: 'Miller Dental - Coral Gables',
    patient: 'Lucía Ramírez',
    chair: 'CAD-01',
    durationMinutes: 70,
    status: 'Listo para envío'
  },
  {
    id: 'RES-2074',
    date: '2025-10-11',
    time: '10:00',
    procedure: 'Alineador serie 5',
    doctor: 'Dr. Luis Carmona',
    clinic: 'Sunset Orthodontics',
    patient: 'Valeria González',
    chair: 'ALN-01',
    durationMinutes: 60,
    status: 'En fabricación'
  },
  {
    id: 'RES-2076',
    date: '2025-10-12',
    time: '14:00',
    procedure: 'Implante unitario #30',
    doctor: 'Dr. Maya Jensen',
    clinic: 'Bayfront Smiles',
    patient: 'Mateo Salazar',
    chair: 'CAD-02',
    durationMinutes: 90,
    status: 'Programado'
  },
  {
    id: 'RES-2080',
    date: '2025-10-14',
    time: '09:20',
    procedure: 'Corona temporal CAD/CAM',
    doctor: 'Dr. Javier Molina',
    clinic: 'Key Biscayne Dental',
    patient: 'María Suárez',
    chair: 'MILL-02',
    durationMinutes: 45,
    status: 'En fabricación'
  },
  {
    id: 'RES-2082',
    date: '2025-10-15',
    time: '08:30',
    procedure: 'Carillas feldespáticas #7-10',
    doctor: 'Dr. Ethan Wells',
    clinic: 'Harbor Point Dental',
    patient: 'Camila Torres',
    chair: 'EST-02',
    durationMinutes: 95,
    status: 'En fabricación'
  },
  {
    id: 'RES-2083',
    date: '2025-10-15',
    time: '13:30',
    procedure: 'Prótesis parcial superior',
    doctor: 'Dra. Isabel Vega',
    clinic: 'Biscayne Smiles',
    patient: 'Héctor Navarro',
    chair: 'CER-02',
    durationMinutes: 120,
    status: 'Programado'
  },
  {
    id: 'RES-2084',
    date: '2025-10-15',
    time: '16:00',
    procedure: 'Corona zirconia #14',
    doctor: 'Dr. Alexis Stone',
    clinic: 'Miller Dental - Coral Gables',
    patient: 'Lucía Ramírez',
    chair: 'CAD-01',
    durationMinutes: 70,
    status: 'Pendiente confirmación'
  },
  {
    id: 'RES-2088',
    date: '2025-10-18',
    time: '11:45',
    procedure: 'Alineador serie 5',
    doctor: 'Dr. Luis Carmona',
    clinic: 'Sunset Orthodontics',
    patient: 'Valeria González',
    chair: 'ALN-01',
    durationMinutes: 60,
    status: 'Programado'
  },
  {
    id: 'RES-2090',
    date: '2025-10-20',
    time: '09:00',
    procedure: 'Implante unitario #30',
    doctor: 'Dr. Maya Jensen',
    clinic: 'Bayfront Smiles',
    patient: 'Mateo Salazar',
    chair: 'CAD-02',
    durationMinutes: 90,
    status: 'En fabricación'
  },
  {
    id: 'RES-2091',
    date: '2025-10-20',
    time: '12:30',
    procedure: 'Puente 3 unidades',
    doctor: 'Dr. Daniel Ortiz',
    clinic: 'Lakeview Dental Studio',
    patient: 'Sofía Martel',
    chair: 'CER-03',
    durationMinutes: 110,
    status: 'Programado'
  },
  {
    id: 'RES-2094',
    date: '2025-10-22',
    time: '10:15',
    procedure: 'Carillas feldespáticas #7-10',
    doctor: 'Dr. Ethan Wells',
    clinic: 'Harbor Point Dental',
    patient: 'Camila Torres',
    chair: 'EST-02',
    durationMinutes: 95,
    status: 'Listo para envío'
  },
  {
    id: 'RES-2098',
    date: '2025-10-25',
    time: '09:45',
    procedure: 'Corona zirconia #14',
    doctor: 'Dr. Alexis Stone',
    clinic: 'Miller Dental - Coral Gables',
    patient: 'Lucía Ramírez',
    chair: 'CAD-01',
    durationMinutes: 70,
    status: 'En fabricación'
  },
  {
    id: 'RES-2100',
    date: '2025-10-28',
    time: '11:00',
    procedure: 'Alineador control serie 4',
    doctor: 'Dra. Sofía Delgado',
    clinic: 'Brickell Aligners',
    patient: 'Héctor Navarro',
    chair: 'ALN-02',
    durationMinutes: 55,
    status: 'Programado'
  },
  {
    id: 'RES-2104',
    date: '2025-10-30',
    time: '08:30',
    procedure: 'Implante unitario #30',
    doctor: 'Dr. Maya Jensen',
    clinic: 'Bayfront Smiles',
    patient: 'Mateo Salazar',
    chair: 'CAD-02',
    durationMinutes: 90,
    status: 'Pendiente confirmación'
  }
];

const statusStyles: Record<ReservationStatus, string> = {
  Programado: 'bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/40',
  'En fabricación': 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40',
  'Listo para envío': 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/40',
  Entregado: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40',
  'Pendiente confirmación': 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/40'
};

const palette = [
  'bg-primary-500/15 text-primary-100 ring-1 ring-primary-400/40',
  'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30',
  'bg-sky-500/15 text-sky-100 ring-1 ring-sky-400/30',
  'bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/30',
  'bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/30',
  'bg-indigo-500/15 text-indigo-100 ring-1 ring-indigo-400/30'
];

const parseISODate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const startOfWeek = (date: Date) => {
  const clone = new Date(date);
  const day = (clone.getDay() + 6) % 7; // convert Sunday-based index to Monday
  clone.setDate(clone.getDate() - day);
  clone.setHours(0, 0, 0, 0);
  return clone;
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export default function LaboratoryReservationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 9, 15));
  const [focusedMonth, setFocusedMonth] = useState<Date>(new Date(2025, 9, 1));
  const [monthSelector, setMonthSelector] = useState<string>('2025-10-01');
  const { t, language } = useTranslations();
  const [cases, setCases] = useState<ReservationCase[]>(initialReservationCases);
  const [activeProcedure, setActiveProcedure] = useState<{ date: Date; procedure: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const defaultProcedureLabel = initialReservationCases[0]?.procedure ?? 'New laboratory case';
  const [createForm, setCreateForm] = useState<CreateCaseFormState>(() =>
    createInitialFormState(defaultProcedureLabel)
  );
  const [creationStatus, setCreationStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [createError, setCreateError] = useState<string | null>(null);
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const resetCreateForm = useCallback(
    (procedure: string) => {
      setCreateForm(createInitialFormState(procedure));
      setCreationStatus('idle');
      setCreateError(null);
    },
    []
  );

  const weekdayFormatter = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'long' }), [locale]);
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
    [locale]
  );
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }),
    [locale]
  );
  const shortWeekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: 'short' }),
    [locale]
  );
  const calendarWeekdays = useMemo(
    () => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => t(day)),
    [t]
  );
  const formatCaseCount = useCallback(
    (count: number) => {
      const unit = count === 1 ? t('case') : t('cases');
      return `${count} ${unit}`;
    },
    [t]
  );
  const statusLabelMap = useMemo(
    () => ({
      Programado: t('Scheduled'),
      'En fabricación': t('In fabrication'),
      'Listo para envío': t('Ready to ship'),
      Entregado: t('Delivered'),
      'Pendiente confirmación': t('Pending confirmation')
    }),
    [t]
  );

  useEffect(() => {
    if (activeProcedure) {
      resetCreateForm(activeProcedure.procedure);
      setShowCreateForm(false);
      return;
    }

    resetCreateForm(defaultProcedureLabel);
    setShowCreateForm(false);
  }, [activeProcedure, defaultProcedureLabel, resetCreateForm]);

  const openProcedureModal = useCallback((date: Date, procedure: string) => {
    setActiveProcedure({ date: new Date(date), procedure });
  }, []);

  const closeModal = useCallback(() => {
    setActiveProcedure(null);
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  useEffect(() => {
    setFocusedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  const navigation = useMemo(
    () =>
      navigationItems.map((item) => ({
        ...item,
        label: t(item.label),
        isActive: pathname === item.href
      })),
    [pathname, t]
  );

  const casesByDate = useMemo(() => {
    const map = new Map<string, ReservationCase[]>();

    for (const reservation of cases) {
      if (!map.has(reservation.date)) {
        map.set(reservation.date, []);
      }

      map.get(reservation.date)!.push(reservation);
    }

    for (const [, cases] of map) {
      cases.sort((a, b) => a.time.localeCompare(b.time));
    }

    return map;
  }, [cases]);

  const casesByDateAndProcedure = useMemo(() => {
    const map = new Map<string, ReservationCase[]>();

    for (const reservation of cases) {
      const key = `${reservation.date}::${reservation.procedure}`;
      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(reservation);
    }

    for (const [, groupedCases] of map) {
      groupedCases.sort((a, b) => a.time.localeCompare(b.time));
    }

    return map;
  }, [cases]);

  const procedureColorMap = useMemo(() => {
    const map = new Map<string, string>();
    let index = 0;

    for (const reservation of cases) {
      if (!map.has(reservation.procedure)) {
        map.set(reservation.procedure, palette[index % palette.length]);
        index += 1;
      }
    }

    return map;
  }, [cases]);

  const monthMatrix = useMemo(() => {
    const start = startOfWeek(new Date(focusedMonth));
    const endOfFocused = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth() + 1, 0);
    const end = addDays(startOfWeek(endOfFocused), 6);
    const days: Date[] = [];
    let cursor = start;

    while (cursor <= end) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }

    const weeks: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [focusedMonth]);

  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [selectedDate]);

  const selectedCases = useMemo(() => {
    const key = formatISODate(selectedDate);
    return casesByDate.get(key) ?? [];
  }, [casesByDate, selectedDate]);

  const modalCases = useMemo(() => {
    if (!activeProcedure) {
      return [] as ReservationCase[];
    }

    const key = `${formatISODate(activeProcedure.date)}::${activeProcedure.procedure}`;
    return casesByDateAndProcedure.get(key) ?? [];
  }, [activeProcedure, casesByDateAndProcedure]);

  const monthlySummary = useMemo(() => {
    const start = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth(), 1);
    const end = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth() + 1, 0);

    const summary = {
      total: 0,
      fabrication: 0,
      scheduled: 0,
      delivered: 0,
      pending: 0
    };

    for (const reservation of cases) {
      const date = parseISODate(reservation.date);
      if (date < start || date > end) continue;

      summary.total += 1;

      switch (reservation.status) {
        case 'En fabricación':
          summary.fabrication += 1;
          break;
        case 'Programado':
          summary.scheduled += 1;
          break;
        case 'Entregado':
          summary.delivered += 1;
          break;
        case 'Pendiente confirmación':
          summary.pending += 1;
          break;
        default:
          break;
      }
    }

    return summary;
  }, [cases, focusedMonth]);

  const monthlyProcedureTotals = useMemo(() => {
    const start = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth(), 1);
    const end = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth() + 1, 0);
    const map = new Map<string, number>();

    for (const reservation of cases) {
      const date = parseISODate(reservation.date);
      if (date < start || date > end) continue;

      map.set(reservation.procedure, (map.get(reservation.procedure) ?? 0) + 1);
    }

    return Array.from(map.entries())
      .map(([procedure, total]) => ({ procedure, total, style: procedureColorMap.get(procedure) ?? palette[0] }))
      .sort((a, b) => b.total - a.total);
  }, [cases, focusedMonth, procedureColorMap]);

  const weekLabel = useMemo(() => {
    const start = weekDates[0];
    const end = weekDates[weekDates.length - 1];
    if (!start || !end) return '';

    return `${dayFormatter.format(start)} – ${dayFormatter.format(end)}`;
  }, [weekDates, dayFormatter]);

  const handlePeriodShift = (direction: -1 | 1) => {
    if (viewMode === 'month') {
      const newFocus = new Date(focusedMonth.getFullYear(), focusedMonth.getMonth() + direction, 1);
      setFocusedMonth(newFocus);
      setSelectedDate((previous) => {
        const next = new Date(previous.getFullYear(), previous.getMonth() + direction, previous.getDate());
        next.setDate(Math.min(next.getDate(), daysInMonth(newFocus)));
        return next;
      });
      setMonthSelector(formatISODate(new Date(newFocus.getFullYear(), newFocus.getMonth(), 1)));
      return;
    }

    if (viewMode === 'week') {
      const next = addDays(selectedDate, direction * 7);
      setSelectedDate(next);
      setMonthSelector(formatISODate(new Date(next.getFullYear(), next.getMonth(), 1)));
      return;
    }

    const next = addDays(selectedDate, direction);
    setSelectedDate(next);
    setMonthSelector(formatISODate(new Date(next.getFullYear(), next.getMonth(), 1)));
  };

  const monthOptions = useMemo(() => {
    const start = new Date(2025, 7, 1);
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      return {
        value: formatISODate(date),
        label: monthFormatter.format(date)
      };
    });
  }, [monthFormatter]);

  const handleCreateSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!activeProcedure) return;

      if (!createForm.procedure.trim()) {
        setCreateError(t('Please add a procedure description.'));
        return;
      }

      if (!createForm.time) {
        setCreateError(t('Please select a start time.'));
        return;
      }

      setCreationStatus('saving');
      setCreateError(null);

      const newCase: ReservationCase = {
        id: `RES-${Math.floor(2000 + Math.random() * 7000)}`,
        date: formatISODate(activeProcedure.date),
        time: createForm.time,
        procedure: createForm.procedure.trim(),
        doctor: createForm.doctor,
        clinic: createForm.clinic,
        patient: createForm.patient,
        chair: createForm.chair,
        durationMinutes: createForm.durationMinutes,
        status: createForm.status
      };

      setCases((previous) => {
        const next = [...previous, newCase];
        next.sort((a, b) => {
          if (a.date === b.date) {
            return a.time.localeCompare(b.time);
          }
          return a.date.localeCompare(b.date);
        });
        return next;
      });

      const monthStart = new Date(activeProcedure.date.getFullYear(), activeProcedure.date.getMonth(), 1);
      setFocusedMonth(monthStart);
      setMonthSelector(formatISODate(monthStart));
      setSelectedDate(new Date(activeProcedure.date));
      setShowCreateForm(false);
      resetCreateForm(newCase.procedure);
      setCreationStatus('success');
    },
    [activeProcedure, createForm, t, resetCreateForm]
  );

  const handleMonthSubmit = () => {
    const next = parseISODate(monthSelector);
    setFocusedMonth(new Date(next.getFullYear(), next.getMonth(), 1));
    setSelectedDate((current) => {
      if (isSameMonth(current, next)) return current;
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
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
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition',
                    item.isActive
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
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Signed in as')}</p>
            <p className="font-medium text-slate-200">{userName || t('Loading...')}</p>
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem('ontime.authToken');
                router.push('/login');
              }}
              className="text-left text-xs font-medium text-slate-500 transition hover:text-primary-200"
            >
              {t('Log out')}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <header className="flex flex-col gap-4 border-b border-white/5 pb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.45em] text-primary-200/70">{t('Laboratory')}</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white">{t('Reservations Control Center')}</h1>
                </div>
                <div className="rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-right text-xs text-primary-100">
                  <p className="font-semibold uppercase tracking-[0.35em]">{t('View')}</p>
                  <p className="mt-1 text-sm font-medium text-primary-50">
                    {viewMode === 'month' && monthFormatter.format(focusedMonth)}
                    {viewMode === 'week' && weekLabel}
                    {viewMode === 'day' && dayFormatter.format(selectedDate)}
                  </p>
                  <p className="text-[11px] text-primary-200/70">{t('Updated at {time}', { time: '07:45' })}</p>
                </div>
              </div>
              <p className="max-w-3xl text-sm text-slate-400">
                {t(
                  'Coordinate laboratory production and deliveries with an integrated view of active cases. Switch between monthly, weekly, and daily modes to anticipate workload by procedure.'
                )}
              </p>
            </header>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-5">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Cases this month')}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{monthlySummary.total}</p>
                <p className="text-xs text-slate-400">{t('Since {month}', { month: monthFormatter.format(focusedMonth) })}</p>
              </div>
              <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-5 text-amber-50">
                <p className="text-xs uppercase tracking-[0.35em] text-amber-200/70">{t('In fabrication')}</p>
                <p className="mt-3 text-3xl font-semibold">{monthlySummary.fabrication}</p>
                <p className="text-xs text-amber-100/70">{t('Active CAD/CAM and finishing cases')}</p>
              </div>
              <div className="rounded-2xl border border-slate-400/30 bg-slate-500/10 px-4 py-5 text-slate-100">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-300/80">{t('Scheduled')}</p>
                <p className="mt-3 text-3xl font-semibold">{monthlySummary.scheduled}</p>
                <p className="text-xs text-slate-400">{t('Cases confirmed for production')}</p>
              </div>
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-5 text-emerald-100">
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">{t('Delivered')}</p>
                <p className="mt-3 text-3xl font-semibold">{monthlySummary.delivered}</p>
                <p className="text-xs text-emerald-200/70">{t('Includes completed routes')}</p>
              </div>
            </section>

            <section className="mt-10 flex flex-col gap-8 xl:flex-row">
              <div className="flex-1 space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Calendar')}</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{t('Case agenda')}</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
                        <select
                          value={monthSelector}
                          onChange={(event) => setMonthSelector(event.target.value)}
                          className="bg-transparent text-sm font-medium text-white focus:outline-none"
                        >
                          {monthOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-slate-900 text-white">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={handleMonthSubmit}
                          className="rounded-full bg-primary-500/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-50 transition hover:bg-primary-400"
                        >
                          {t('Go')}
                        </button>
                      </div>
                      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
                        {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                              'rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide transition',
                              viewMode === mode
                                ? 'bg-primary-500/90 text-primary-50'
                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            )}
                          >
                            {mode === 'month' && t('Month')}
                            {mode === 'week' && t('Week')}
                            {mode === 'day' && t('Day')}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePeriodShift(-1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                          aria-label={t('Previous period')}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePeriodShift(1)}
                          className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                          aria-label={t('Next period')}
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>

                  {viewMode === 'month' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
                        {calendarWeekdays.map((day, index) => (
                          <div key={`${day}-${index}`} className="rounded-lg bg-white/[0.02] py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10">
                        {monthMatrix.map((week, weekIndex) => (
                          <div key={weekIndex} className="contents">
                            {week.map((date) => {
                              const key = formatISODate(date);
                              const cases = casesByDate.get(key) ?? [];
                              const grouped = cases.reduce<Record<string, number>>((acc, current) => {
                                acc[current.procedure] = (acc[current.procedure] ?? 0) + 1;
                                return acc;
                              }, {});
                              const sortedProcedures = Object.entries(grouped)
                                .map(([procedure, total]) => ({ procedure, total }))
                                .sort((a, b) => b.total - a.total)
                                .slice(0, 3);
                              const isCurrentMonth = isSameMonth(date, focusedMonth);
                              const isSelected = isSameDay(date, selectedDate);

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setSelectedDate(date)}
                                  className={clsx(
                                    'flex min-h-[8.5rem] flex-col gap-2 bg-slate-950/40 p-3 text-left transition',
                                    isCurrentMonth ? 'text-slate-100' : 'text-slate-500',
                                    isSelected && 'ring-2 ring-primary-400'
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">{date.getDate()}</span>
                                    <span className="text-xs text-slate-500">{formatCaseCount(cases.length)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    {sortedProcedures.map(({ procedure, total }) => (
                                      <button
                                        key={procedure}
                                        type="button"
                                        onClick={() => openProcedureModal(date, procedure)}
                                        className={clsx(
                                          'flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-[11px] font-medium transition hover:shadow-lg hover:shadow-primary-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60',
                                          procedureColorMap.get(procedure) ?? palette[0]
                                        )}
                                      >
                                        <span className="truncate pr-2">{procedure}</span>
                                        <span className="font-semibold">{total}</span>
                                      </button>
                                    ))}
                                    {cases.length === 0 && (
                                      <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.01] px-2 py-3 text-center text-[11px] text-slate-500">
                                        {t('No scheduled cases')}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewMode === 'week' && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-300">{weekLabel}</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        {weekDates.map((date) => {
                          const key = formatISODate(date);
                          const cases = casesByDate.get(key) ?? [];

                          return (
                            <div key={key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                                    {shortWeekdayFormatter.format(date)}
                                  </p>
                                  <p className="text-lg font-semibold text-white">{date.getDate()}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedDate(date)}
                                  className="text-xs font-semibold uppercase tracking-wide text-primary-200 transition hover:text-primary-100"
                                >
                                  {t('View day')}
                                </button>
                              </div>
                              <div className="mt-3 space-y-2">
                                {cases.length > 0 ? (
                                  cases.map((reservation) => (
                                    <button
                                      key={reservation.id}
                                      type="button"
                                      onClick={() => openProcedureModal(date, reservation.procedure)}
                                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition hover:border-primary-400/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60"
                                    >
                                      <div className="flex items-center justify-between text-xs text-slate-300">
                                        <span className="font-semibold text-white">{reservation.time}</span>
                                        <span>{reservation.chair}</span>
                                      </div>
                                      <p className="mt-1 text-sm font-semibold text-white">{reservation.procedure}</p>
                                      <p className="text-xs text-slate-400">{reservation.doctor}</p>
                                    </button>
                                  ))
                                ) : (
                                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-xs text-slate-500">
                                    {t('No scheduled cases')}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {viewMode === 'day' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                            {shortWeekdayFormatter.format(selectedDate)}
                          </p>
                          <h3 className="text-2xl font-semibold text-white">{dayFormatter.format(selectedDate)}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handlePeriodShift(-1)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                            aria-label={t('Previous day')}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePeriodShift(1)}
                            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                            aria-label={t('Next day')}
                          >
                            ›
                          </button>
                        </div>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                        <div className="space-y-3">
                          {selectedCases.length > 0 ? (
                            selectedCases.map((reservation) => (
                              <button
                                key={reservation.id}
                                type="button"
                                onClick={() => openProcedureModal(selectedDate, reservation.procedure)}
                                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-primary-400/40 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{t('Case')}</p>
                                    <p className="text-lg font-semibold text-white">{reservation.procedure}</p>
                                  </div>
                                  <span className={clsx('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide', statusStyles[reservation.status])}>
                                    {statusLabelMap[reservation.status]}
                                  </span>
                                </div>
                                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Schedule')}</p>
                                    <p className="mt-1 font-semibold text-white">
                                      {reservation.time} · {reservation.durationMinutes} min
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Doctor')}</p>
                                    <p className="mt-1 text-slate-300">{reservation.doctor}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Patient')}</p>
                                    <p className="mt-1 text-slate-300">{reservation.patient}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Clinic')}</p>
                                    <p className="mt-1 text-slate-300">{reservation.clinic}</p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                                  <span>{t('Assigned equipment: {equipment}', { equipment: reservation.chair })}</span>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-primary-200">
                                    {t('View details')}
                                  </span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center text-sm text-slate-500">
                              {t('No cases scheduled for this day.')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="w-full space-y-6 xl:w-80">
                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Procedure distribution')}</p>
                  <div className="mt-4 space-y-3">
                    {monthlyProcedureTotals.map((item) => (
                      <div key={item.procedure} className="flex items-center gap-3">
                        <span className={clsx('inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-wide', item.style)}>
                          {item.total}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.procedure}</p>
                          <p className="text-xs text-slate-500">{t('Scheduled cases this month')}</p>
                        </div>
                      </div>
                    ))}
                    {monthlyProcedureTotals.length === 0 && (
                      <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-slate-500">
                        {t('No procedures assigned yet.')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Case status')}</p>
                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>{t('In fabrication')}</span>
                      <span className="font-semibold text-amber-200">{monthlySummary.fabrication}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Scheduled')}</span>
                      <span className="font-semibold text-slate-100">{monthlySummary.scheduled}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Delivered')}</span>
                      <span className="font-semibold text-emerald-200">{monthlySummary.delivered}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Pending confirmation')}</span>
                      <span className="font-semibold text-rose-200">{monthlySummary.pending}</span>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-dashed border-primary-400/30 bg-primary-500/10 p-4 text-xs text-primary-100">
                    <p className="font-semibold uppercase tracking-[0.35em]">{t('Recommendation')}</p>
                    <p className="mt-2 text-[13px]">
                      {t('Reserve additional blocks for partial prosthetics on Thursdays: next week exceeds the operational threshold.')}
                    </p>
                  </div>
                </div>
              </aside>
            </section>
          </div>
        </main>
      </div>

      {activeProcedure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-slate-200 transition hover:border-primary-400/40 hover:text-white"
              aria-label={t('Close')}
            >
              ×
            </button>
            <div className="space-y-6 px-6 py-10 sm:px-10">
              {creationStatus === 'success' && (
                <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {t('New case drafted for {procedure}.', { procedure: activeProcedure.procedure })}
                </div>
              )}

              <header className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{t('Procedure')}</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">{activeProcedure.procedure}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {t('Scheduled for {date}', { date: dayFormatter.format(activeProcedure.date) })}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{t('Cases on this date')}</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{modalCases.length}</p>
                    <p className="text-[11px] text-slate-500">{formatCaseCount(modalCases.length)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showCreateForm) {
                        setShowCreateForm(false);
                        resetCreateForm(activeProcedure.procedure);
                      } else {
                        resetCreateForm(activeProcedure.procedure);
                        setShowCreateForm(true);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                  >
                    {showCreateForm ? t('Close form') : t('Create new case')}
                  </button>
                </div>
              </header>

              <section className="space-y-3">
                {modalCases.length > 0 ? (
                  modalCases.map((reservation) => (
                    <div key={reservation.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{t('Case ID')}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-200">{reservation.id}</p>
                        </div>
                        <span className={clsx('rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide', statusStyles[reservation.status])}>
                          {statusLabelMap[reservation.status]}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Procedure')}</p>
                          <p className="mt-1 font-semibold text-white">{reservation.procedure}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Schedule')}</p>
                          <p className="mt-1 text-white">
                            {reservation.time} · {reservation.durationMinutes} min
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Doctor')}</p>
                          <p className="mt-1 text-slate-200">{reservation.doctor}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Patient')}</p>
                          <p className="mt-1 text-slate-200">{reservation.patient}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Clinic')}</p>
                          <p className="mt-1 text-slate-200">{reservation.clinic}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Production bay')}</p>
                          <p className="mt-1 text-slate-200">{reservation.chair}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 px-6 py-8 text-center text-sm text-slate-400">
                    {t('No cases scheduled for this procedure on the selected date.')}
                  </p>
                )}
              </section>

              <section className="rounded-3xl border border-dashed border-primary-400/30 bg-primary-500/5 p-6">
                {showCreateForm ? (
                  <form className="space-y-6" onSubmit={handleCreateSubmit}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Case builder')}</p>
                        <h3 className="mt-1 text-xl font-semibold text-white">{t('Insert a new laboratory case')}</h3>
                        <p className="mt-1 text-sm text-primary-100/80">
                          {t('Fields are prefilled with your most common selections. Adjust what you need before inserting.')}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-xs text-white/80">
                        <p>{t('Reservation date')}</p>
                        <p className="mt-1 font-semibold text-white">{dayFormatter.format(activeProcedure.date)}</p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Procedure name')}
                        </label>
                        <input
                          type="text"
                          value={createForm.procedure}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, procedure: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                          placeholder={t('e.g. Crown zirconia #14')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Case phase')}
                        </label>
                        <select
                          value={createForm.phase}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, phase: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {phaseOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Product type')}
                        </label>
                        <select
                          value={createForm.productType}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, productType: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {productTypeOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Shade / color')}
                        </label>
                        <select
                          value={createForm.shade}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, shade: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {shadeOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Patient')}
                        </label>
                        <select
                          value={createForm.patient}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, patient: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {patientOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Doctor')}
                        </label>
                        <select
                          value={createForm.doctor}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, doctor: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {doctorOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Clinic')}
                        </label>
                        <select
                          value={createForm.clinic}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, clinic: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {clinicOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Status')}
                        </label>
                        <select
                          value={createForm.status}
                          onChange={(event) =>
                            setCreateForm((previous) => ({ ...previous, status: event.target.value as ReservationStatus }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {statusLabelMap[option]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Production bay')}
                        </label>
                        <select
                          value={createForm.chair}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, chair: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {chairOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Start time')}
                        </label>
                        <input
                          type="time"
                          value={createForm.time}
                          onChange={(event) => setCreateForm((previous) => ({ ...previous, time: event.target.value }))}
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                          {t('Duration (minutes)')}
                        </label>
                        <select
                          value={createForm.durationMinutes}
                          onChange={(event) =>
                            setCreateForm((previous) => ({ ...previous, durationMinutes: Number(event.target.value) }))
                          }
                          className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        >
                          {durationOptions.map((option) => (
                            <option key={option} value={option} className="bg-slate-900 text-white">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                        {t('Instructions for the lab')}
                      </label>
                      <textarea
                        value={createForm.notes}
                        onChange={(event) => setCreateForm((previous) => ({ ...previous, notes: event.target.value }))}
                        rows={3}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-primary-400/60"
                        placeholder={t('Add finishing preferences, delivery expectations or internal notes...')}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-primary-100">
                      <p>
                        {t('Preview')}: {createForm.phase} · {createForm.productType} · {t('Shade')} {createForm.shade}
                      </p>
                      <p>{t('Estimated chair time')}: {createForm.durationMinutes} {t('minutes')}</p>
                    </div>

                    {createError && (
                      <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                        {createError}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          resetCreateForm(activeProcedure.procedure);
                        }}
                        className="rounded-2xl border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-primary-400/40 hover:text-white"
                      >
                        {t('Cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={creationStatus === 'saving'}
                        className="rounded-2xl bg-primary-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400 disabled:opacity-50"
                      >
                        {creationStatus === 'saving' ? t('Inserting...') : t('Insert case')}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-3 text-sm text-primary-100">
                    <p className="text-base font-semibold text-white">{t('Need to slot another case?')}</p>
                    <p>
                      {t('Launch the guided form to reserve production capacity. Your selections will auto-fill with the most recent context for this procedure.')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        resetCreateForm(activeProcedure.procedure);
                        setShowCreateForm(true);
                      }}
                      className="mt-2 inline-flex w-fit items-center justify-center gap-2 rounded-2xl border border-primary-400/40 bg-primary-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/60 hover:bg-primary-500/20"
                    >
                      {t('Start case builder')}
                    </button>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
