'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PTOS } from '@/graphql/pto-queries';
import { DELETE_PTO } from '@/graphql/pto-mutations';

type PTORecord = {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
};

type ViewPTOModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    position: string;
    department?: string;
    ptoAllowance?: number;
    ptoUsed?: number;
    ptoAvailable?: number;
  } | null;
};

export default function ViewPTOModal({ isOpen, onClose, employee }: ViewPTOModalProps) {
  const { t } = useTranslations();
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch PTOs for this employee
  const { data, loading, refetch } = useQuery(GET_PTOS, {
    variables: { employeeId: employee?.employeeId },
    skip: !employee?.employeeId || !isOpen,
  });

  const [deletePTO] = useMutation(DELETE_PTO, {
    onCompleted: () => {
      setSnackbar({ message: t('PTO deleted successfully'), type: 'success' });
      refetch();
      setTimeout(() => setSnackbar(null), 4000);
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const ptoRecords: PTORecord[] = data?.ptos || [];

  // Calculate PTO balance
  const ptoAllowance = employee?.ptoAllowance || 15;
  const ptoUsed = employee?.ptoUsed || 0;
  const ptoAvailable = employee?.ptoAvailable || ptoAllowance;
  const ptoConsumed = ptoRecords
    .filter(p => p.status === 'approved' && p.leaveType === 'Paid Time Off')
    .reduce((sum, p) => sum + p.requestedDays, 0);

  if (!isOpen || !employee) return null;

  const handleEdit = (ptoId: string) => {
    console.log('Edit PTO:', ptoId);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (ptoId: string) => {
    if (window.confirm(t('Are you sure you want to delete this PTO request?'))) {
      try {
        await deletePTO({ variables: { id: ptoId } });
      } catch (error) {
        console.error('Error deleting PTO:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
            {t('Approved')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-400">
            {t('Pending')}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-400">
            {t('Rejected')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {t("PTO's List")} {employee.name}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {employee.position} • {employee.department || 'N/A'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* PTO Balance Section */}
          <div className="border-t border-slate-700 bg-slate-800/30 px-6 py-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Total Allowance')}
                </p>
                <p className="mt-1 text-3xl font-bold text-white">{ptoAllowance}</p>
                <p className="text-xs text-slate-500">{t('days per year')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  {t('Days Consumed')}
                </p>
                <p className="mt-1 text-3xl font-bold text-orange-400">{ptoUsed}</p>
                <p className="text-xs text-slate-500">{t('approved paid days')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  {t('Days Available')}
                </p>
                <p className="mt-1 text-3xl font-bold text-green-400">{ptoAvailable}</p>
                <p className="text-xs text-slate-500">{t('remaining days')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-orange-500"></div>
              <p className="text-slate-400">{t('Loading PTOs...')}</p>
            </div>
          ) : ptoRecords.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
                <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{t('No PTO Records')}</h3>
              <p className="text-slate-400">
                {t('This employee has no time off requests.')}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-700">
              <table className="w-full">
                <thead className="bg-orange-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {t('Leave Type')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {t('Start Date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {t('End Date')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {t('Days')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {t('Status')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider">
                      {t('Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 bg-slate-800/50">
                  {ptoRecords.map((pto) => (
                    <tr key={pto.id} className="transition hover:bg-slate-800">
                      <td className="px-4 py-3 text-sm text-slate-200">
                        {pto.leaveType}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(pto.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(pto.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {pto.requestedDays}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(pto.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(pto.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-primary-400"
                            title={t('Edit')}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(pto.id)}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-red-400"
                            title={t('Delete')}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {ptoRecords.length > 0 && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Total Requests')}
                </p>
                <p className="mt-1 text-2xl font-bold text-white">{ptoRecords.length}</p>
              </div>
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                  {t('Approved')}
                </p>
                <p className="mt-1 text-2xl font-bold text-green-400">
                  {ptoRecords.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                  {t('Pending')}
                </p>
                <p className="mt-1 text-2xl font-bold text-yellow-400">
                  {ptoRecords.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                  {t('Rejected')}
                </p>
                <p className="mt-1 text-2xl font-bold text-red-400">
                  {ptoRecords.filter(p => p.status === 'rejected').length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            {t('Close')}
          </button>
        </div>
      </div>

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-lg border px-6 py-3 shadow-lg ${
              snackbar.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
}
