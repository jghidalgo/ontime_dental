'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTION_BOARD_CASES } from '@/graphql/production-board-queries';
import { GET_USERS } from '@/graphql/user-queries';
import { GET_COMPANIES } from '@/graphql/company-queries';
import { useTranslations } from '@/lib/i18n';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import clsx from 'clsx';

type ProductionStage = 'design' | 'printing' | 'milling' | 'finishing' | 'qc' | 'packaging';

type StageInfo = {
  id: ProductionStage;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

type LabCase = {
  id: string;
  caseId: string;
  patientFirstName: string;
  patientLastName: string;
  procedure: string;
  priority: 'normal' | 'rush' | 'urgent';
  productionStage?: ProductionStage;
  technician?: string;
  technicianId?: string;
  estimatedCompletion?: string;
  clinic: string;
  status: string;
  category: string;
  toothNumbers?: string[];
  qrCode?: string;
};

type TechnicianWorkload = {
  id: string;
  name: string;
  activeCases: number;
  stages: Record<ProductionStage, number>;
  capacity: number;
  utilization: number;
};

const stages: StageInfo[] = [
  {
    id: 'design',
    label: 'Design',
    icon: '🎨',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'printing',
    label: '3D Printing',
    icon: '🖨️',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    id: 'milling',
    label: 'Milling',
    icon: '⚙️',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  {
    id: 'finishing',
    label: 'Finishing',
    icon: '✨',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30'
  },
  {
    id: 'qc',
    label: 'Quality Check',
    icon: '🔍',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  {
    id: 'packaging',
    label: 'Packaging',
    icon: '📦',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  }
];

export default function ProductionBoardPage() {
  const { t } = useTranslations();
  const [selectedEntityId, setSelectedEntityId] = useState<string>('complete-dental-solutions');
  const [selectedStage, setSelectedStage] = useState<ProductionStage | 'all'>('all');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'technician'>('kanban');

  // Fetch companies for selector
  const { data: companiesData } = useQuery(GET_COMPANIES);

  // Fetch production board cases
  const { data: labCasesData, loading: loadingCases } = useQuery(GET_PRODUCTION_BOARD_CASES, {
    variables: { companyId: selectedEntityId },
  });

  // Fetch technicians
  const { data: usersData, loading: loadingUsers } = useQuery(GET_USERS, {
    variables: { companyId: selectedEntityId },
  });

  // Get cases from the query (already filtered to in-production status)
  const productionCases = useMemo(() => {
    if (!labCasesData?.productionBoardCases) return [];
    return labCasesData.productionBoardCases;
  }, [labCasesData]);

  // Cases already have productionStage from backend, no need to simulate
  const casesWithStages = useMemo(() => {
    return productionCases.map((labCase: LabCase) => ({
      ...labCase,
      stage: labCase.productionStage || 'design' // Default to design if no stage set
    }));
  }, [productionCases]);

  // Get technicians
  const technicians = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.filter((u: any) => u.role === 'technician' || u.role === 'lab-manager');
  }, [usersData]);

  // Calculate technician workload
  const technicianWorkload = useMemo((): TechnicianWorkload[] => {
    const workloadMap = new Map<string, TechnicianWorkload>();

    // Initialize technicians
    technicians.forEach((tech: any) => {
      workloadMap.set(tech.id, {
        id: tech.id,
        name: tech.name,
        activeCases: 0,
        stages: {
          design: 0,
          printing: 0,
          milling: 0,
          finishing: 0,
          qc: 0,
          packaging: 0
        },
        capacity: 10, // Default capacity
        utilization: 0
      });
    });

    // Count cases per technician
    casesWithStages.forEach((labCase: any) => {
      if (labCase.technicianId) {
        const workload = workloadMap.get(labCase.technicianId);
        if (workload) {
          workload.activeCases++;
          workload.stages[labCase.stage as ProductionStage]++;
          workload.utilization = (workload.activeCases / workload.capacity) * 100;
        }
      }
    });

    return Array.from(workloadMap.values()).sort((a, b) => b.activeCases - a.activeCases);
  }, [casesWithStages, technicians]);

  // Filter cases by selected filters
  const filteredCases = useMemo(() => {
    let filtered = casesWithStages;

    if (selectedStage !== 'all') {
      filtered = filtered.filter((c: any) => c.stage === selectedStage);
    }

    if (selectedTechnician !== 'all') {
      filtered = filtered.filter((c: any) => c.technicianId === selectedTechnician);
    }

    return filtered;
  }, [casesWithStages, selectedStage, selectedTechnician]);

  // Group cases by stage for kanban view
  const casesByStage = useMemo(() => {
    const grouped: Record<ProductionStage, any[]> = {
      design: [],
      printing: [],
      milling: [],
      finishing: [],
      qc: [],
      packaging: []
    };

    filteredCases.forEach((labCase: any) => {
      grouped[labCase.stage as ProductionStage].push(labCase);
    });

    return grouped;
  }, [filteredCases]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'rush':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-400';
    if (utilization >= 70) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (loadingCases || loadingUsers) {
    return (
      <main className="min-h-screen bg-slate-950">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('Laboratory')}
            title={t('Production Board')}
            subtitle={t('Real-time work-in-progress tracking by stage and technician')}
          />
          <TopNavigation />
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-slate-400">{t('Loading production data...')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <PageHeader
          category={t('Laboratory')}
          title={t('Production Board')}
          subtitle={t('Real-time work-in-progress tracking by stage and technician')}
          showEntitySelector={true}
          entityLabel={t('Company')}
          selectedEntityId={selectedEntityId}
          onEntityChange={(id) => setSelectedEntityId(id)}
        />
        <TopNavigation />
      </div>

      <div className="relative mx-auto w-full max-w-[120rem]">
        <div className="mx-auto w-full max-w-7xl px-6 py-10">
        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{t('In Production')}</p>
                <p className="mt-2 text-3xl font-bold text-white">{productionCases.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                🏭
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{t('Active cases in workflow')}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{t('Active Technicians')}</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {technicianWorkload.filter(t => t.activeCases > 0).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                👥
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {t('of')} {technicians.length} {t('total technicians')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{t('Rush Cases')}</p>
                <p className="mt-2 text-3xl font-bold text-amber-400">
                  {productionCases.filter((c: LabCase) => c.priority === 'rush' || c.priority === 'urgent').length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl">
                ⚡
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{t('Requiring priority attention')}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">{t('Avg Completion')}</p>
                <p className="mt-2 text-3xl font-bold text-white">2.4d</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                ⏱️
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">{t('Average turnaround time')}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/40 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={clsx(
                'rounded-md px-4 py-2 text-sm font-medium transition',
                viewMode === 'kanban'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {t('Kanban View')}
            </button>
            <button
              onClick={() => setViewMode('technician')}
              className={clsx(
                'rounded-md px-4 py-2 text-sm font-medium transition',
                viewMode === 'technician'
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              {t('Technician View')}
            </button>
          </div>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as ProductionStage | 'all')}
            className="rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="all">{t('All Stages')}</option>
            {stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.icon} {t(stage.label)}
              </option>
            ))}
          </select>

          {/* Technician Filter */}
          <select
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm text-white focus:border-primary-500 focus:outline-none"
          >
            <option value="all">{t('All Technicians')}</option>
            {technicians.map((tech: any) => (
              <option key={tech.id} value={tech.id}>
                {tech.name}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-slate-400">
            {filteredCases.length} {t('cases shown')}
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
            {stages.map((stage) => {
              const stageCases = casesByStage[stage.id];
              return (
                <div key={stage.id} className="flex flex-col">
                  {/* Stage Header */}
                  <div className={clsx(
                    'mb-4 rounded-xl border p-4',
                    stage.bgColor,
                    stage.borderColor
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{stage.icon}</span>
                        <div>
                          <h3 className={clsx('font-semibold', stage.color)}>
                            {t(stage.label)}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {stageCases.length} {t('cases')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cases */}
                  <div className="flex-1 space-y-3">
                    {stageCases.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/20 p-6 text-center">
                        <p className="text-sm text-slate-500">{t('No cases')}</p>
                      </div>
                    ) : (
                      stageCases.map((labCase: any) => (
                        <div
                          key={labCase.id}
                          className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-primary-500/50 hover:bg-slate-800/60"
                        >
                          {/* Priority Badge */}
                          <div className="mb-2 flex items-center gap-2">
                            <span className={clsx(
                              'inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold',
                              getPriorityColor(labCase.priority)
                            )}>
                              {labCase.priority === 'urgent' && '🔴'}
                              {labCase.priority === 'rush' && '⚡'}
                              {t(labCase.priority)}
                            </span>
                          </div>

                          {/* Case ID */}
                          <p className="mb-1 font-mono text-xs font-semibold text-primary-400">
                            {labCase.caseId}
                          </p>

                          {/* Patient Name */}
                          <p className="mb-2 font-semibold text-white">
                            {labCase.patientFirstName} {labCase.patientLastName}
                          </p>

                          {/* Procedure */}
                          <p className="mb-3 text-sm text-slate-400">
                            {labCase.procedure}
                          </p>

                          {/* Technician */}
                          {labCase.technician && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span>👤</span>
                              <span>{labCase.technician}</span>
                            </div>
                          )}

                          {/* Tooth Numbers */}
                          {labCase.toothNumbers && labCase.toothNumbers.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {labCase.toothNumbers.slice(0, 3).map((tooth: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400"
                                >
                                  #{tooth}
                                </span>
                              ))}
                              {labCase.toothNumbers.length > 3 && (
                                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-slate-400">
                                  +{labCase.toothNumbers.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Clinic */}
                          <div className="mt-3 border-t border-slate-800 pt-2">
                            <p className="text-xs text-slate-500">{labCase.clinic}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Technician View */}
        {viewMode === 'technician' && (
          <div className="space-y-4">
            {technicianWorkload.map((workload) => (
              <div
                key={workload.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-purple-500 text-xl font-bold text-white">
                      {workload.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{workload.name}</h3>
                      <p className="text-sm text-slate-400">
                        {workload.activeCases} {t('active cases')} · {workload.capacity} {t('capacity')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={clsx(
                      'text-2xl font-bold',
                      getUtilizationColor(workload.utilization)
                    )}>
                      {workload.utilization.toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">{t('Utilization')}</p>
                  </div>
                </div>

                {/* Utilization Bar */}
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all',
                      workload.utilization >= 90 ? 'bg-red-500' :
                      workload.utilization >= 70 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    )}
                    style={{ width: `${Math.min(workload.utilization, 100)}%` }}
                  />
                </div>

                {/* Stage Distribution */}
                <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
                  {stages.map((stage) => (
                    <div
                      key={stage.id}
                      className={clsx(
                        'rounded-lg border p-3 text-center',
                        stage.bgColor,
                        stage.borderColor
                      )}
                    >
                      <div className="mb-1 text-xl">{stage.icon}</div>
                      <div className={clsx('text-2xl font-bold', stage.color)}>
                        {workload.stages[stage.id]}
                      </div>
                      <div className="text-xs text-slate-500">{t(stage.label)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {technicianWorkload.length === 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
                <p className="text-slate-400">{t('No technicians assigned to cases')}</p>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
