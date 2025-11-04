'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';

// GraphQL Queries and Mutations
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

const CREATE_LEAVE_TYPE = gql`
  mutation CreateLeaveType($companyId: ID!, $input: LeaveTypeInput!) {
    createLeaveType(companyId: $companyId, input: $input) {
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

const UPDATE_LEAVE_TYPE = gql`
  mutation UpdateLeaveType($companyId: ID!, $leaveTypeId: ID!, $input: LeaveTypeInput!) {
    updateLeaveType(companyId: $companyId, leaveTypeId: $leaveTypeId, input: $input) {
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

const DELETE_LEAVE_TYPE = gql`
  mutation DeleteLeaveType($companyId: ID!, $leaveTypeId: ID!) {
    deleteLeaveType(companyId: $companyId, leaveTypeId: $leaveTypeId) {
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

type LeaveType = {
  id: string;
  name: string;
  hoursAllowed: number;
  isPaid: boolean;
  isActive: boolean;
};

type LeaveTypeFormData = {
  name: string;
  hoursAllowed: number;
  isPaid: boolean;
  isActive: boolean;
};

type Company = {
  id: string;
  name: string;
  shortName: string;
};

type CompanySettingsModalProps = {
  company: Company;
  onClose: () => void;
};

export default function CompanySettingsModal({ company, onClose }: CompanySettingsModalProps) {
  const { t } = useTranslations();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'pto-policy'>('pto-policy');
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [leaveTypeFormData, setLeaveTypeFormData] = useState<LeaveTypeFormData>({
    name: '',
    hoursAllowed: 0,
    isPaid: true,
    isActive: true,
  });
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { data, loading, refetch } = useQuery(GET_COMPANY_PTO_POLICIES, {
    variables: { companyId: company.id },
  });

  const [createLeaveType, { loading: creating }] = useMutation(CREATE_LEAVE_TYPE, {
    onCompleted: () => {
      setSnackbar({ message: t('Leave type created successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
      handleCloseLeaveTypeModal();
    },
    onError: (error) => {
      console.error('Create leave type error:', error);
      setSnackbar({ message: error.message || 'Failed to create leave type', type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const [updateLeaveType, { loading: updating }] = useMutation(UPDATE_LEAVE_TYPE, {
    onCompleted: () => {
      setSnackbar({ message: t('Leave type updated successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
      handleCloseLeaveTypeModal();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const [deleteLeaveType, { loading: deleting }] = useMutation(DELETE_LEAVE_TYPE, {
    onCompleted: () => {
      setSnackbar({ message: t('Leave type deleted successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const leaveTypes: LeaveType[] = data?.companyPTOPolicies?.leaveTypes || [];

  const handleOpenCreateLeaveType = () => {
    setEditingLeaveType(null);
    setLeaveTypeFormData({
      name: '',
      hoursAllowed: 0,
      isPaid: true,
      isActive: true,
    });
    setShowLeaveTypeModal(true);
  };

  const handleOpenEditLeaveType = (leaveType: LeaveType) => {
    setEditingLeaveType(leaveType);
    setLeaveTypeFormData({
      name: leaveType.name,
      hoursAllowed: leaveType.hoursAllowed,
      isPaid: leaveType.isPaid,
      isActive: leaveType.isActive,
    });
    setShowLeaveTypeModal(true);
  };

  const handleCloseLeaveTypeModal = () => {
    setShowLeaveTypeModal(false);
    setEditingLeaveType(null);
    setLeaveTypeFormData({
      name: '',
      hoursAllowed: 0,
      isPaid: true,
      isActive: true,
    });
  };

  const handleSubmitLeaveType = async (e: FormEvent) => {
    e.preventDefault();

    console.log('Submitting leave type:', {
      companyId: company.id,
      input: leaveTypeFormData,
      editing: !!editingLeaveType,
    });

    try {
      if (editingLeaveType) {
        await updateLeaveType({
          variables: {
            companyId: company.id,
            leaveTypeId: editingLeaveType.id,
            input: leaveTypeFormData,
          },
        });
      } else {
        await createLeaveType({
          variables: {
            companyId: company.id,
            input: leaveTypeFormData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving leave type:', error);
    }
  };

  const handleDeleteLeaveType = async (leaveTypeId: string) => {
    if (!confirm(t('Are you sure you want to delete this leave type?'))) {
      return;
    }

    try {
      await deleteLeaveType({
        variables: {
          companyId: company.id,
          leaveTypeId,
        },
      });
    } catch (error) {
      console.error('Error deleting leave type:', error);
    }
  };

  const handleLeaveTypeInputChange = (field: keyof LeaveTypeFormData, value: string | number | boolean) => {
    setLeaveTypeFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Main Settings Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t('Company Settings')}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {company.name} ({company.shortName})
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 transition hover:text-slate-300"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="border-b border-slate-700 px-6">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveSettingsTab('pto-policy')}
                className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  activeSettingsTab === 'pto-policy'
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {t('PTO Policy')}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSettingsTab === 'pto-policy' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{t('Leave Types')}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {t('Configure leave types and hours allowed for this company')}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateLeaveType}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('Add Leave Type')}
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-primary-500"></div>
                  </div>
                ) : leaveTypes.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-4 text-lg font-medium text-slate-300">{t('No leave types configured')}</p>
                    <p className="mt-2 text-sm text-slate-400">
                      {t('Add leave types to define PTO policies for this company.')}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/60 text-left">
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Leave Type')}
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Hours Allowed')}
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Type')}
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Status')}
                          </th>
                          <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {t('Actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {leaveTypes.map((leaveType) => (
                          <tr key={leaveType.id} className="transition hover:bg-slate-800/30">
                            <td className="px-6 py-4">
                              <span className="font-medium text-white">{leaveType.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-slate-300">
                                {leaveType.hoursAllowed} {t('hours')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  leaveType.isPaid
                                    ? 'bg-green-500/10 text-green-400'
                                    : 'bg-orange-500/10 text-orange-400'
                                }`}
                              >
                                {leaveType.isPaid ? t('Paid') : t('Unpaid')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  leaveType.isActive
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-slate-500/10 text-slate-400'
                                }`}
                              >
                                {leaveType.isActive ? t('Active') : t('Inactive')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleOpenEditLeaveType(leaveType)}
                                  className="text-primary-400 transition hover:text-primary-300"
                                  title={t('Edit')}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteLeaveType(leaveType.id)}
                                  disabled={deleting}
                                  className="text-red-400 transition hover:text-red-300 disabled:opacity-50"
                                  title={t('Delete')}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Leave Type Modal */}
      {showLeaveTypeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingLeaveType ? t('Edit Leave Type') : t('Add Leave Type')}
              </h3>
            </div>

            <form onSubmit={handleSubmitLeaveType} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Leave Type Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leaveTypeFormData.name}
                    onChange={(e) => handleLeaveTypeInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('e.g., Vacation, Sick Leave, Personal')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Hours Allowed')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={leaveTypeFormData.hoursAllowed}
                    onChange={(e) => handleLeaveTypeInputChange('hoursAllowed', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {t('Total hours allowed per year for this leave type')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={leaveTypeFormData.isPaid}
                    onChange={(e) => handleLeaveTypeInputChange('isPaid', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <label htmlFor="isPaid" className="text-sm font-medium text-slate-200">
                    {t('Paid Leave')}
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={leaveTypeFormData.isActive}
                    onChange={(e) => handleLeaveTypeInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-200">
                    {t('Active')}
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={handleCloseLeaveTypeModal}
                  disabled={creating || updating}
                  className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating || updating
                    ? t('Saving...')
                    : editingLeaveType
                    ? t('Update Leave Type')
                    : t('Create Leave Type')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-6 right-6 z-[70]">
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
    </>
  );
}
