'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';
import { useQuery, useMutation } from '@apollo/client';
import { GET_TRANSIT_CASES, GET_TRANSIT_ROUTES, UPDATE_TRANSIT_STATUS } from '@/graphql/transit-queries';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';

type TransitStatus = 'pending-pickup' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'failed-delivery';

type TransitHistoryEntry = {
  timestamp: string;
  location: string;
  status: string;
  notes?: string;
};

type TransitCase = {
  id: string;
  caseId: string;
  companyId: string;
  clinic: string;
  clinicId?: string;
  lab: string;
  patientFirstName: string;
  patientLastName: string;
  procedure: string;
  priority: 'normal' | 'rush' | 'urgent';
  status: string;
  transitStatus?: TransitStatus;
  courierService?: string;
  trackingNumber?: string;
  pickupDate?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  routeId?: string;
  currentLocation?: string;
  deliveryNotes?: string;
  signedBy?: string;
  transitHistory?: TransitHistoryEntry[];
  createdAt: string;
};

type TransitRoute = {
  routeId: string;
  companyId: string;
  routeName: string;
  region?: string;
  totalCases: number;
  clinics: string[];
  estimatedDeparture?: string;
  estimatedArrival?: string;
  status: string;
  courierService?: string;
  cases: TransitCase[];
};

type ViewMode = 'cases' | 'routes' | 'map';

