'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_EMPLOYEE } from '@/graphql/employee-mutations';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import { GET_COMPANIES } from '@/graphql/company-queries';
import { useTranslations } from '@/lib/i18n';

type EditEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    employeeId: string;
    name: string;
    joined: string;
    dateOfBirth: string;
    phone: string;
    position: string;
    location: string;
    email?: string;
    department?: string;
    status: string;
    companyId?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  } | null;
};

type EmployeeFormData = {
  name: string;
  joined: string;
  dateOfBirth: string;
  phone: string;
  position: string;
  location: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'on-leave';
  companyId: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

export default function EditEmployeeModal({ isOpen, onClose, employee }: EditEmployeeModalProps) {
  const { t } = useTranslations();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    joined: '',
    dateOfBirth: '',
    phone: '',
    position: '',
    location: '',
    email: '',
    department: '',
    status: 'active',
    companyId: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
  });

  const { data: companiesData } = useQuery(GET_COMPANIES);
  const companies = companiesData?.companies || [];

  const [updateEmployee, { loading }] = useMutation(UPDATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES }],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        joined: employee.joined || '',
        dateOfBirth: employee.dateOfBirth || '',
        phone: employee.phone || '',
        position: employee.position || '',
        location: employee.location || '',
        email: employee.email || '',
        department: employee.department || '',
        status: (employee.status as 'active' | 'inactive' | 'on-leave') || 'active',
        companyId: employee.companyId || '',
        emergencyContactName: employee.emergencyContact?.name || '',
        emergencyContactRelationship: employee.emergencyContact?.relationship || '',
        emergencyContactPhone: employee.emergencyContact?.phone || '',
      });
    }
  }, [employee]);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!employee) return;

    try {
      const input: any = {
        name: formData.name,
        joined: formData.joined,
        dateOfBirth: formData.dateOfBirth,
        phone: formData.phone,
        position: formData.position,
        location: formData.location,
        status: formData.status,
      };

      if (formData.email) input.email = formData.email;
      if (formData.department) input.department = formData.department;
      if (formData.companyId) input.companyId = formData.companyId;

      if (formData.emergencyContactName && formData.emergencyContactPhone) {
        input.emergencyContact = {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        };
      }

      await updateEmployee({
        variables: {
          id: employee.id,
          input,
        },
      });

      showSnackbar(t('Employee updated successfully!'), 'success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating employee:', error);
      showSnackbar(error.message || t('Failed to update employee'), 'error');
    }
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-900 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">{t('Edit Employee')}</h2>
          <button
            onClick={onClose}
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
            {/* Employee ID (Read-only) */}
            <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <label className="mb-1 block text-sm font-semibold text-slate-400">
                {t('Employee ID')}
              </label>
              <p className="text-lg font-bold text-primary-400">{employee.employeeId}</p>
            </div>

            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-white">{t('Basic Information')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Full Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., John Doe"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., john.doe@company.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Phone')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., (904) 555-0100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Date of Birth')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-white">{t('Work Information')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Position')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Dentist"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Department')}
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Clinical"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Location')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Main Office"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Company')}
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">{t('No Company')}</option>
                    {companies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Join Date')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.joined}
                    onChange={(e) => handleInputChange('joined', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Status')} <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'on-leave')}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="active">{t('Active')}</option>
                    <option value="inactive">{t('Inactive')}</option>
                    <option value="on-leave">{t('On Leave')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold text-white">{t('Emergency Contact')}</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Contact Name')}
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Jane Doe"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Relationship')}
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Spouse"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Contact Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., (904) 555-0200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-700 bg-slate-900 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t('Saving...') : t('Save Changes')}
            </button>
          </div>
        </form>

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
      </div>
    </div>
  );
}
