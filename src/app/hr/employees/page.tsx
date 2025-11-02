'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_EMPLOYEES } from '@/graphql/employee-queries';
import TopNavigation from '@/components/TopNavigation';
import LogoutButton from '@/components/LogoutButton';
import HrSubNavigation from '@/components/hr/HrSubNavigation';
import AddEmployeeModal from '@/components/hr/AddEmployeeModal';
import { useTranslations } from '@/lib/i18n';

type EmployeeRecord = {
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
};

const pageSizeOptions = [10, 15, 25, 50];

export default function HREmployeesPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch employees from GraphQL
  const { data, loading, error } = useQuery(GET_EMPLOYEES, {
    variables: {
      search: searchTerm || undefined,
      limit: 1000 // Get all employees, we'll handle pagination on the client
    },
    pollInterval: 30000 // Refresh every 30 seconds
  });

  const employees: EmployeeRecord[] = data?.employees || [];

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Admin');
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  // Since we're filtering on the server via GraphQL, we use employees directly
  const filteredEmployees = employees;

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const clampedPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (clampedPage - 1) * pageSize;
    return filteredEmployees.slice(startIndex, startIndex + pageSize);
  }, [clampedPage, filteredEmployees, pageSize]);

  useEffect(() => {
    if (clampedPage !== currentPage) {
      setCurrentPage(clampedPage);
    }
  }, [clampedPage, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const rangeStart = filteredEmployees.length === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(clampedPage * pageSize, filteredEmployees.length);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[120rem]">
        <LogoutButton />
        
        <section className="border-b border-slate-800 bg-slate-900/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <header>
              <p className="text-sm uppercase tracking-widest text-primary-300">{t('HR')}</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-50">{t('Employee directory')}</h1>
              <p className="mt-1 text-slate-300">{t('Welcome back, {name}.', { name: userName || t('team') })}</p>
            </header>

            <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-slate-400">{t('Total Employees')}</p>
              <p className="text-3xl font-semibold text-primary-300">{employees.length}</p>
              <p className="text-xs text-slate-500">{t('Active records')}</p>
            </div>
          </div>

          <TopNavigation />
        </section>

          <main className="overflow-y-auto px-6 py-10 sm:px-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <HrSubNavigation />
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="space-y-1">
                  <label htmlFor="employee-search" className="block text-xs font-semibold uppercase tracking-wider text-primary-300">
                    {t('Search employees')}
                  </label>
                  <input
                    id="employee-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t('Search by name, role, or location')}
                    className="w-64 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/40 focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-primary-400"
                >
                  {t('Add employee')}
                </button>
              </div>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">{t('Team roster')}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-50">{t('List of employees')}</h2>
                  <p className="text-sm text-slate-400">
                    {t('Maintain visibility on roles, locations, and contact details with this live roster.')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <label className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('Show')}</span>
                    <select
                      value={pageSize}
                      onChange={(event) => setPageSize(Number(event.target.value))}
                      className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1 text-sm text-slate-100 focus:border-primary-400/40 focus:outline-none"
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option} value={option} className="bg-slate-900 text-slate-100">
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="text-xs uppercase tracking-[0.35em] text-primary-200/70">{t('entries')}</span>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-200">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-semibold">{t('ID')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Name')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Joined')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Date of birth')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Phone')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Position title')}</th>
                        <th className="px-4 py-3 font-semibold">{t('Location')}</th>
                        <th className="px-4 py-3 font-semibold text-right">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-400 border-t-transparent"></div>
                              <span>{t('Loading employees...')}</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-red-400">
                            {t('Error loading employees. Please try again.')}
                          </td>
                        </tr>
                      ) : paginatedEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            {t('No employees found. Try adjusting your search.')}
                          </td>
                        </tr>
                      ) : (
                        paginatedEmployees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-white/[0.03]">
                            <td className="px-4 py-3 font-medium text-slate-100">{employee.employeeId}</td>
                            <td className="px-4 py-3 text-slate-100">{employee.name}</td>
                            <td className="px-4 py-3 text-slate-300">{employee.joined}</td>
                            <td className="px-4 py-3 text-slate-300">{employee.dateOfBirth}</td>
                            <td className="px-4 py-3 text-slate-300">{employee.phone}</td>
                            <td className="px-4 py-3 text-slate-300">{employee.position}</td>
                            <td className="px-4 py-3 text-slate-300">{employee.location}</td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="rounded-xl border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-white">
                                  {t('View')}
                                </button>
                                <button className="rounded-xl border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-white">
                                  {t('Edit')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  {t('Showing {start} to {end} of {total} employees', {
                    start: rangeStart,
                    end: rangeEnd,
                    total: filteredEmployees.length
                  })}
                </p>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handlePageChange(clampedPage - 1)}
                    className="rounded-xl border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
                    disabled={clampedPage === 1}
                  >
                    {t('Previous')}
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const page = index + 1;
                    const isActive = page === clampedPage;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`rounded-xl px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          isActive
                            ? 'bg-primary-500/20 text-primary-100 ring-1 ring-primary-400/50'
                            : 'border border-white/10 text-slate-200 hover:border-primary-400/40 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(clampedPage + 1)}
                    className="rounded-xl border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-white disabled:cursor-not-allowed disabled:border-white/5 disabled:text-slate-500"
                    disabled={clampedPage === totalPages}
                  >
                    {t('Next')}
                  </button>
                </div>
              </div>
            </section>
          </main>
        <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      </div>
    </div>
  );
}