export default function TransitTrackingPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [canSwitchEntity, setCanSwitchEntity] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cases');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<TransitCase | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Auth check - only run once on mount
  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const user = getUserSession();
    if (!user || !hasModuleAccess(user, 'laboratory')) {
      router.push('/dashboard');
      return;
    }

    const isAdmin = user.role === 'admin';
    setCanSwitchEntity(isAdmin);
    if (!isAdmin) {
      setSelectedEntityId(user.companyId || '');
      return;
    }

    if (!selectedEntityId) {
      setSelectedEntityId(user.companyId || 'complete-dental-solutions');
    }
  }, [router]);

  // Query transit cases
  const { data: casesData, loading: casesLoading, refetch: refetchCases } = useQuery(GET_TRANSIT_CASES, {
    variables: {
      companyId: selectedEntityId,
      transitStatus: selectedStatus === 'all' ? undefined : selectedStatus
    },
    skip: !selectedEntityId
  });

  // Query transit routes
  const { data: routesData, loading: routesLoading, refetch: refetchRoutes } = useQuery(GET_TRANSIT_ROUTES, {
    variables: { companyId: selectedEntityId },
    skip: !selectedEntityId || viewMode !== 'routes'
  });

  // Update transit status mutation
  const [updateTransitStatus] = useMutation(UPDATE_TRANSIT_STATUS, {
    onCompleted: () => {
      refetchCases();
      refetchRoutes();
      setShowUpdateModal(false);
      setSelectedCase(null);
    }
  });

  const cases: TransitCase[] = casesData?.transitCases || [];
  const routes: TransitRoute[] = routesData?.transitRoutes || [];

  // Calculate metrics
  const totalCases = cases.length;
  const pendingPickup = cases.filter(c => c.transitStatus === 'pending-pickup').length;
  const inTransit = cases.filter(c => c.transitStatus === 'in-transit' || c.transitStatus === 'picked-up').length;
  const outForDelivery = cases.filter(c => c.transitStatus === 'out-for-delivery').length;
  const delivered = cases.filter(c => c.transitStatus === 'delivered').length;
  const urgent = cases.filter(c => c.priority === 'urgent').length;

  const getStatusColor = (status?: TransitStatus): string => {
    switch (status) {
      case 'pending-pickup':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'picked-up':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'in-transit':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'out-for-delivery':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border-green-500/40';
      case 'failed-delivery':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400';
      case 'rush':
        return 'text-orange-400';
      default:
        return 'text-slate-400';
    }
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateETA = (estimatedDelivery?: string): string => {
    if (!estimatedDelivery) return 'TBD';
    const eta = new Date(estimatedDelivery).getTime() - Date.now();
    if (eta < 0) return 'Overdue';
    const hours = Math.floor(eta / (1000 * 60 * 60));
    const minutes = Math.floor((eta % (1000 * 60 * 60)) / (1000 * 60));
    if (hours < 1) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  const handleUpdateStatus = (newStatus: TransitStatus, location?: string, notes?: string) => {
    if (!selectedCase) return;
    
    updateTransitStatus({
      variables: {
        id: selectedCase.id,
        transitStatus: newStatus,
        location,
        notes
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <PageHeader
          category={t('Laboratory')}
          title={t('Transit Tracking')}
          subtitle={t('Monitor deliveries, track routes, and manage shipments in real-time')}
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
        {selectedEntityId ? (
          <>
            {/* Metrics */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total Cases
                </div>
                <div className="mt-2 text-3xl font-bold text-white">{totalCases}</div>
                <div className="mt-1 text-xs text-slate-500">Active shipments</div>
              </div>

              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-yellow-400">
                  Pending Pickup
                </div>
                <div className="mt-2 text-3xl font-bold text-yellow-300">{pendingPickup}</div>
                <div className="mt-1 text-xs text-yellow-600">Awaiting courier</div>
              </div>

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-purple-400">
                  In Transit
                </div>
                <div className="mt-2 text-3xl font-bold text-purple-300">{inTransit}</div>
                <div className="mt-1 text-xs text-purple-600">On the way</div>
              </div>

              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  Out for Delivery
                </div>
                <div className="mt-2 text-3xl font-bold text-cyan-300">{outForDelivery}</div>
                <div className="mt-1 text-xs text-cyan-600">Final mile</div>
              </div>

              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-green-400">
                  Delivered
                </div>
                <div className="mt-2 text-3xl font-bold text-green-300">{delivered}</div>
                <div className="mt-1 text-xs text-green-600">Completed</div>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
                <div className="text-xs font-medium uppercase tracking-wider text-red-400">
                  Urgent
                </div>
                <div className="mt-2 text-3xl font-bold text-red-300">{urgent}</div>
                <div className="mt-1 text-xs text-red-600">Priority delivery</div>
              </div>
            </div>

            {/* View Mode and Filters */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cases')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                    viewMode === 'cases'
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  📦 Cases View
                </button>
                <button
                  onClick={() => setViewMode('routes')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                    viewMode === 'routes'
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  🚚 Routes View
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-medium transition',
                    viewMode === 'map'
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  )}
                >
                  🗺️ Map View
                </button>
              </div>

              {viewMode === 'cases' && (
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white backdrop-blur-sm focus:border-primary-500/40 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending-pickup">Pending Pickup</option>
                  <option value="picked-up">Picked Up</option>
                  <option value="in-transit">In Transit</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed-delivery">Failed Delivery</option>
                </select>
              )}
            </div>

            {/* Content Area */}
            <div className="mt-8">
              {viewMode === 'cases' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  {casesLoading && (
                    <div className="flex items-center justify-center py-24">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500"></div>
                    </div>
                  )}
                  {!casesLoading && cases.length === 0 && (
                    <div className="py-24 text-center">
                      <div className="text-6xl opacity-20">📦</div>
                      <p className="mt-4 text-slate-400">No cases in transit</p>
                    </div>
                  )}
                  {!casesLoading && cases.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Case ID
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Patient
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Clinic
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Procedure
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Location
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              ETA
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Courier
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {cases.map((caseItem) => (
                            <tr
                              key={caseItem.id}
                              className="group transition hover:bg-white/5"
                            >
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className={clsx('text-sm font-mono font-medium', getPriorityColor(caseItem.priority))}>
                                    {caseItem.caseId}
                                  </span>
                                  {caseItem.priority === 'urgent' && (
                                    <span className="inline-flex items-center rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                                      🔥 Urgent
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-white">
                                  {caseItem.patientFirstName} {caseItem.patientLastName}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-slate-300">{caseItem.clinic}</div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-slate-300">{caseItem.procedure}</div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <span className={clsx(
                                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                                  getStatusColor(caseItem.transitStatus)
                                )}>
                                  {caseItem.transitStatus?.replaceAll('-', ' ').toUpperCase() || 'UNKNOWN'}
                                </span>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-slate-300">
                                  {caseItem.currentLocation || '-'}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm font-medium text-cyan-400">
                                  {calculateETA(caseItem.estimatedDelivery)}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {formatDateTime(caseItem.estimatedDelivery)}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="text-sm text-slate-300">
                                  {caseItem.courierService || '-'}
                                </div>
                                {caseItem.trackingNumber && (
                                  <div className="text-xs text-slate-500 font-mono">
                                    {caseItem.trackingNumber}
                                  </div>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                <button
                                  onClick={() => {
                                    setSelectedCase(caseItem);
                                    setShowUpdateModal(true);
                                  }}
                                  className="rounded-lg border border-primary-500/40 bg-primary-500/20 px-3 py-1 text-xs font-medium text-primary-300 transition hover:bg-primary-500/30"
                                >
                                  Update
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {viewMode === 'routes' && (
                <div className="space-y-6">
                  {routesLoading && (
                    <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-24 backdrop-blur-sm">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500/30 border-t-primary-500"></div>
                    </div>
                  )}
                  {!routesLoading && routes.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 py-24 text-center backdrop-blur-sm">
                      <div className="text-6xl opacity-20">🚚</div>
                      <p className="mt-4 text-slate-400">No active routes</p>
                    </div>
                  )}
                  {!routesLoading && routes.length > 0 && (
                    routes.map((route) => (
                      <div
                        key={route.routeId}
                        className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white">{route.routeName}</h3>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-400">
                              <span>🚚 {route.courierService || 'Unknown Courier'}</span>
                              <span>📍 {route.region || 'Unknown Region'}</span>
                              <span>📦 {route.totalCases} cases</span>
                              <span>🏥 {route.clinics.length} clinics</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="rounded-lg border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs font-medium uppercase text-primary-300">
                              {route.status}
                            </div>
                            {route.estimatedArrival && (
                              <div className="mt-2 text-sm text-cyan-400">
                                ETA: {formatDateTime(route.estimatedArrival)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {route.cases.map((caseItem) => (
                            <div
                              key={caseItem.id}
                              className="rounded-xl border border-white/5 bg-white/5 p-4"
                            >
                              <div className="flex items-center justify-between">
                                <span className={clsx('text-sm font-mono font-medium', getPriorityColor(caseItem.priority))}>
                                  {caseItem.caseId}
                                </span>
                                <span className={clsx(
                                  'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                                  getStatusColor(caseItem.transitStatus)
                                )}>
                                  {caseItem.transitStatus?.replaceAll('-', ' ') || 'Unknown'}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-slate-300">{caseItem.clinic}</div>
                              <div className="mt-1 text-xs text-slate-500">{caseItem.procedure}</div>
                              {caseItem.currentLocation && (
                                <div className="mt-2 text-xs text-slate-400">
                                  📍 {caseItem.currentLocation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-4">
                          <div className="text-xs text-slate-500">
                            Delivering to: {route.clinics.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {viewMode === 'map' && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-24 text-center backdrop-blur-sm">
                  <div className="text-6xl opacity-20">🗺️</div>
                  <p className="mt-4 text-lg text-slate-300">Interactive Map View</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Map integration with real-time tracking coming soon
                  </p>
                  <div className="mt-8 inline-flex gap-4">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                      🛰️ GPS Tracking
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                      📍 Geofencing
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-400">
                      🚦 Traffic Updates
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/10 px-6 py-4">
              <span className="text-lg text-primary-300">
                👆 Please select a company to view transit tracking
              </span>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showUpdateModal && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Update Transit Status - {selectedCase.caseId}
              </h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedCase(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-slate-300">Patient</div>
                <div className="mt-1 text-white">
                  {selectedCase.patientFirstName} {selectedCase.patientLastName}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-300">Current Status</div>
                <div className="mt-1">
                  <span className={clsx(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                    getStatusColor(selectedCase.transitStatus)
                  )}>
                    {selectedCase.transitStatus?.replaceAll('-', ' ').toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-slate-300 mb-2">Update to:</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('pending-pickup')}
                    className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300 transition hover:bg-yellow-500/20"
                  >
                    Pending Pickup
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('picked-up')}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm font-medium text-blue-300 transition hover:bg-blue-500/20"
                  >
                    Picked Up
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('in-transit')}
                    className="rounded-lg border border-purple-500/40 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
                  >
                    In Transit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('out-for-delivery')}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    Out for Delivery
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('delivered')}
                    className="rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-300 transition hover:bg-green-500/20"
                  >
                    Delivered
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('failed-delivery')}
                    className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                  >
                    Failed Delivery
                  </button>
                </div>
              </div>

              {selectedCase.transitHistory && selectedCase.transitHistory.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-slate-300 mb-2">Transit History</div>
                  <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-4">
                    {selectedCase.transitHistory.map((entry) => (
                      <div key={entry.timestamp} className="flex items-start gap-3 text-xs">
                        <div className="flex-shrink-0 text-slate-500">
                          {formatDateTime(entry.timestamp)}
                        </div>
                        <div className="flex-1">
                          <div className="text-white">{entry.status}</div>
                          <div className="text-slate-400">{entry.location}</div>
                          {entry.notes && (
                            <div className="mt-1 text-slate-500">{entry.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
