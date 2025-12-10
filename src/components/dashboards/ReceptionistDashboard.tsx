'use client';

import { useTranslations } from '@/lib/i18n';
import { useQuery } from '@apollo/client';
import { GET_TICKETS } from '@/graphql/ticket-queries';

export default function ReceptionistDashboard() {
  const { t } = useTranslations();
  
  const { data } = useQuery(GET_TICKETS);

  const tickets = data?.tickets || [];
  const openTickets = tickets.filter((t: any) => t.status === 'Open' || t.status === 'In Progress');
  const urgentTickets = tickets.filter((t: any) => t.priority === 'High');
  const myTickets = tickets.slice(0, 6);

  const upcomingCheckins = [
    { time: '08:30 AM', patient: 'Carlos Mendez', doctor: 'Dr. Blanco', type: 'Check-up' },
    { time: '09:15 AM', patient: 'Laura Gonzalez', doctor: 'Dr. Lee', type: 'Follow-up' },
    { time: '10:00 AM', patient: 'Miguel Torres', doctor: 'Dr. Crespo', type: 'Consultation' },
    { time: '11:30 AM', patient: 'Patricia Ruiz', doctor: 'Dr. Fernández', type: 'Treatment' },
    { time: '02:00 PM', patient: 'Jorge Martinez', doctor: 'Dr. Rivera', type: 'Emergency' },
  ];

  return (
    <div className="space-y-6">
      {/* Receptionist Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-blue-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Today\'s Check-ins')}</p>
          <p className="mt-2 text-3xl font-bold text-blue-300">{upcomingCheckins.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Scheduled arrivals')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-amber-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Open Tickets')}</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">{openTickets.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Support requests')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-rose-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Urgent Tickets')}</p>
          <p className="mt-2 text-3xl font-bold text-rose-300">{urgentTickets.length}</p>
          <p className="mt-1 text-xs text-slate-500">{t('Need attention')}</p>
        </div>

        <div className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl transition hover:border-emerald-400/30">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('Rooms Available')}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">4/6</p>
          <p className="mt-1 text-xs text-slate-500">{t('Ready for patients')}</p>
        </div>
      </div>

      {/* Today's Check-ins */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200/80">{t('Today')}</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('Upcoming Check-ins')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('Patients arriving today')}</p>
          </div>
          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-blue-400/30 hover:text-white">
            {t('Check In Patient')}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {upcomingCheckins.map((checkin, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 transition hover:border-blue-400/30 hover:bg-white/[0.06]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-300">
                  {checkin.time}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-100">{checkin.patient}</p>
                  <p className="text-xs text-slate-400">{checkin.doctor} • {checkin.type}</p>
                </div>
              </div>
              <button className="rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400">
                {t('Check In')}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-200/80">{t('Support')}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-50">{t('My Tickets')}</h2>
              <p className="mt-1 text-sm text-slate-400">{t('Recent support requests')}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {myTickets.slice(0, 4).map((ticket: any, index: number) => (
              <div
                key={ticket.id || index}
                className="rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition hover:border-amber-400/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-slate-400 truncate">{ticket.category}</p>
                  </div>
                  <span className={`flex-shrink-0 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    ticket.status === 'Open' 
                      ? 'bg-blue-500/10 text-blue-300'
                      : ticket.status === 'In Progress'
                      ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
              <svg className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{t('Appointments')}</h3>
            <p className="mt-2 text-sm text-slate-400">{t('Schedule and manage appointments')}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20">
              <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{t('Contacts')}</h3>
            <p className="mt-2 text-sm text-slate-400">{t('Access clinic directory')}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-slate-900/70 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20">
              <svg className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{t('Documents')}</h3>
            <p className="mt-2 text-sm text-slate-400">{t('Forms and patient records')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
