'use client';

import { useState, type FormEvent } from 'react';
import { useTranslations } from '@/lib/i18n';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_PTO } from '@/graphql/pto-mutations';
import { GET_PTOS } from '@/graphql/pto-queries';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';

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

type AddPTOModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    position: string;
    department?: string;
    companyId?: string;
    ptoAvailable?: number;
  } | null;
};

type LeaveType = {
  id: string;
  name: string;
  hoursAllowed: number;
  isPaid: boolean;
  isActive: boolean;
};

type PTOFormData = {
  leaveTypeId: string | null;
  startDate: string;
  endDate: string;
  requestedDays: string;
  comment: string;
  agreed: boolean;
  signature: string;
};

export default function AddPTOModal({ isOpen, onClose, employee }: AddPTOModalProps) {
  const { t } = useTranslations();
  const [formData, setFormData] = useState<PTOFormData>({
    leaveTypeId: null,
    startDate: '',
    endDate: '',
    requestedDays: '',
    comment: '',
    agreed: false,
    signature: '',
  });
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch company PTO policies to get leave types
  const { data: ptoData, loading: loadingPolicies } = useQuery(GET_COMPANY_PTO_POLICIES, {
    variables: { companyId: employee?.companyId },
    skip: !employee?.companyId,
  });

  const leaveTypes: LeaveType[] = ptoData?.companyPTOPolicies?.leaveTypes?.filter((lt: LeaveType) => lt.isActive) || [];
  const selectedLeaveType = leaveTypes.find(lt => lt.id === formData.leaveTypeId);

  // Calculate available hours based on selected leave type
  const availableHours = selectedLeaveType?.hoursAllowed || 0;

  const [createPTO, { loading }] = useMutation(CREATE_PTO, {
    refetchQueries: [
      { query: GET_PTOS, variables: { employeeId: employee?.employeeId } },
      { query: GET_EMPLOYEES, variables: { companyId: employee?.companyId } }
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      setSnackbar({ message: t('PTO request created successfully'), type: 'success' });
      setTimeout(() => {
        setSnackbar(null);
        handleCancel();
      }, 2000);
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  if (!isOpen || !employee) return null;

  const handleInputChange = (field: keyof PTOFormData, value: string | boolean | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeaveTypeToggle = (leaveTypeId: string) => {
    // Toggle the leave type - if clicking the same one, deselect it
    setFormData((prev) => ({
      ...prev,
      leaveTypeId: prev.leaveTypeId === leaveTypeId ? null : leaveTypeId
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreed) {
      setSnackbar({ message: t('Please agree to the terms'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    if (!formData.signature.trim()) {
      setSnackbar({ message: t('Please provide your signature'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    if (!formData.leaveTypeId) {
      setSnackbar({ message: t('Please select a leave type'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    if (!formData.startDate || !formData.endDate || !formData.requestedDays) {
      setSnackbar({ message: t('Please fill in all required fields'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    const requestedDays = parseInt(formData.requestedDays, 10);
    const requestedHours = requestedDays * 8;
    
    // Check if enough hours available for this leave type
    if (selectedLeaveType && requestedHours > selectedLeaveType.hoursAllowed) {
      setSnackbar({ 
        message: t(`Not enough hours available. This leave type allows ${selectedLeaveType.hoursAllowed} hours (${selectedLeaveType.hoursAllowed / 8} days).`), 
        type: 'error' 
      });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    // Check PTO balance for paid leave
    if (selectedLeaveType?.isPaid && employee.ptoAvailable !== undefined && requestedDays > employee.ptoAvailable) {
      setSnackbar({ 
        message: t(`Not enough PTO available. You have ${employee.ptoAvailable} days remaining.`), 
        type: 'error' 
      });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }
    
    try {
      await createPTO({
        variables: {
          input: {
            employeeId: employee.employeeId,
            companyId: employee.companyId,
            leaveType: selectedLeaveType?.isPaid ? 'paid' : 'unpaid',
            startDate: formData.startDate,
            endDate: formData.endDate,
            requestedDays,
            comment: formData.comment,
            requestedBy: employee.employeeId, // TODO: Use actual logged-in user
          },
        },
      });
    } catch (error) {
      console.error('Error creating PTO:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      leaveTypeId: null,
      startDate: '',
      endDate: '',
      requestedDays: '',
      comment: '',
      agreed: false,
      signature: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{t('Add PTO')}</h2>
          <button
            onClick={handleCancel}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="p-6">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/20">
                  <svg className="h-10 w-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Employee Info */}
            <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-slate-800/50 p-4 border border-slate-700">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {t('Employee Name')}
                </label>
                <p className="text-sm font-medium text-white">{employee.name}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {t('Job Title')}
                </label>
                <p className="text-sm font-medium text-white">{employee.position}</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-400">
                  {t('Department')}
                </label>
                <p className="text-sm font-medium text-white">{employee.department || 'N/A'}</p>
              </div>
            </div>

            {/* Leave Type */}
            <div className="mb-6">
              <label className="mb-3 block text-sm font-semibold text-slate-200">
                {t('Leave Type')}
              </label>
              
              {loadingPolicies ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-primary-500"></div>
                </div>
              ) : leaveTypes.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <p className="text-sm text-slate-400">
                    {t('No leave types configured for this company.')}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t('Please contact HR to set up leave types.')}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {leaveTypes.map((leaveType) => (
                    <label key={leaveType.id} className="flex cursor-pointer items-center gap-2">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.leaveTypeId === leaveType.id}
                          onChange={() => handleLeaveTypeToggle(leaveType.id)}
                          className="peer sr-only"
                        />
                        <div className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-blue-500"></div>
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-300">{leaveType.name}</span>
                        <span className="text-xs text-slate-500">
                          {leaveType.hoursAllowed} {t('hrs')} ({leaveType.hoursAllowed / 8} {t('days')})
                          {leaveType.isPaid && <span className="ml-1 text-green-400">• {t('Paid')}</span>}
                          {!leaveType.isPaid && <span className="ml-1 text-orange-400">• {t('Unpaid')}</span>}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Show available hours when a leave type is selected */}
              {selectedLeaveType && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 border border-slate-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-500">
                    <svg className="h-4 w-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {t('Available')}: <span className="text-yellow-400">{availableHours}</span> {t('hours')} ({availableHours / 8} {t('days')})
                  </span>
                </div>
              )}
            </div>

            {/* Date Fields */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  {t('Start Date')}
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  {t('End Date')}
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  {t('Requested Days')}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  value={formData.requestedDays}
                  onChange={(e) => handleInputChange('requestedDays', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-slate-200">
                {t('Comment')}
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={t('Enter any additional comments...')}
              />
            </div>

            {/* Agreement Checkbox */}
            <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={(e) => handleInputChange('agreed', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-blue-500"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></div>
                </div>
                <span className="text-sm font-medium text-slate-200">{t('I Agree')}</span>
              </label>

              {/* Signature Box - Shows when agreed */}
              {formData.agreed && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Signature')} <span className="text-red-400">*</span>
                  </label>
                  <div className="rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/50 p-4">
                    <input
                      type="text"
                      required
                      value={formData.signature}
                      onChange={(e) => handleInputChange('signature', e.target.value)}
                      placeholder={t('Type your full name to sign')}
                      className="w-full bg-transparent font-serif text-2xl italic text-white placeholder-slate-500 focus:outline-none"
                      style={{ fontFamily: 'cursive' }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {t('By typing your name above, you are electronically signing this agreement.')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={!formData.agreed || !formData.signature.trim() || loading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('Sending...') : t('Send PTO')}
            </button>
          </div>
        </form>
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
