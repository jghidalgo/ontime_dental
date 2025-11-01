'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useTranslations } from '@/lib/i18n';

type AddEmployeeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type EmployeeFormState = {
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
  username: string;
  password: string;
};

const initialState: EmployeeFormState = {
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
  username: '',
  password: ''
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
  'Billing',
  'Bird Road',
  'Coral Gables',
  'Coral Way',
  'Homestead',
  'Little Havana',
  'Miami Lakes',
  'Miracle Mile',
  'Accounting',
  'Operations',
  'Customer Service'
];

const positionOptions = [
  'Dental Assistant',
  'Doctor',
  'Front Desk',
  'Hygienist',
  'Office Manager',
  'Operations',
  'Treatment Coordinator'
];

export default function AddEmployeeModal({ isOpen, onClose }: AddEmployeeModalProps) {
  const { t } = useTranslations();
  const [formState, setFormState] = useState<EmployeeFormState>(initialState);

  const days = useMemo(() => Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, '0')), []);
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, index) => String(currentYear - index));
  }, []);

  const handleChange = (field: keyof EmployeeFormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState((previous) => ({
      ...previous,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Hook into mutation once backend is ready
    onClose();
    setFormState(initialState);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 py-10">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 transition hover:text-slate-600"
          aria-label={t('Close')}
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>

        <form onSubmit={handleSubmit} className="p-8">
          <header className="mb-8 border-b border-slate-200 pb-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
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
                <h2 className="text-2xl font-semibold text-slate-900">{t('Add employee')}</h2>
                <p className="mt-1 text-sm font-medium uppercase tracking-[0.35em] text-slate-400">
                  {t('Personal Information')}
                </p>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-6 text-sm text-slate-700 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="first-name">
                {t('Name')}
              </label>
              <input
                id="first-name"
                name="first-name"
                value={formState.firstName}
                onChange={handleChange('firstName')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="email">
                {t('Email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange('email')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="last-name">
                {t('Last Name')}
              </label>
              <input
                id="last-name"
                name="last-name"
                value={formState.lastName}
                onChange={handleChange('lastName')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="phone">
                {t('Phone Number')}
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="000-000-0000"
                value={formState.phone}
                onChange={handleChange('phone')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('Date of Birth')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label={t('Birth Month')}
                  value={formState.birthMonth}
                  onChange={handleChange('birthMonth')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  value={formState.birthDay}
                  onChange={handleChange('birthDay')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  value={formState.birthYear}
                  onChange={handleChange('birthYear')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('Start Date')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  aria-label={t('Start Month')}
                  value={formState.startMonth}
                  onChange={handleChange('startMonth')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  value={formState.startDay}
                  onChange={handleChange('startDay')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  value={formState.startYear}
                  onChange={handleChange('startYear')}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="department">
                {t('Department')}
              </label>
              <select
                id="department"
                value={formState.department}
                onChange={handleChange('department')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
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
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="position">
                {t('Position')}
              </label>
              <select
                id="position"
                value={formState.position}
                onChange={handleChange('position')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <option value="" disabled>
                  {t('Select Job')}
                </option>
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="username">
                {t('User')}
              </label>
              <input
                id="username"
                name="username"
                value={formState.username}
                onChange={handleChange('username')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="password">
                {t('Password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formState.password}
                onChange={handleChange('password')}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="submit"
              className="rounded-xl bg-primary-500 px-10 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-lg transition hover:bg-primary-400"
            >
              {t('Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
