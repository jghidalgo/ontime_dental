'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { DELETE_EMPLOYEE } from '@/graphql/employee-mutations';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import { useTranslations } from '@/lib/i18n';

type DeleteEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    position: string;
  } | null;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function DeleteEmployeeModal({ isOpen, onClose, employee }: DeleteEmployeeModalProps) {
  const { t } = useTranslations();
  const [step, setStep] = useState<1 | 2>(1);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  const [deleteEmployee, { loading }] = useMutation(DELETE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });

  if (!isOpen || !employee) return null;

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleFirstConfirm = () => {
    setStep(2);
  };

  const handleFinalConfirm = async () => {
    try {
      await deleteEmployee({
        variables: {
          id: employee.id,
        },
      });

      showSnackbar(t('Employee deleted successfully!'), 'success');
      
      setTimeout(() => {
        setStep(1);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      showSnackbar(error.message || t('Failed to delete employee'), 'error');
    }
  };

  const handleCancel = () => {
    setStep(1);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">
              {step === 1 ? t('Delete Employee - Step 1') : t('Delete Employee - Step 2')}
            </h2>
            <button
              onClick={handleCancel}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {step === 1 ? (
              /* Step 1: Initial Confirmation */
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('Warning!')}</h3>
                    <p className="text-sm text-yellow-400">{t('This action requires confirmation')}</p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Employee Details')}
                  </p>
                  <p className="text-lg font-bold text-white">{employee.name}</p>
                  <p className="text-sm text-slate-300">{employee.position}</p>
                  <p className="text-sm text-slate-400">{t('ID')}: {employee.employeeId}</p>
                </div>

                <p className="mb-6 text-slate-300">
                  {t('Are you sure you want to delete this employee? This will remove all associated data.')}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleFirstConfirm}
                    className="flex-1 rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-yellow-700"
                  >
                    {t('Yes, Continue')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </div>
            ) : (
              /* Step 2: Final Confirmation */
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t('Final Confirmation!')}</h3>
                    <p className="text-sm text-red-400">{t('This action cannot be undone')}</p>
                  </div>
                </div>

                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/20 p-4">
                  <p className="mb-2 font-bold text-white">{employee.name}</p>
                  <p className="text-sm text-red-100">
                    {t('Deleting this employee will permanently remove:')}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-red-100">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('Employee profile and personal data')}
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('Work history and records')}
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t('PTO and time-off records')}
                    </li>
                  </ul>
                </div>

                <p className="mb-6 text-center text-lg font-bold text-red-400">
                  {t('Are you absolutely certain?')}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleFinalConfirm}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? t('Deleting...') : t('Delete Permanently')}
                  </button>
                  <button
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('Go Back')}
                  </button>
                </div>
              </div>
            )}
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
