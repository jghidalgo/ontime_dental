'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import AddPTOModal from '@/components/hr/AddPTOModal';
import ViewPTOModal from '@/components/hr/ViewPTOModal';
import { getUserSession, hasModuleAccess } from '@/lib/permissions';
import { GET_PTOS } from '@/graphql/pto-queries';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';

export default function MyHRInfoPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isAddPTOModalOpen, setIsAddPTOModalOpen] = useState(false);
  const [selectedPTO, setSelectedPTO] = useState<any>(null);
  const [isViewPTOModalOpen, setIsViewPTOModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);

  // Get employees to find current user's employee record
  const { data: employeesData, loading: employeesLoading } = useQuery(GET_EMPLOYEES, {
    skip: !userEmail,
    fetchPolicy: 'cache-and-network',
  });

  // Get PTOs for current employee
  const { data: ptosData, refetch: refetchPTOs } = useQuery(GET_PTOS, {
    variables: {
      employeeId: currentEmployee?.employeeId,
    },
    skip: !currentEmployee?.employeeId,
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
    }
  }, [router]);

  // Find current user's employee record
  useEffect(() => {
    if (userEmail && employeesData?.employees) {
      const employee = employeesData.employees.find(
        (emp: any) => emp.email === userEmail
      );
      
      if (employee) {
        // Calculate PTO available from PTOs data
        const approvedPTOs = ptosData?.ptos?.filter((pto: any) => pto.status === 'approved') || [];
        const usedDays = approvedPTOs.reduce((sum: number, pto: any) => sum + (pto.requestedDays || 0), 0);
        const totalPTO = 20; // Default, should come from company policy
        
        setCurrentEmployee({
          ...employee,
          ptoAvailable: totalPTO - usedDays,
        });
      }
    }
  }, [userEmail, employeesData, ptosData]);

  // Calculate PTO balance
  const calculatePTOBalance = () => {
    if (!ptosData?.ptos) {
      return { available: 20, used: 0, pending: 0, total: 20 };
    }

    const approved = ptosData.ptos.filter((pto: any) => pto.status === 'approved');
    const pending = ptosData.ptos.filter((pto: any) => pto.status === 'pending');
    
    const usedDays = approved.reduce((sum: number, pto: any) => sum + (pto.requestedDays || 0), 0);
    const pendingDays = pending.reduce((sum: number, pto: any) => sum + (pto.requestedDays || 0), 0);
    const totalPTO = 20; // Should come from company policy
    
    return {
      available: totalPTO - usedDays,
      used: usedDays,
      pending: pendingDays,
      total: totalPTO,
    };
  };

  const ptoBalance = calculatePTOBalance();
  const ptoRequests = ptosData?.ptos || [];

  const handleViewPTO = (pto: any) => {
    setSelectedPTO(pto);
    setIsViewPTOModalOpen(true);
  };

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
                onClick={() => setIsAddPTOModalOpen(true)}
                disabled={employeesLoading}
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
                    onClick={() => handleViewPTO(request)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]"
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
                        {request.requestedDays || request.days} {t('days')} • {request.leaveType || 'PTO'}
                      </p>
                      {request.comment && (
                        <p className="mt-1 text-xs text-slate-500">{request.comment}</p>
                      )}
                    </div>
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
          refetchPTOs();
        }}
        employee={currentEmployee || {
          id: '0',
          employeeId: userEmail || '',
          name: userName,
          position: userRole,
          department: 'Unknown',
          companyId: '1',
          ptoAvailable: 20,
        }}
      />

      {/* View PTO Modal */}
      {selectedPTO && (
        <ViewPTOModal
          isOpen={isViewPTOModalOpen}
          onClose={() => {
            setIsViewPTOModalOpen(false);
            setSelectedPTO(null);
          }}
          pto={selectedPTO}
        />
      )}
    </div>
  );
}
