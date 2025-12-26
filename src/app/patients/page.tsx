'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useTranslations } from '@/lib/i18n';
import { GET_PATIENTS, GET_LAB_CASES } from '@/graphql/patient-queries';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { getUserSession } from '@/lib/permissions';

type PatientRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthday: string;
  address: string;
  city: string;
  state: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  totalCases: number;
  lastVisit?: string;
  status: 'active' | 'inactive';
};

export default function PatientsPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState<string>('');
  const [selectedEntityId, setSelectedEntityId] = useState('complete-dental-solutions');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Get user session to determine company filtering
    const user = getUserSession();
    if (user) {
      setUserName(user.name);
      const userIsAdmin = user.role === 'admin' || user.role === 'manager';
      setIsAdmin(userIsAdmin);
      
      // For non-admin users, filter by their company
      if (!userIsAdmin && user.companyId) {
        setUserCompanyId(user.companyId);
        setSelectedEntityId(user.companyId);
      }
    }
  }, [router]);

  const { data: patientsData, loading: loadingPatients } = useQuery(GET_PATIENTS, {
    variables: { companyId: userCompanyId },
    skip: !isAdmin && !userCompanyId, // Skip query if non-admin without companyId
  });

  const { data: labCasesData } = useQuery(GET_LAB_CASES, {
    variables: { companyId: userCompanyId },
    skip: !isAdmin && !userCompanyId,
  });

  const patientRecords = useMemo(() => {
    if (!patientsData?.patients) return [];
    
    const casesByPatient = (labCasesData?.labCases || []).reduce((acc: any, labCase: any) => {
      if (!acc[labCase.patientId]) {
        acc[labCase.patientId] = [];
      }
      acc[labCase.patientId].push(labCase);
      return acc;
    }, {});

    return patientsData.patients.map((patient: any) => {
      const patientCases = casesByPatient[patient.id] || [];
      const sortedCases = patientCases.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
        birthday: patient.birthday,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        insuranceProvider: patient.insuranceProvider,
        insuranceNumber: patient.insuranceNumber,
        totalCases: patientCases.length,
        lastVisit: sortedCases[0]?.createdAt,
        status: patientCases.length > 0 && 
                sortedCases[0] && 
                new Date(sortedCases[0].createdAt) > new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) 
                ? 'active' 
                : 'inactive'
      } as PatientRecord;
    });
  }, [patientsData, labCasesData]);

  const filteredPatients = useMemo(() => {
    return patientRecords.filter(patient => {
      const matchesSearch = searchQuery === '' || 
        patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone.includes(searchQuery);
      
      const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [patientRecords, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = patientRecords.length;
    const active = patientRecords.filter(p => p.status === 'active').length;
    const inactive = patientRecords.filter(p => p.status === 'inactive').length;
    const totalCases = patientRecords.reduce((sum, p) => sum + p.totalCases, 0);
    
    return { total, active, inactive, totalCases };
  }, [patientRecords]);

  const patientCases = useMemo(() => {
    if (!selectedPatient || !labCasesData?.labCases) return [];
    return labCasesData.labCases
      .filter((labCase: any) => labCase.patientId === selectedPatient.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedPatient, labCasesData]);

  const handleViewDetails = (patient: PatientRecord) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-gradient-to-br from-primary-500 to-primary-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-rose-500 to-rose-600',
      'bg-gradient-to-br from-amber-500 to-amber-600',
    ];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const caseStatusColors: Record<string, string> = {
    'in-planning': 'bg-slate-500/20 text-slate-300 border-slate-400/40',
    'in-production': 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    'in-transit': 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    'completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('Patient Management')}
            title={t('Patients')}
            subtitle={t('Manage patient records and view treatment history')}
            showEntitySelector={true}
            entityLabel={t('Entity')}
            selectedEntityId={selectedEntityId}
            onEntityChange={setSelectedEntityId}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <div className="space-y-8">
            {/* Header Actions */}
            <div className="flex justify-end">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('Add Patient')}
              </button>
            </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('Total Patients')}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-primary-500/10 p-3">
                <svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('Active Patients')}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-400">{stats.active}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-3">
                <svg className="h-6 w-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('Inactive')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-400">{stats.inactive}</p>
              </div>
              <div className="rounded-xl bg-slate-500/10 p-3">
                <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">{t('Total Cases')}</p>
                <p className="mt-2 text-3xl font-bold text-blue-400">{stats.totalCases}</p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-3">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search by name, email, or phone...')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 transition focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm font-medium transition',
                  filterStatus === 'all'
                    ? 'bg-primary-500 text-slate-950'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {t('All')}
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm font-medium transition',
                  filterStatus === 'active'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {t('Active')}
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={clsx(
                  'rounded-lg px-4 py-2 text-sm font-medium transition',
                  filterStatus === 'inactive'
                    ? 'bg-slate-500 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                )}
              >
                {t('Inactive')}
              </button>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        {loadingPatients ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-400">{t('Loading patients...')}</p>
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-16 text-center backdrop-blur">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-slate-300">{t('No patients found')}</h3>
            <p className="mt-2 text-sm text-slate-500">{t('Try adjusting your search or filters')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="group rounded-2xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur transition hover:border-white/10 hover:bg-white/[0.05]"
              >
                <div className="flex items-start gap-4">
                  <div className={clsx('flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white', getAvatarColor(patient.id))}>
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <span
                        className={clsx(
                          'shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          patient.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-500/20 text-slate-400'
                        )}
                      >
                        <span className={clsx('h-1.5 w-1.5 rounded-full', patient.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400')}></span>
                        {t(patient.status.charAt(0).toUpperCase() + patient.status.slice(1))}
                      </span>
                    </div>
                    
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{patient.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{patient.phone}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-slate-500">{t('Cases:')}</span>
                          <span className="ml-1 font-semibold text-primary-400">{patient.totalCases}</span>
                        </div>
                        {patient.lastVisit && (
                          <div>
                            <span className="text-slate-500">{t('Last:')}</span>
                            <span className="ml-1 text-slate-400">
                              {new Date(patient.lastVisit).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {t('View')}
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </div>
        </main>

      {/* Patient Details Modal */}
      {showDetailsModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx('flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold text-white', getAvatarColor(selectedPatient.id))}>
                    {getInitials(selectedPatient.firstName, selectedPatient.lastName)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">{selectedPatient.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPatient(null);
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
              {/* Patient Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Personal Information')}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400">{t('Date of Birth')}</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {new Date(selectedPatient.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{t('Phone')}</p>
                      <p className="mt-1 text-sm font-medium text-white">{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{t('Address')}</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {selectedPatient.address}
                        <br />
                        {selectedPatient.city}, {selectedPatient.state}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Insurance Information')}</h3>
                  <div className="space-y-3">
                    {selectedPatient.insuranceProvider ? (
                      <>
                        <div>
                          <p className="text-xs text-slate-400">{t('Provider')}</p>
                          <p className="mt-1 text-sm font-medium text-white">{selectedPatient.insuranceProvider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{t('Policy Number')}</p>
                          <p className="mt-1 text-sm font-medium text-white font-mono">{selectedPatient.insuranceNumber}</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('No insurance information on file')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Treatment Statistics */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200 mb-4">{t('Treatment Overview')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-2xl font-bold text-white">{patientCases.length}</p>
                    <p className="mt-1 text-xs text-slate-400">{t('Total Cases')}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-2xl font-bold text-emerald-400">
                      {patientCases.filter((c: any) => c.status === 'completed').length}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{t('Completed')}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-2xl font-bold text-blue-400">
                      {patientCases.filter((c: any) => c.status === 'in-production').length}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{t('In Production')}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-white/[0.03]">
                    <p className="text-2xl font-bold text-amber-400">
                      {patientCases.filter((c: any) => c.status === 'in-transit').length}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{t('In Transit')}</p>
                  </div>
                </div>
              </div>

              {/* Lab Cases History */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200 mb-4">{t('Case History')}</h3>
                {patientCases.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    {t('No cases found for this patient')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {patientCases.map((labCase: any) => (
                      <div
                        key={labCase.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/10"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-semibold text-white">{labCase.caseId}</span>
                            <span className={clsx('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', caseStatusColors[labCase.status])}>
                              {t(labCase.status)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                            <span>{labCase.procedure}</span>
                            <span>•</span>
                            <span>{labCase.lab}</span>
                            <span>•</span>
                            <span>{new Date(labCase.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <button className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white">
                          {t('View')}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  {t('Edit Patient')}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                >
                  {t('Create Case')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedPatient(null);
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
    </div>
  );
}
