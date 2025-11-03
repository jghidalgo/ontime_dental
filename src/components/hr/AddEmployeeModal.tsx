'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';
import { CREATE_EMPLOYEE } from '@/graphql/employee-mutations';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import { GET_COMPANIES } from '@/graphql/company-queries';

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type EmployeeFormState = {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  startMonth: string;
  startDay: string;
  startYear: string;
  department: string;
  position: string;
  location: string;
  status: string;
  companyId: string;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

const initialState: EmployeeFormState = {
  employeeId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthMonth: '',
  birthDay: '',
  birthYear: '',
  startMonth: '',
  startDay: '',
  startYear: '',
  department: '',
  position: '',
  location: '',
  status: 'active',
  companyId: ''
};

const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const departmentOptions = [
  'Clinical',
  'Laboratory',
  'Operations',
  'Finance',
  'HR',
  'Management',
  'Compliance',
  'Billing',
  'Accounting',
  'Customer Service'
];

const positionOptions = [
  'Dental Assistant',
  'Dentist',
  'Dental Hygienist',
  'Doctor',
  'Front Desk',
  'Hygienist',
  'Office Manager',
  'Operations Manager',
  'Treatment Coordinator',
  'Lab Technician',
  'Billing Specialist',
  'HR Manager',
  'Compliance Officer'
];

const locationOptions = [
  'Little Havana',
  'Pembroke Pines',
  'Tamami',
  'Coral Gables',
  'Coral Way',
  'Homestead',
  'Miami Lakes',
  'Miracle Mile',
  'Bird Road',
  'Lab',
  'Corporate'
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on-leave', label: 'On Leave' }
];

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const { t } = useTranslations();
  const [formState, setFormState] = useState<EmployeeFormState>(initialState);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch companies for dropdown
  const { data: companiesData } = useQuery(GET_COMPANIES);
  const companies = companiesData?.companies || [];

  const [createEmployee, { loading, error }] = useMutation(CREATE_EMPLOYEE, {
    refetchQueries: [{ query: GET_EMPLOYEES, variables: { limit: 1000 } }],
    onCompleted: () => {
      setFormState(initialState);
      showSnackbar(t('Employee created successfully!'), 'success');
      setTimeout(() => {
        onClose();
      }, 1500);
    },
    onError: (err) => {
      console.error('Error creating employee:', err);
      showSnackbar(err.message || t('Failed to create employee'), 'error');
    }
  });

  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0')), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, index) => String(currentYear - index));
  }, []);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleChange = (field: keyof EmployeeFormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState((previous) => ({
      ...previous,
      [field]: event.target.value
    }));
  };

  const formatDateString = (month: string, day: string, year: string): string => {
    if (!month || !day || !year) return '';
    const monthIndex = monthOptions.indexOf(month) + 1;
    return `${monthIndex.toString().padStart(2, '0')}/${day}/${year}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dateOfBirth = formatDateString(formState.birthMonth, formState.birthDay, formState.birthYear);
    const joined = formatDateString(formState.startMonth, formState.startDay, formState.startYear);

    // Validate required fields
    if (!formState.companyId) {
      showSnackbar(t('Please select a company'), 'error');
      return;
    }

    const input = {
      employeeId: formState.employeeId,
      name: `${formState.firstName} ${formState.lastName}`,
      email: formState.email || undefined,
      phone: formState.phone,
      dateOfBirth,
      joined,
      department: formState.department || undefined,
      position: formState.position,
      location: formState.location,
      status: formState.status,
      companyId: formState.companyId
    };

    console.log('Creating employee with input:', input);

    try {
      const result = await createEmployee({
        variables: { input }
      });
      console.log('Employee created successfully:', result);
    } catch (err: any) {
      console.error('Failed to create employee:', err);
      // Error is handled by onError callback in mutation hook
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm dark:bg-slate-950/90"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
          aria-label={t('Close')}
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <header className="mb-8 border-b border-slate-200 pb-6 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8"
                >
                  <path d="M12 2.25a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5zM4.5 20.25a7.5 7.5 0 0115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{t('Add employee')}</h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                  {t('Personal Information')}
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 text-sm text-slate-700 dark:text-slate-300 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="employee-id">
                {t('Employee ID')} <span className="text-red-500">*</span>
              </label>
              <input
                id="employee-id"
                name="employee-id"
                required
                value={formState.employeeId}
                onChange={handleChange('employeeId')}
                placeholder="EMP-001"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="email">
                {t('Email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange('email')}
                placeholder="john.doe@ontimedental.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="first-name">
                {t('Name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="first-name"
                name="first-name"
                required
                value={formState.firstName}
                onChange={handleChange('firstName')}
                placeholder="John"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="last-name">
                {t('Last Name')} <span className="text-red-500">*</span>
              </label>
              <input
                id="last-name"
                name="last-name"
                required
                value={formState.lastName}
                onChange={handleChange('lastName')}
                placeholder="Doe"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="phone">
                {t('Phone Number')} <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                required
                placeholder="(305) 555-1234"
                value={formState.phone}
                onChange={handleChange('phone')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="location">
                {t('Location')} <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                required
                value={formState.location}
                onChange={handleChange('location')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              >
                <option value="" disabled>
                  {t('Select Location')}
                </option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="company">
                {t('Company')} <span className="text-red-500">*</span>
              </label>
              <select
                id="company"
                required
                value={formState.companyId}
                onChange={handleChange('companyId')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              >
                <option value="" disabled>
                  {t('Select Company')}
                </option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t('Date of Birth')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label={t('Birth Month')}
                  required
                  value={formState.birthMonth}
                  onChange={handleChange('birthMonth')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Month')}
                  </option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t('Birth Day')}
                  required
                  value={formState.birthDay}
                  onChange={handleChange('birthDay')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Day')}
                  </option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t('Birth Year')}
                  required
                  value={formState.birthYear}
                  onChange={handleChange('birthYear')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Year')}
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t('Start Date')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label={t('Start Month')}
                  required
                  value={formState.startMonth}
                  onChange={handleChange('startMonth')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Month')}
                  </option>
                  {monthOptions.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t('Start Day')}
                  required
                  value={formState.startDay}
                  onChange={handleChange('startDay')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Day')}
                  </option>
                  {days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <select
                  aria-label={t('Start Year')}
                  required
                  value={formState.startYear}
                  onChange={handleChange('startYear')}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
                >
                  <option value="" disabled>
                    {t('Year')}
                  </option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="department">
                {t('Department')}
              </label>
              <select
                id="department"
                value={formState.department}
                onChange={handleChange('department')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              >
                <option value="" disabled>
                  {t('Select Department')}
                </option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="position">
                {t('Position')} <span className="text-red-500">*</span>
              </label>
              <select
                id="position"
                required
                value={formState.position}
                onChange={handleChange('position')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              >
                <option value="" disabled>
                  {t('Select Position')}
                </option>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="status">
                {t('Status')} <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                required
                value={formState.status}
                onChange={handleChange('status')}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-primary-500 dark:focus:ring-primary-500/20"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {t(status.label)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {error.message || t('Failed to create employee. Please try again.')}
            </div>
          )}

          <div className="mt-10 flex justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-primary-500 px-10 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white dark:hover:bg-primary-600"
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {loading ? t('Saving...') : t('Save')}
            </button>
          </div>
        </form>
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
    </div>
  );
}
