'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import AddPTOModal from '@/components/hr/AddPTOModal';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';
import { GET_PTOS } from '@/graphql/pto-queries';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import { DELETE_PTO } from '@/graphql/pto-mutations';

const GET_COMPANY_PTO_POLICIES = gql`
  query GetCompanyPTOPolicies($companyId: ID!) {
    companyPTOPolicies(companyId: $companyId) {
      id
      companyId
      leaveTypes {
        id
        name
        hoursAllowed
        isPaid
        isActive
      }
    }
  }
`;

export default function MyHRInfoPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userCompanyId, setUserCompanyId] = useState('');
  const [isAddPTOModalOpen, setIsAddPTOModalOpen] = useState(false);
  const [editingPTO, setEditingPTO] = useState<any>(null);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>(
    { show: false, message: '', type: 'success' }
  );
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; ptoId: string | null }>(
    { open: false, ptoId: null }
  );

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const [deletePTO] = useMutation(DELETE_PTO, {
    onCompleted: () => {
      showSnackbar(t('PTO request deleted'), 'success');
      refetchPTOs();
    },
    onError: (error) => {
      showSnackbar(error.message || t('Failed to delete PTO request'), 'error');
    }
  });

  // Get employees to find current user's employee record
  const { data: employeesData, loading: employeesLoading } = useQuery(GET_EMPLOYEES, {
    variables: {
      companyId: userCompanyId || undefined,
    },
    skip: !userEmail || !userCompanyId,
    fetchPolicy: 'cache-and-network',
  });

  // Get PTOs for current employee
  const { data: ptosData, refetch: refetchPTOs } = useQuery(GET_PTOS, {
    variables: {
      employeeId: currentEmployee?.employeeId,
      companyId: userCompanyId || undefined,
    },
    skip: !currentEmployee?.employeeId || !userCompanyId,
    fetchPolicy: 'cache-and-network',
  });

  // Get company PTO policy (hours) to compute remaining balance correctly
  const { data: ptoPolicyData } = useQuery(GET_COMPANY_PTO_POLICIES, {
    variables: { companyId: userCompanyId },
    skip: !userCompanyId,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    const user = getUserSession();
    if (user) {
      if (!hasModuleAccess(user, 'hr')) {
        router.push('/dashboard');
        return;
      }
      
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role);
      setUserCompanyId(user.companyId || '');

      setCurrentEmployee((prev: any) =>
        prev || {
          id: '0',
          employeeId: user.email,
          name: user.name,
          position: user.role,
          department: 'Unknown',
          companyId: user.companyId || '',
          ptoAvailable: 20,
        }
      );
    }
  }, [router]);

  // Find current user's employee record
  useEffect(() => {
    if (!userEmail || !userCompanyId) return;

    if (!employeesLoading && employeesData?.employees) {
      const employee = employeesData.employees.find((emp: any) => emp.email === userEmail);

      // Calculate PTO available from company policy and PTO history
      const leaveTypes = ptoPolicyData?.companyPTOPolicies?.leaveTypes || [];
      const paidHoursAllowed = (leaveTypes as any[])
        .filter((lt) => lt?.isActive && lt?.isPaid)
        .reduce((sum, lt) => sum + (Number(lt.hoursAllowed) || 0), 0);
      const fallbackPaidHoursAllowed = 20 * 8;
      const totalPaidHours = paidHoursAllowed > 0 ? paidHoursAllowed : fallbackPaidHoursAllowed;

      const approvedPaidHoursUsed =
        ptosData?.ptos
          ?.filter((pto: any) => pto.status === 'approved' && pto.leaveType === 'paid')
          ?.reduce((sum: number, pto: any) => sum + (Number(pto.requestedDays) || 0) * 8, 0) || 0;

      const availablePaidHours = Math.max(0, totalPaidHours - approvedPaidHoursUsed);
      const availablePaidDays = Math.floor(availablePaidHours / 8);

      if (employee) {
        setCurrentEmployee({
          ...employee,
          ptoAvailable: availablePaidDays,
        });
        return;
      }

      // Fallback for roles (e.g. doctor) that may not have an Employee record yet.
      // This keeps PTO request functional and shows PTO history under employeeId=userEmail.
      setCurrentEmployee({
        id: '0',
        employeeId: userEmail,
        name: userName,
        position: userRole,
        department: 'Unknown',
        companyId: userCompanyId,
        ptoAvailable: availablePaidDays,
      });
    }
  }, [userEmail, userCompanyId, userName, userRole, employeesLoading, employeesData, ptosData, ptoPolicyData]);

  // Calculate PTO balance
  const calculatePTOBalance = () => {
    const leaveTypes = ptoPolicyData?.companyPTOPolicies?.leaveTypes || [];
    const paidHoursAllowed = (leaveTypes as any[])
      .filter((lt) => lt?.isActive && lt?.isPaid)
      .reduce((sum, lt) => sum + (Number(lt.hoursAllowed) || 0), 0);
    const fallbackPaidHoursAllowed = 20 * 8;
    const totalPaidHours = paidHoursAllowed > 0 ? paidHoursAllowed : fallbackPaidHoursAllowed;

    const approvedPaidHoursUsed =
      ptosData?.ptos
        ?.filter((pto: any) => pto.status === 'approved' && pto.leaveType === 'paid')
        ?.reduce((sum: number, pto: any) => sum + (Number(pto.requestedDays) || 0) * 8, 0) || 0;

    const pendingPaidHours =
      ptosData?.ptos
        ?.filter((pto: any) => pto.status === 'pending' && pto.leaveType === 'paid')
        ?.reduce((sum: number, pto: any) => sum + (Number(pto.requestedDays) || 0) * 8, 0) || 0;

    const availablePaidHours = Math.max(0, totalPaidHours - approvedPaidHoursUsed);

    return {
      available: Math.floor(availablePaidHours / 8),
      used: Math.floor(approvedPaidHoursUsed / 8),
      pending: Math.floor(pendingPaidHours / 8),
      total: Math.floor(totalPaidHours / 8),
    };
  };

  const ptoBalance = calculatePTOBalance();
  const ptoRequests = ptosData?.ptos || [];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'denied':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('Human Resources')}
            title={t('My HR Information')}
            subtitle={t('View your PTO balance and request time off')}
            showEntitySelector={true}
            entityLabel="Entity"
            selectedEntityId={userCompanyId}
            onEntityChange={setUserCompanyId}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          {/* User Info Card */}
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">{t('Employee Information')}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Name')}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{userName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Email')}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{userEmail}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Role')}</p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-100">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* PTO Balance */}
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t('PTO Balance')}</h2>
              <button
                onClick={() => {
                  setEditingPTO(null);
                  setIsAddPTOModalOpen(true);
                }}
                disabled={employeesLoading || !userCompanyId || !userEmail || !currentEmployee}
                className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {employeesLoading ? t('Loading...') : t('Request PTO')}
              </button>
            </div>
            
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-300">{t('Available')}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-200">{ptoBalance.available}</p>
                <p className="mt-1 text-xs text-emerald-300/60">{t('days')}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Used')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-200">{ptoBalance.used}</p>
                <p className="mt-1 text-xs text-slate-400">{t('days')}</p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-300">{t('Pending')}</p>
                <p className="mt-2 text-3xl font-bold text-amber-200">{ptoBalance.pending}</p>
                <p className="mt-1 text-xs text-amber-300/60">{t('days')}</p>
              </div>
              <div className="rounded-2xl border border-primary-500/20 bg-primary-500/10 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-primary-300">{t('Total')}</p>
                <p className="mt-2 text-3xl font-bold text-primary-200">{ptoBalance.total}</p>
                <p className="mt-1 text-xs text-primary-300/60">{t('days')}</p>
              </div>
            </div>
          </div>

          {/* PTO Requests History */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white mb-4">{t('My PTO Requests')}</h2>
            
            {ptoRequests.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-4 text-sm text-slate-400">{t('No PTO requests yet')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ptoRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-semibold text-slate-100">
                          {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase ${getStatusStyle(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {request.requestedDays || request.days} {t('days')} • {request.policyLeaveTypeName || request.leaveType || 'PTO'}
                      </p>
                      {request.comment && (
                        <p className="mt-1 text-xs text-slate-500">{request.comment}</p>
                      )}
                    </div>

                    {request.status === 'pending' && (
                      <div className="ml-4 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPTO(request);
                            setIsAddPTOModalOpen(true);
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.06]"
                        >
                          {t('Edit')}
                        </button>
                        <button
                          onClick={async () => {
                            setConfirmDelete({ open: true, ptoId: request.id });
                          }}
                          className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-white/[0.06]"
                        >
                          {t('Delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add PTO Modal */}
      <AddPTOModal
        isOpen={isAddPTOModalOpen}
        onClose={() => {
          setIsAddPTOModalOpen(false);
          setEditingPTO(null);
          refetchPTOs();
        }}
        employee={currentEmployee}
        pto={editingPTO}
      />

      {snackbar.show && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl ${
              snackbar.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-200'
            }`}
          >
            {snackbar.message}
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-700 px-6 py-4">
              <h3 className="text-lg font-bold text-white">{t('Delete PTO request?')}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {t('This can only be done while the request is pending.')}
              </p>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-slate-300">{t('Are you sure you want to delete this PTO request?')}</p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-700 px-6 py-4">
              <button
                onClick={() => setConfirmDelete({ open: false, ptoId: null })}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={async () => {
                  const id = confirmDelete.ptoId;
                  if (!id) return;
                  try {
                    await deletePTO({ variables: { id } });
                    setConfirmDelete({ open: false, ptoId: null });
                  } catch {
                    // errors are handled by onError
                  }
                }}
                className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View PTO Modal */}
    </div>
  );
}
