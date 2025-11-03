'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_EMPLOYEE } from '@/graphql/employee-mutations';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import { useTranslations } from '@/lib/i18n';

type ToggleEmployeeStatusModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    status: string;
  } | null;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function ToggleEmployeeStatusModal({ isOpen, onClose, employee }: ToggleEmployeeStatusModalProps) {
  const { t } = useTranslations();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  const [updateEmployee, { loading }] = useMutation(UPDATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });

  if (!isOpen || !employee) return null;

  const isActive = employee.status === 'active';
  const newStatus = isActive ? 'inactive' : 'active';

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleConfirm = async () => {
    try {
      await updateEmployee({
        variables: {
          id: employee.id,
          input: {
            status: newStatus
          },
        },
      });

      showSnackbar(
        t(isActive ? 'Employee disabled successfully!' : 'Employee enabled successfully!'),
        'success'
      );
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating employee status:', error);
      showSnackbar(error.message || t('Failed to update employee status'), 'error');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {isActive ? t('Disabled Employee') : t('Enable Employee')}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6">
              <h3 className="mb-3 text-lg font-bold text-white">{employee.name}</h3>
              <p className="mb-6 text-slate-300">
                {isActive 
                  ? t('Are you absolutely sure you want to disable this employee?')
                  : t('Are you absolutely sure you want to enable this employee?')
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? t('Processing...') : t('Okay')}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('No, thanks')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar Notification */}
      {snackbar.show && (
        <div
          className={`fixed bottom-6 right-6 z-50 animate-slide-in-up rounded-xl border px-6 py-4 shadow-2xl transition-all ${
            snackbar.type === 'success'
              ? 'border-green-500/50 bg-green-950/90 text-green-100'
              : 'border-red-500/50 bg-red-950/90 text-red-100'
          }`}
        >
          <div className="flex items-center gap-3">
            {snackbar.type === 'success' ? (
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-sm font-semibold">{snackbar.message}</p>
          </div>
        </div>
      )}
    </>
  );
}
