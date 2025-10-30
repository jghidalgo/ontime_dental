'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TopNavigation from '@/components/TopNavigation';
import HrSubNavigation from '@/components/hr/HrSubNavigation';
import { useTranslations } from '@/lib/i18n';

type EmployeeRecord = {
  id: string;
  name: string;
  joined: string;
  dateOfBirth: string;
  phone: string;
  position: string;
  location: string;
};

const employees: EmployeeRecord[] = [
  {
    id: 'EMP-001',
    name: 'Ariel Gonzalez',
    joined: '02/15/2019',
    dateOfBirth: '09/22/1988',
    phone: '(786) 712-2643',
    position: 'Hygienist',
    location: 'Little Havana'
  },
  {
    id: 'EMP-002',
    name: 'Dania Rojas',
    joined: '11/03/2021',
    dateOfBirth: '08/07/1990',
    phone: '(786) 723-5386',
    position: '3D Milling',
    location: 'Pembroke Pines'
  },
  {
    id: 'EMP-003',
    name: 'Dulce Mejia',
    joined: '07/18/2022',
    dateOfBirth: '05/03/1994',
    phone: '(786) 620-7683',
    position: 'Lab Tech',
    location: 'Tamami'
  },
  {
    id: 'EMP-004',
    name: 'Jaime Fernandez',
    joined: '04/02/2020',
    dateOfBirth: '11/09/1987',
    phone: '(786) 712-4421',
    position: 'Front Desk',
    location: 'Tamami'
  },
  {
    id: 'EMP-005',
    name: 'Maria Flores',
    joined: '12/11/2023',
    dateOfBirth: '01/27/1996',
    phone: '(786) 731-9823',
    position: 'Billing Specialist',
    location: 'Pembroke Pines'
  },
  {
    id: 'EMP-006',
    name: 'Isabel Rodriguez',
    joined: '03/25/2018',
    dateOfBirth: '06/17/1984',
    phone: '(305) 442-7612',
    position: 'Practice Manager',
    location: 'Little Havana'
  },
  {
    id: 'EMP-007',
    name: 'Marco Salazar',
    joined: '10/09/2017',
    dateOfBirth: '09/03/1980',
    phone: '(305) 456-2134',
    position: 'Operations Director',
    location: 'Corporate'
  },
  {
    id: 'EMP-008',
    name: 'Naira Gutierrez',
    joined: '05/14/2020',
    dateOfBirth: '04/19/1992',
    phone: '(786) 745-3312',
    position: 'Dental Assistant',
    location: 'Pembroke Pines'
  },
  {
    id: 'EMP-009',
    name: 'Marina Perez',
    joined: '01/05/2016',
    dateOfBirth: '12/31/1985',
    phone: '(305) 890-3321',
    position: 'Office Manager',
    location: 'Tamami'
  },
  {
    id: 'EMP-010',
    name: 'Nelson Ochoa',
    joined: '08/12/2015',
    dateOfBirth: '03/22/1978',
    phone: '(786) 321-7763',
    position: 'Lead Technician',
    location: 'Lab'
  },
  {
    id: 'EMP-011',
    name: 'Mayra Santos',
    joined: '06/23/2022',
    dateOfBirth: '07/01/1993',
    phone: '(954) 221-4563',
    position: 'Recruiter',
    location: 'Corporate'
  },
  {
    id: 'EMP-012',
    name: 'Antonio Vega',
    joined: '09/02/2020',
    dateOfBirth: '11/04/1989',
    phone: '(786) 621-0043',
    position: 'Supply Coordinator',
    location: 'Little Havana'
  },
  {
    id: 'EMP-013',
    name: 'Camila Duarte',
    joined: '02/18/2021',
    dateOfBirth: '10/11/1991',
    phone: '(305) 442-1098',
    position: 'Benefits Specialist',
    location: 'Corporate'
  },
  {
    id: 'EMP-014',
    name: 'Jorge Castillo',
    joined: '03/10/2014',
    dateOfBirth: '01/09/1975',
    phone: '(786) 773-2109',
    position: 'Facilities Manager',
    location: 'Tamami'
  },
  {
    id: 'EMP-015',
    name: 'Liliana Paredes',
    joined: '11/28/2018',
    dateOfBirth: '02/12/1986',
    phone: '(954) 833-9987',
    position: 'Insurance Coordinator',
    location: 'Pembroke Pines'
  },
  {
    id: 'EMP-016',
    name: 'Orlando Peres',
    joined: '09/09/2019',
    dateOfBirth: '06/21/1982',
    phone: '(786) 665-0987',
    position: 'Finance Analyst',
    location: 'Corporate'
  },
  {
    id: 'EMP-017',
    name: 'Patricia Lewis',
    joined: '07/30/2016',
    dateOfBirth: '04/30/1984',
    phone: '(305) 214-1121',
    position: 'Compliance Lead',
    location: 'Corporate'
  },
  {
    id: 'EMP-018',
    name: 'Quincy Howard',
    joined: '05/04/2023',
    dateOfBirth: '05/29/1995',
    phone: '(786) 454-3345',
    position: 'Front Desk',
    location: 'Little Havana'
  },
  {
    id: 'EMP-019',
    name: 'Rocio Navarro',
    joined: '10/22/2019',
    dateOfBirth: '09/13/1987',
    phone: '(786) 201-9764',
    position: 'Hygienist',
    location: 'Pembroke Pines'
  },
  {
    id: 'EMP-020',
    name: 'Santiago Alvarez',
    joined: '01/18/2015',
    dateOfBirth: '07/02/1981',
    phone: '(305) 890-7765',
    position: 'Lab Supervisor',
    location: 'Lab'
  },
  {
    id: 'EMP-021',
    name: 'Tatiana Ortiz',
    joined: '12/07/2021',
    dateOfBirth: '10/18/1992',
    phone: '(786) 478-0921',
    position: 'Dental Assistant',
    location: 'Tamami'
  }
];

const pageSizeOptions = [10, 15, 25, 50];

export default function HREmployeesPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }

    const normalizedTerm = searchTerm.toLowerCase();

    return employees.filter((employee) =>
      [employee.id, employee.name, employee.position, employee.location, employee.phone]
        .join(' ')
        .toLowerCase()
        .includes(normalizedTerm)
    );
  }, [searchTerm]);

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
        <section className="border-b border-slate-800 bg-slate-900/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <header>
              <p className="text-sm uppercase tracking-widest text-primary-300">{t('HR')}</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-50">{t('Employee directory')}</h1>
              <p className="mt-1 text-slate-300">{t('Welcome back, {name}.', { name: userName || t('team') })}</p>
            </header>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="space-y-2">
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

              <button className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-primary-400">
                {t('Add employee')}
              </button>
            </div>
          </div>

          <TopNavigation />
        </section>

          <main className="overflow-y-auto px-6 py-10 sm:px-10">
            <HrSubNavigation />

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
                      {paginatedEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                            {t('No employees found. Try adjusting your search.')}
                          </td>
                        </tr>
                      ) : (
                        paginatedEmployees.map((employee) => (
                          <tr key={employee.id} className="hover:bg-white/[0.03]">
                            <td className="px-4 py-3 font-medium text-slate-100">{employee.id}</td>
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
      </div>
    </div>
  );
}
