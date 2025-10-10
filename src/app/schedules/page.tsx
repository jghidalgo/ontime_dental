'use client';

import Link from 'next/link';
import type { DragEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const navigationItems = [
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

const clinics = [
  { id: 'ce', name: 'CE' },
  { id: 'miller', name: 'Miller' }
];

const frontDeskPositions = [
  { id: 'front-desk', name: 'Front Desk' },
  { id: 'assistant-1', name: 'Assistant 1' },
  { id: 'assistant-2', name: 'Assistant 2' }
];

type Employee = { id: string; name: string };
type FrontDeskSchedule = Record<string, Record<string, Employee | null>>;

const initialFrontDeskSchedule: FrontDeskSchedule = {
  'front-desk': {
    ce: { id: 'dagmar', name: 'Dagmar' },
    miller: { id: 'naomi', name: 'Naomi' }
  },
  'assistant-1': {
    ce: { id: 'natalia', name: 'Natalia' },
    miller: { id: 'dulce', name: 'Dulce' }
  },
  'assistant-2': {
    ce: { id: 'sofia', name: 'Sofía' },
    miller: { id: 'marisol', name: 'Marisol' }
  }
};

const days = [
  { id: 'monday', name: 'Monday' },
  { id: 'tuesday', name: 'Tuesday' },
  { id: 'wednesday', name: 'Wednesday' },
  { id: 'thursday', name: 'Thursday' },
  { id: 'friday', name: 'Friday' },
  { id: 'saturday', name: 'Saturday' }
];

type DoctorAssignment = { id: string; name: string; shift: 'AM' | 'PM' };
type DoctorSchedule = Record<string, Record<string, DoctorAssignment | null>>;

const initialDoctorSchedule: DoctorSchedule = {
  monday: {
    ce: { id: 'jorge-blanco', name: 'Dr. Jorge Blanco', shift: 'AM' },
    miller: { id: 'farid-blanco', name: 'Dr. Farid Blanco', shift: 'PM' }
  },
  tuesday: {
    ce: { id: 'naomi-lee', name: 'Dr. Naomi Lee', shift: 'AM' },
    miller: { id: 'david-fernandez', name: 'Dr. David Fernández', shift: 'PM' }
  },
  wednesday: {
    ce: { id: 'javier-crespo', name: 'Dr. Javier Crespo', shift: 'AM' },
    miller: { id: 'maria-ponce', name: 'Dr. María Ponce', shift: 'PM' }
  },
  thursday: {
    ce: { id: 'carmen-casas', name: 'Dr. Carmen Casas', shift: 'AM' },
    miller: { id: 'federico-vargas', name: 'Dr. Federico Vargas', shift: 'PM' }
  },
  friday: {
    ce: { id: 'ricardo-rivera', name: 'Dr. Ricardo Rivera', shift: 'AM' },
    miller: { id: 'andres-ibarra', name: 'Dr. Andrés Ibarra', shift: 'PM' }
  },
  saturday: {
    ce: { id: 'on-call', name: 'On-call Doctor', shift: 'AM' },
    miller: null
  }
};

type DragPayload =
  | { type: 'frontDesk'; positionId: string; clinicId: string }
  | { type: 'doctor'; dayId: string; clinicId: string };

export default function SchedulesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [frontDeskSchedule, setFrontDeskSchedule] = useState<FrontDeskSchedule>(initialFrontDeskSchedule);
  const [doctorSchedule, setDoctorSchedule] = useState<DoctorSchedule>(initialDoctorSchedule);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  const selectedNavigation = useMemo(
    () => navigationItems.map((item) => ({ ...item, isActive: pathname === item.href })),
    [pathname]
  );

  const handleLogout = () => {
    window.localStorage.removeItem('ontime.authToken');
    router.push('/login');
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, payload: DragPayload) => {
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  };

  const allowDropForType = (event: DragEvent<HTMLElement>, type: DragPayload['type']) => {
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;

    const payload = safeParsePayload(data);
    if (!payload || payload.type !== type) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const safeParsePayload = (raw: string): DragPayload | null => {
    try {
      const parsed = JSON.parse(raw) as DragPayload;
      if (parsed.type === 'frontDesk' || parsed.type === 'doctor') {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse drag payload', error);
      return null;
    }
  };

  const handleFrontDeskDrop = (positionId: string, clinicId: string) => (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    const payload = safeParsePayload(data);

    if (!payload || payload.type !== 'frontDesk') return;

    event.preventDefault();
    setActiveDropZone(null);

    setFrontDeskSchedule((previous) => {
      const source = previous[payload.positionId]?.[payload.clinicId];
      const target = previous[positionId]?.[clinicId];

      if (!source) {
        return previous;
      }

      return {
        ...previous,
        [payload.positionId]: {
          ...previous[payload.positionId],
          [payload.clinicId]: target ?? null
        },
        [positionId]: {
          ...previous[positionId],
          [clinicId]: source
        }
      };
    });
  };

  const handleDoctorDrop = (dayId: string, clinicId: string) => (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    const payload = safeParsePayload(data);

    if (!payload || payload.type !== 'doctor') return;

    event.preventDefault();
    setActiveDropZone(null);

    setDoctorSchedule((previous) => {
      const source = previous[payload.dayId]?.[payload.clinicId];
      const target = previous[dayId]?.[clinicId];

      if (!source) {
        return previous;
      }

      return {
        ...previous,
        [payload.dayId]: {
          ...previous[payload.dayId],
          [payload.clinicId]: target ?? null
        },
        [dayId]: {
          ...previous[dayId],
          [clinicId]: source
        }
      };
    });
  };

  const handleDragEnter = (dropZoneId: string) => (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    if (!data) return;

    const payload = safeParsePayload(data);
    if (!payload) return;

    if (dropZoneId.startsWith('frontDesk') && payload.type !== 'frontDesk') return;
    if (dropZoneId.startsWith('doctor') && payload.type !== 'doctor') return;

    event.preventDefault();
    setActiveDropZone(dropZoneId);
  };

  const dropZoneClass = (zoneId: string) =>
    activeDropZone === zoneId
      ? 'ring-2 ring-primary-400/80 bg-primary-400/5'
      : 'ring-1 ring-white/5 hover:ring-primary-400/60 hover:bg-primary-400/5';

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

            <nav className="mt-12 space-y-1">
              {selectedNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    item.isActive
                      ? 'flex items-center justify-between rounded-xl bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-100 shadow-lg shadow-primary-900/40 ring-1 ring-primary-400/40'
                      : 'flex items-center justify-between rounded-xl px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white'
                  }
                >
                  <span>{item.label}</span>
                  {item.isActive && <span className="text-[10px] uppercase tracking-[0.35em] text-primary-100">Active</span>}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 text-slate-200 ring-1 ring-white/10">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-200/80">Welcome</p>
            <p className="mt-1 text-lg font-semibold text-white">{userName}</p>
            <p className="mt-4 text-sm text-slate-400">
              Manage clinic coverage by dragging team members across the network. Changes are saved locally for rapid planning.
            </p>
            <button
              onClick={handleLogout}
              className="mt-6 w-full rounded-xl bg-primary-500/80 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
            >
              Log out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-10 sm:px-10">
          <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 text-slate-100 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-primary-200/80">Operations</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Schedules</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                Review staffing coverage for front desk and chair-side teams. Drag names between clinics and days to simulate deployment changes before publishing to the organization.
              </p>
            </div>
          </header>

          <section className="mt-8 space-y-12">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl shadow-primary-950/40 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/80">Front Desk</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Front Desks and Assistants&apos; Schedule</h2>
                </div>
                <div className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary-100">
                  Drag &amp; Drop Enabled
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Position</th>
                      {clinics.map((clinic) => (
                        <th
                          key={clinic.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-300"
                        >
                          {clinic.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-white/[0.01]">
                    {frontDeskPositions.map((position) => (
                      <tr key={position.id}>
                        <th className="bg-white/[0.02] px-4 py-4 text-left text-sm font-semibold text-slate-100">
                          {position.name}
                        </th>
                        {clinics.map((clinic) => {
                          const employee = frontDeskSchedule[position.id]?.[clinic.id] ?? null;
                          const zoneId = `frontDesk:${position.id}:${clinic.id}`;

                          return (
                            <td key={clinic.id} className="px-4 py-4">
                              <div
                                className={`flex min-h-[4rem] items-center justify-between gap-3 rounded-2xl bg-white/[0.02] px-4 py-3 transition ${dropZoneClass(zoneId)}`}
                                onDragOver={(event) => allowDropForType(event, 'frontDesk')}
                                onDragEnter={handleDragEnter(zoneId)}
                                onDragLeave={() => setActiveDropZone(null)}
                                onDrop={handleFrontDeskDrop(position.id, clinic.id)}
                              >
                                <div className="flex flex-col">
                                  <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">{clinic.name}</span>
                                  <span className="text-sm font-semibold text-white">
                                    {employee ? employee.name : 'Unassigned'}
                                  </span>
                                </div>
                                {employee && (
                                  <button
                                    type="button"
                                    draggable
                                    onDragStart={(event) => handleDragStart(event, {
                                      type: 'frontDesk',
                                      positionId: position.id,
                                      clinicId: clinic.id
                                    })}
                                    className="rounded-xl bg-primary-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-100 ring-1 ring-primary-500/40"
                                  >
                                    Drag
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 shadow-2xl shadow-primary-950/40 backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-primary-200/80">Clinical</p>
                  <h2 className="mt-1 text-2xl font-semibold text-white">Doctor&apos;s Schedule</h2>
                </div>
                <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-100">
                  Clinic Coverage
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-white/[0.03]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">Day</th>
                      {clinics.map((clinic) => (
                        <th
                          key={clinic.id}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.35em] text-slate-300"
                        >
                          {clinic.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-white/[0.01]">
                    {days.map((day) => (
                      <tr key={day.id}>
                        <th className="bg-white/[0.02] px-4 py-4 text-left text-sm font-semibold text-slate-100">
                          {day.name}
                        </th>
                        {clinics.map((clinic) => {
                          const assignment = doctorSchedule[day.id]?.[clinic.id] ?? null;
                          const zoneId = `doctor:${day.id}:${clinic.id}`;

                          return (
                            <td key={clinic.id} className="px-4 py-4">
                              <div
                                className={`flex min-h-[5rem] flex-col justify-between gap-3 rounded-2xl bg-white/[0.02] px-4 py-3 transition ${dropZoneClass(zoneId)}`}
                                onDragOver={(event) => allowDropForType(event, 'doctor')}
                                onDragEnter={handleDragEnter(zoneId)}
                                onDragLeave={() => setActiveDropZone(null)}
                                onDrop={handleDoctorDrop(day.id, clinic.id)}
                              >
                                <div>
                                  <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">{clinic.name}</span>
                                  <p className="mt-1 text-sm font-semibold text-white">
                                    {assignment ? assignment.name : 'Unassigned'}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                                    {assignment ? assignment.shift : '—'}
                                  </span>
                                  {assignment && (
                                    <button
                                      type="button"
                                      draggable
                                      onDragStart={(event) => handleDragStart(event, {
                                        type: 'doctor',
                                        dayId: day.id,
                                        clinicId: clinic.id
                                      })}
                                      className="rounded-xl bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-100 ring-1 ring-emerald-500/40"
                                    >
                                      Drag
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
