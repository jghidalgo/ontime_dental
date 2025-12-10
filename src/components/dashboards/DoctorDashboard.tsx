'use client';

import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import { GET_DOCTOR_SCHEDULES } from '@/graphql/schedule-queries';

export default function DoctorDashboard() {
  const { t } = useTranslations();
  
  const { data } = useQuery(GET_DOCTOR_SCHEDULES);

  const schedules = data?.doctorSchedules || [];
  const todaySchedules = schedules.slice(0, 5);

  const todaysAppointments = [
    { time: '09:00 AM', patient: 'Maria Rodriguez', procedure: 'Crown Preparation', location: 'CE Clinic' },
    { time: '10:30 AM', patient: 'John Smith', procedure: 'Root Canal', location: 'Miller Clinic' },
    { time: '01:00 PM', patient: 'Ana Garcia', procedure: 'Implant Placement', location: 'CE Clinic' },
    { time: '02:30 PM', patient: 'Robert Johnson', procedure: 'Bridge Fitting', location: 'CE Clinic' },
    { time: '04:00 PM', patient: 'Sofia Martinez', procedure: 'Consultation', location: 'Miller Clinic' },
  ];

  return (
    <div className="space-y-6">
      {/* Doctor Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-emerald-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Today\'s Appointments')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">{todaysAppointments.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Scheduled patients')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-blue-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Next Patient')}</p>
          <p className="mt-2 text-xl font-bold text-blue-300">09:00 AM</p>
          <p className="mt-1 text-xs text-slate-500">{t('Maria Rodriguez')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-purple-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Pending Cases')}</p>
          <p className="mt-2 text-3xl font-bold text-purple-300">8</p>
          <p className="mt-1 text-xs text-slate-500">{t('Lab work in progress')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-amber-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('This Week')}</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">42</p>
          <p className="mt-1 text-xs text-slate-500">{t('Total appointments')}</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">{t('Today')}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('My Schedule')}</h2>
            <p className="mt-1 text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:text-white">
            {t('View Full Schedule')}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {todaysAppointments.map((appointment, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 transition hover:border-emerald-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">
                  {appointment.time.split(':')[0]}:{appointment.time.split(':')[1].split(' ')[0]}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-100">{appointment.patient}</p>
                  <p className="text-xs text-slate-400">{appointment.procedure}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">{appointment.location}</p>
                <span className="mt-1 inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  {t('Confirmed')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
            <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Patient Records')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Access medical histories')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
            <svg className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Lab Cases')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Track your cases in lab')}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20">
            <svg className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-100">{t('Documents')}</h3>
          <p className="mt-2 text-sm text-slate-400">{t('Forms and protocols')}</p>
        </div>
      </div>
    </div>
  );
}
