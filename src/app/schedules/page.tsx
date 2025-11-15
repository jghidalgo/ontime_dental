'use client';

import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FRONT_DESK_SCHEDULES, GET_DOCTOR_SCHEDULES } from '@/graphql/schedule-queries';
import { GET_CLINIC_LOCATION } from '@/graphql/queries';
import { 
  UPDATE_FRONT_DESK_SCHEDULE, 
  UPDATE_DOCTOR_SCHEDULE,
  SWAP_FRONT_DESK_ASSIGNMENTS,
  SWAP_DOCTOR_ASSIGNMENTS 
} from '@/graphql/schedule-mutations';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import SelectEmployeeModal from '@/components/schedules/SelectEmployeeModal';

type Clinic = { id: string; name: string };
type Employee = { id: string; name: string };

const frontDeskPositions = [
  { id: 'front-desk', name: 'Front Desk' },
  { id: 'assistant-1', name: 'Assistant 1' },
  { id: 'assistant-2', name: 'Assistant 2' }
];

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
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [editingFrontDeskCell, setEditingFrontDeskCell] = useState<
    { positionId: string; clinicId: string; name: string } | null
  >(null);
  const [editingDoctorCell, setEditingDoctorCell] = useState<
    { dayId: string; clinicId: string; name: string } | null
  >(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);
  const [currentDragPayload, setCurrentDragPayload] = useState<DragPayload | null>(null);
  
  // State for employee selection modal
  const [employeeSelectionModal, setEmployeeSelectionModal] = useState<{
    isOpen: boolean;
    type: 'frontDesk' | 'doctor';
    positionId?: string;
    dayId?: string;
    clinicId: string;
  } | null>(null);

  // Fetch clinics for the selected company
  const { data: clinicData, loading: clinicsLoading } = useQuery(GET_CLINIC_LOCATION, {
    variables: { companyId: selectedEntityId },
    skip: !selectedEntityId,
  });

  // Fetch schedules from GraphQL with companyId filter
  const { data: frontDeskData, refetch: refetchFrontDesk } = useQuery(GET_FRONT_DESK_SCHEDULES, {
    variables: { companyId: selectedEntityId },
    skip: !selectedEntityId,
  });
  const { data: doctorData, refetch: refetchDoctor } = useQuery(GET_DOCTOR_SCHEDULES, {
    variables: { companyId: selectedEntityId },
    skip: !selectedEntityId,
  });

  // Transform clinic data to match the expected format
  const clinics = useMemo<Clinic[]>(() => {
    if (!clinicData?.clinicLocation?.clinics) return [];
    return clinicData.clinicLocation.clinics.map((clinic: any) => ({
      id: clinic.clinicId,
      name: clinic.name
    }));
  }, [clinicData]);

  // Mutations
  const [updateFrontDeskMutation] = useMutation(UPDATE_FRONT_DESK_SCHEDULE);
  const [updateDoctorMutation] = useMutation(UPDATE_DOCTOR_SCHEDULE);
  const [swapFrontDeskMutation] = useMutation(SWAP_FRONT_DESK_ASSIGNMENTS);
  const [swapDoctorMutation] = useMutation(SWAP_DOCTOR_ASSIGNMENTS);

  // Transform GraphQL data to UI format
  const frontDeskSchedule = useMemo<FrontDeskSchedule>(() => {
    if (!frontDeskData?.frontDeskSchedules) return initialFrontDeskSchedule;
    
    const schedule: FrontDeskSchedule = {};
    frontDeskData.frontDeskSchedules.forEach((item: any) => {
      if (!schedule[item.positionId]) {
        schedule[item.positionId] = {};
      }
      schedule[item.positionId][item.clinicId] = item.employee;
    });
    
    return schedule;
  }, [frontDeskData]);

  const doctorSchedule = useMemo<DoctorSchedule>(() => {
    if (!doctorData?.doctorSchedules) return initialDoctorSchedule;
    
    const schedule: DoctorSchedule = {};
    doctorData.doctorSchedules.forEach((item: any) => {
      if (!schedule[item.dayId]) {
        schedule[item.dayId] = {};
      }
      schedule[item.dayId][item.clinicId] = item.doctor;
    });
    
    return schedule;
  }, [doctorData]);

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  const handleLogout = () => {
    window.localStorage.removeItem('ontime.authToken');
    window.localStorage.removeItem('ontime.userPermissions');
    router.push('/login');
  };

  const handleDragStart = (event: DragEvent<HTMLElement>, payload: DragPayload) => {
    event.dataTransfer.setData('application/json', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    setCurrentDragPayload(payload);
  };

  const handleDragEnd = () => {
    setCurrentDragPayload(null);
  };

  const allowDropForType = (event: DragEvent<HTMLElement>, type: DragPayload['type']) => {
    if (currentDragPayload?.type !== type) return;

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

  const handleFrontDeskDrop = (positionId: string, clinicId: string) => async (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    const payload = safeParsePayload(data);

    if (!payload || payload.type !== 'frontDesk') return;

    event.preventDefault();
    setActiveDropZone(null);
    setCurrentDragPayload(null);
    setEditingFrontDeskCell(null);

    // Call GraphQL mutation to swap assignments
    try {
      await swapFrontDeskMutation({
        variables: {
          sourcePositionId: payload.positionId,
          sourceClinicId: payload.clinicId,
          targetPositionId: positionId,
          targetClinicId: clinicId,
          companyId: selectedEntityId
        }
      });
      await refetchFrontDesk();
    } catch (error) {
      console.error('Error swapping front desk assignments:', error);
      alert('Failed to swap assignments. Please try again.');
    }
  };

  const handleDoctorDrop = (dayId: string, clinicId: string) => async (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData('application/json');
    const payload = safeParsePayload(data);

    if (!payload || payload.type !== 'doctor') return;

    event.preventDefault();
    setActiveDropZone(null);
    setCurrentDragPayload(null);
    setEditingDoctorCell(null);

    // Call GraphQL mutation to swap doctor assignments
    try {
      await swapDoctorMutation({
        variables: {
          sourceDayId: payload.dayId,
          sourceClinicId: payload.clinicId,
          targetDayId: dayId,
          targetClinicId: clinicId,
          companyId: selectedEntityId
        }
      });
      await refetchDoctor();
    } catch (error) {
      console.error('Error swapping doctor assignments:', error);
      alert('Failed to swap assignments. Please try again.');
    }
  };

  const handleStartFrontDeskEdit = (positionId: string, clinicId: string) => {
    const employee = frontDeskSchedule[positionId]?.[clinicId];
    if (!employee) return;

    setEditingFrontDeskCell({ positionId, clinicId, name: employee.name });
  };

  const handleFrontDeskNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEditingFrontDeskCell((previous) => (previous ? { ...previous, name: value } : previous));
  };

  const handleCancelFrontDeskEdit = () => {
    setEditingFrontDeskCell(null);
  };

  const handleSaveFrontDeskEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingFrontDeskCell) return;

    const { positionId, clinicId, name } = editingFrontDeskCell;
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert('Name cannot be empty');
      return;
    }

    const current = frontDeskSchedule[positionId]?.[clinicId];
    if (!current) return;

    try {
      await updateFrontDeskMutation({
        variables: {
          positionId,
          clinicId,
          companyId: selectedEntityId,
          employee: {
            id: current.id,
            name: trimmedName
          }
        }
      });
      await refetchFrontDesk();
      setEditingFrontDeskCell(null);
    } catch (error) {
      console.error('Error updating front desk schedule:', error);
      alert('Failed to update employee name. Please try again.');
    }
  };

  const handleDeleteFrontDeskCard = async (positionId: string, clinicId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      await updateFrontDeskMutation({
        variables: {
          positionId,
          clinicId,
          companyId: selectedEntityId,
          employee: null
        }
      });
      await refetchFrontDesk();
    } catch (error) {
      console.error('Error deleting front desk assignment:', error);
      alert('Failed to remove assignment. Please try again.');
    }
  };

  const handleStartDoctorEdit = (dayId: string, clinicId: string) => {
    const assignment = doctorSchedule[dayId]?.[clinicId];
    if (!assignment) return;

    setEditingDoctorCell({ dayId, clinicId, name: assignment.name });
  };

  const handleDoctorNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEditingDoctorCell((previous) => (previous ? { ...previous, name: value } : previous));
  };

  const handleCancelDoctorEdit = () => {
    setEditingDoctorCell(null);
  };

  const handleSaveDoctorEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!editingDoctorCell) return;

    const { dayId, clinicId, name } = editingDoctorCell;
    const trimmedName = name.trim();

    if (!trimmedName) {
      alert('Name cannot be empty');
      return;
    }

    const current = doctorSchedule[dayId]?.[clinicId];
    if (!current) return;

    try {
      await updateDoctorMutation({
        variables: {
          dayId,
          clinicId,
          companyId: selectedEntityId,
          doctor: {
            id: current.id,
            name: trimmedName,
            shift: current.shift
          }
        }
      });
      await refetchDoctor();
      setEditingDoctorCell(null);
    } catch (error) {
      console.error('Error updating doctor schedule:', error);
      alert('Failed to update doctor name. Please try again.');
    }
  };

  const handleDeleteDoctorCard = async (dayId: string, clinicId: string) => {
    if (!confirm('Are you sure you want to remove this assignment?')) return;

    try {
      await updateDoctorMutation({
        variables: {
          dayId,
          clinicId,
          companyId: selectedEntityId,
          doctor: null
        }
      });
      await refetchDoctor();
    } catch (error) {
      console.error('Error deleting doctor assignment:', error);
      alert('Failed to remove assignment. Please try again.');
    }
  };

  // Handler to open employee selection modal for front desk
  const handleSelectFrontDeskEmployee = (positionId: string, clinicId: string) => {
    setEmployeeSelectionModal({
      isOpen: true,
      type: 'frontDesk',
      positionId,
      clinicId
    });
  };

  // Handler to open employee selection modal for doctor
  const handleSelectDoctorEmployee = (dayId: string, clinicId: string) => {
    setEmployeeSelectionModal({
      isOpen: true,
      type: 'doctor',
      dayId,
      clinicId
    });
  };

  // Handler when employee is selected from modal
  const handleEmployeeSelected = async (employee: { id: string; name: string }) => {
    if (!employeeSelectionModal) return;

    try {
      if (employeeSelectionModal.type === 'frontDesk' && employeeSelectionModal.positionId) {
        // Assign employee to front desk position
        await updateFrontDeskMutation({
          variables: {
            positionId: employeeSelectionModal.positionId,
            clinicId: employeeSelectionModal.clinicId,
            companyId: selectedEntityId,
            employee: {
              id: employee.id,
              name: employee.name
            }
          }
        });
        await refetchFrontDesk();
      } else if (employeeSelectionModal.type === 'doctor' && employeeSelectionModal.dayId) {
        // Assign employee as doctor
        await updateDoctorMutation({
          variables: {
            dayId: employeeSelectionModal.dayId,
            clinicId: employeeSelectionModal.clinicId,
            companyId: selectedEntityId,
            doctor: {
              id: employee.id,
              name: employee.name,
              shift: 'AM' // Default shift
            }
          }
        });
        await refetchDoctor();
      }
      
      setEmployeeSelectionModal(null);
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Failed to assign employee. Please try again.');
    }
  };

  const handleDragEnter = (dropZoneId: string) => (event: DragEvent<HTMLDivElement>) => {
    if (!currentDragPayload) return;

    if (dropZoneId.startsWith('frontDesk') && currentDragPayload.type !== 'frontDesk') return;
    if (dropZoneId.startsWith('doctor') && currentDragPayload.type !== 'doctor') return;

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

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category="Operations"
            title="Schedules"
            // subtitle="Review staffing coverage for front desk and chair-side teams."
            showEntitySelector={true}
            entityLabel="Entity"
            selectedEntityId={selectedEntityId}
            onEntityChange={(id) => setSelectedEntityId(id)}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          {clinicsLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500"></div>
                <p className="text-slate-400">Loading clinics...</p>
              </div>
            </div>
          ) : clinics.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center shadow-2xl backdrop-blur-xl">
              <p className="text-lg text-slate-400">
                No clinics found for the selected company. Please select a different company or add clinics first.
              </p>
            </div>
          ) : (
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
                          const isEditingFrontDeskCell =
                            editingFrontDeskCell?.positionId === position.id &&
                            editingFrontDeskCell?.clinicId === clinic.id;

                          return (
                            <td key={clinic.id} className="px-4 py-4">
                              <div
                                className={`flex min-h-[4rem] items-center justify-between gap-3 rounded-2xl bg-white/[0.02] px-4 py-3 transition ${dropZoneClass(zoneId)}`}
                                onDragOver={(event) => allowDropForType(event, 'frontDesk')}
                                onDragEnter={handleDragEnter(zoneId)}
                                onDragLeave={() => setActiveDropZone(null)}
                                onDrop={handleFrontDeskDrop(position.id, clinic.id)}
                              >
                                {isEditingFrontDeskCell ? (
                                  <form onSubmit={handleSaveFrontDeskEdit} className="flex w-full items-center gap-3">
                                    <div className="flex flex-1 flex-col">
                                      <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">
                                        {clinic.name}
                                      </span>
                                      <input
                                        autoFocus
                                        value={editingFrontDeskCell?.name ?? ''}
                                        onChange={handleFrontDeskNameChange}
                                        className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-primary-400/60 focus:outline-none focus:ring-2 focus:ring-primary-400/40"
                                        placeholder="Enter name"
                                      />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="submit"
                                        className="rounded-xl bg-primary-500/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={handleCancelFrontDeskEdit}
                                        className="rounded-xl bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/10"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    <div
                                      className={`flex flex-col ${employee ? 'cursor-text' : 'cursor-pointer'}`}
                                      onDoubleClick={() => employee && handleStartFrontDeskEdit(position.id, clinic.id)}
                                      onClick={() => !employee && handleSelectFrontDeskEmployee(position.id, clinic.id)}
                                      title={employee ? 'Double-click to edit name' : 'Click to assign employee'}
                                    >
                                      <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">
                                        {clinic.name}
                                      </span>
                                      <span className={`text-sm font-semibold ${employee ? 'text-white' : 'text-slate-500'}`}>
                                        {employee ? employee.name : 'Unassigned'}
                                      </span>
                                    </div>
                                    {employee && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          draggable
                                          onDragStart={(event) =>
                                            handleDragStart(event, {
                                              type: 'frontDesk',
                                              positionId: position.id,
                                              clinicId: clinic.id
                                            })
                                          }
                                          onDragEnd={handleDragEnd}
                                          aria-label="Drag to reassign"
                                          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl bg-primary-500/15 text-primary-200 ring-1 ring-primary-500/40 transition hover:bg-primary-500/25 active:cursor-grabbing"
                                          title="Drag to reassign"
                                        >
                                          <span className="sr-only">Drag to reassign</span>
                                          <svg
                                            aria-hidden="true"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                          >
                                            <circle cx="7" cy="5" r="1.5" />
                                            <circle cx="13" cy="5" r="1.5" />
                                            <circle cx="7" cy="10" r="1.5" />
                                            <circle cx="13" cy="10" r="1.5" />
                                            <circle cx="7" cy="15" r="1.5" />
                                            <circle cx="13" cy="15" r="1.5" />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteFrontDeskCard(position.id, clinic.id)}
                                          aria-label="Delete assignment"
                                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f69907]/15 text-[#f69907] ring-1 ring-[#f69907]/40 transition hover:bg-[#f69907]/30"
                                          title="Delete assignment"
                                        >
                                          <span className="sr-only">Delete assignment</span>
                                          <svg
                                            aria-hidden="true"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                          >
                                            <path
                                              d="M3 5h14M8 5V3h4v2m-5 0v9m4-9v9m-7-9v11a1 1 0 001 1h8a1 1 0 001-1V5"
                                              stroke="currentColor"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    )}
                                  </>
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
                          const isEditingDoctorCell =
                            editingDoctorCell?.dayId === day.id && editingDoctorCell?.clinicId === clinic.id;

                          return (
                            <td key={clinic.id} className="px-4 py-4">
                              <div
                                className={`flex min-h-[5rem] flex-col justify-between gap-3 rounded-2xl bg-white/[0.02] px-4 py-3 transition ${dropZoneClass(zoneId)}`}
                                onDragOver={(event) => allowDropForType(event, 'doctor')}
                                onDragEnter={handleDragEnter(zoneId)}
                                onDragLeave={() => setActiveDropZone(null)}
                                onDrop={handleDoctorDrop(day.id, clinic.id)}
                              >
                                {isEditingDoctorCell ? (
                                  <form onSubmit={handleSaveDoctorEdit} className="flex h-full flex-col justify-between gap-3">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">
                                        {clinic.name}
                                      </span>
                                      <input
                                        autoFocus
                                        value={editingDoctorCell?.name ?? ''}
                                        onChange={handleDoctorNameChange}
                                        className="mt-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                                        placeholder="Enter name"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                                        {assignment ? assignment.shift : '—'}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="submit"
                                          className="rounded-xl bg-emerald-500/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400"
                                        >
                                          Save
                                        </button>
                                        <button
                                          type="button"
                                          onClick={handleCancelDoctorEdit}
                                          className="rounded-xl bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-200 transition hover:bg-white/10"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    <div
                                      className={`flex flex-col ${assignment ? 'cursor-text' : 'cursor-pointer'}`}
                                      onDoubleClick={() => assignment && handleStartDoctorEdit(day.id, clinic.id)}
                                      onClick={() => !assignment && handleSelectDoctorEmployee(day.id, clinic.id)}
                                      title={assignment ? 'Double-click to edit name' : 'Click to assign doctor'}
                                    >
                                      <span className="text-[10px] uppercase tracking-[0.35em] text-primary-200/70">{clinic.name}</span>
                                      <p className={`mt-1 text-sm font-semibold ${assignment ? 'text-white' : 'text-slate-500'}`}>
                                        {assignment ? assignment.name : 'Unassigned'}
                                      </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                                        {assignment ? assignment.shift : '—'}
                                      </span>
                                      {assignment && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <button
                                            type="button"
                                            draggable
                                            onDragStart={(event) =>
                                              handleDragStart(event, {
                                                type: 'doctor',
                                                dayId: day.id,
                                                clinicId: clinic.id
                                              })
                                            }
                                            onDragEnd={handleDragEnd}
                                            aria-label="Drag to reassign"
                                            className="flex h-8 w-8 cursor-grab items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500/25 active:cursor-grabbing"
                                            title="Drag to reassign"
                                          >
                                            <span className="sr-only">Drag to reassign</span>
                                            <svg
                                              aria-hidden="true"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                            >
                                              <circle cx="7" cy="5" r="1.5" />
                                              <circle cx="13" cy="5" r="1.5" />
                                              <circle cx="7" cy="10" r="1.5" />
                                              <circle cx="13" cy="10" r="1.5" />
                                              <circle cx="7" cy="15" r="1.5" />
                                              <circle cx="13" cy="15" r="1.5" />
                                            </svg>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteDoctorCard(day.id, clinic.id)}
                                            aria-label="Delete assignment"
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f69907]/15 text-[#f69907] ring-1 ring-[#f69907]/40 transition hover:bg-[#f69907]/30"
                                            title="Delete assignment"
                                          >
                                            <span className="sr-only">Delete assignment</span>
                                            <svg
                                              aria-hidden="true"
                                              viewBox="0 0 20 20"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                            >
                                              <path
                                                d="M3 5h14M8 5V3h4v2m-5 0v9m4-9v9m-7-9v11a1 1 0 001 1h8a1 1 0 001-1V5"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </>
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
          </section>
          )}
        </main>
      </div>

      {/* Employee Selection Modal */}
      <SelectEmployeeModal
        isOpen={employeeSelectionModal?.isOpen ?? false}
        onClose={() => setEmployeeSelectionModal(null)}
        onSelect={handleEmployeeSelected}
        title={
          employeeSelectionModal?.type === 'frontDesk'
            ? 'Select Front Desk Employee'
            : 'Select Doctor'
        }
        companyId={selectedEntityId}
        positionFilter={employeeSelectionModal?.type === 'doctor' ? 'Dentist' : undefined}
        excludePosition={employeeSelectionModal?.type === 'frontDesk' ? 'Dentist' : undefined}
      />
    </div>
  );
}
