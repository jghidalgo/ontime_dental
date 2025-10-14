'use client';

import Link from 'next/link';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client';

import { useTranslations } from '@/lib/i18n';
import { GET_TICKETS } from '@/graphql/ticket-queries';
import { CREATE_TICKET, UPDATE_TICKET, DELETE_TICKET } from '@/graphql/ticket-mutations';

type TicketStatus = 'new' | 'in_progress' | 'waiting' | 'resolved';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

type TicketUpdate = {
  timestamp: string;
  message: string;
  user: string;
};

type Ticket = {
  id: string;
  subject: string;
  requester: string;
  location: string;
  channel: string;
  category: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  dueDate: string;
  updates: TicketUpdate[];
  satisfaction?: string;
};

type TicketFormState = {
  subject: string;
  requester: string;
  location: string;
  category: string;
  priority: TicketPriority;
  description: string;
};

const navigationItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Patients', href: '/patients' },
  { label: 'Laboratory', href: '/laboratory' },
  { label: 'Documents', href: '/documents' },
  { label: 'Contacts', href: '/contacts' },
  { label: 'Schedules', href: '/schedules' },
  { label: 'Insurances', href: '/insurances' },
  { label: 'Complaints', href: '/complaints' },
  { label: 'Licenses', href: '/licenses' },
  { label: 'Medication', href: '/medication' },
  { label: 'HR', href: '/hr' },
  { label: 'Tickets', href: '/tickets' }
];

const statusStyles: Record<TicketStatus, string> = {
  new: 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/40',
  in_progress: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40',
  waiting: 'bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/40',
  resolved: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40'
};

const priorityStyles: Record<TicketPriority, string> = {
  low: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/30',
  medium: 'bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/30',
  high: 'bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30',
  urgent: 'bg-rose-500/10 text-rose-200 ring-1 ring-rose-500/30'
};

const categoryPalettes: Record<string, string> = {
  Equipment: 'bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-500/30',
  Facilities: 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-500/30',
  HR: 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-500/30',
  'IT Support': 'bg-indigo-500/10 text-indigo-200 ring-1 ring-indigo-500/30',
  Clinical: 'bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-500/30',
  Supplies: 'bg-blue-500/10 text-blue-200 ring-1 ring-blue-500/30',
  'Patient Care': 'bg-pink-500/10 text-pink-200 ring-1 ring-pink-500/30',
  Training: 'bg-purple-500/10 text-purple-200 ring-1 ring-purple-500/30',
  Other: 'bg-slate-500/10 text-slate-200 ring-1 ring-slate-500/30'
};

const ticketStatuses: TicketStatus[] = ['new', 'in_progress', 'waiting', 'resolved'];

const defaultFormState: TicketFormState = {
  subject: '',
  requester: '',
  location: '',
  category: 'IT Support',
  priority: 'medium',
  description: ''
};

export default function TicketsPage() {
  const { t, language } = useTranslations();
  const locale = language === 'es' ? 'es-ES' : 'en-US';

  const statusLabels = useMemo<Record<TicketStatus, string>>(
    () => ({
      new: t('New'),
      in_progress: t('In Progress'),
      waiting: t('Waiting on Response'),
      resolved: t('Resolved')
    }),
    [t]
  );

  const statusDescriptions = useMemo<Record<TicketStatus, string>>(
    () => ({
      new: t('Awaiting triage'),
      in_progress: t('Actively being worked'),
      waiting: t('Pending external action'),
      resolved: t('Completed and documented')
    }),
    [t]
  );

  const priorityLabels = useMemo<Record<TicketPriority, string>>(
    () => ({
      low: t('Low'),
      medium: t('Medium'),
      high: t('High'),
      urgent: t('Urgent')
    }),
    [t]
  );

  const categoryLabels = useMemo<Record<string, string>>(
    () => ({
      'IT Support': t('IT Support'),
      Equipment: t('Equipment'),
      Facilities: t('Facilities'),
      HR: t('HR'),
      Clinical: t('Clinical'),
      Supplies: t('Supplies'),
      'Patient Care': t('Patient Care'),
      Training: t('Training'),
      Other: t('Other')
    }),
    [t]
  );

  const formatDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleString(locale, {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
    [locale]
  );

  // Map backend status to UI status
  const mapStatusToUI = (backendStatus: string): TicketStatus => {
    const mapping: Record<string, TicketStatus> = {
      'Open': 'new',
      'In Progress': 'in_progress',
      'Scheduled': 'waiting',
      'Resolved': 'resolved'
    };
    return mapping[backendStatus] || 'new';
  };

  // Map UI status to backend status
  const mapStatusToBackend = (uiStatus: TicketStatus): string => {
    const mapping: Record<TicketStatus, string> = {
      'new': 'Open',
      'in_progress': 'In Progress',
      'waiting': 'Scheduled',
      'resolved': 'Resolved'
    };
    return mapping[uiStatus];
  };

  // Map backend priority to UI priority
  const mapPriorityToUI = (backendPriority: string): TicketPriority => {
    if (backendPriority === 'Low') return 'low';
    if (backendPriority === 'Medium') return 'medium';
    if (backendPriority === 'High') return 'urgent'; // Treating High as urgent for UI
    return 'medium';
  };

  // Map UI priority to backend priority
  const mapPriorityToBackend = (uiPriority: TicketPriority): string => {
    const mapping: Record<TicketPriority, string> = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'High' // Map urgent to High in backend
    };
    return mapping[uiPriority];
  };

  // Fetch tickets from GraphQL
  const { data, loading, refetch } = useQuery(GET_TICKETS);
  const [createTicketMutation] = useMutation(CREATE_TICKET);
  const [updateTicketMutation] = useMutation(UPDATE_TICKET);
  const [deleteTicketMutation] = useMutation(DELETE_TICKET);

  // Transform GraphQL data to UI format
  const tickets = useMemo((): Ticket[] => {
    if (!data?.tickets) return [];
    return data.tickets.map((ticket: any): Ticket => ({
      ...ticket,
      status: mapStatusToUI(ticket.status),
      priority: mapPriorityToUI(ticket.priority),
      updates: ticket.updates || [],
      satisfaction: ticket.satisfaction || ''
    }));
  }, [data]);

  const [form, setForm] = useState<TicketFormState>(defaultFormState);
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [search, setSearch] = useState('');

  const metrics = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved');
    const urgentTickets = tickets.filter((ticket) => ticket.priority === 'urgent');
    const waitingTickets = tickets.filter((ticket) => ticket.status === 'waiting');
    
    // Calculate satisfaction - default to 100 if not available
    const satisfaction = tickets.length
      ? Math.round(
          tickets.reduce((acc, ticket) => {
            const val = ticket.satisfaction ? 
              (ticket.satisfaction === 'Satisfied' ? 100 : ticket.satisfaction === 'Neutral' ? 50 : 0) : 
              100;
            return acc + val;
          }, 0) / tickets.length
        )
      : 0;

    return {
      open: openTickets.length,
      urgent: urgentTickets.length,
      waiting: waitingTickets.length,
      satisfaction
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesSearch = search
        ? [
            ticket.subject,
            ticket.requester,
            ticket.location,
            ticket.category,
            ticket.id
          ]
            .join(' ')
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;

      return matchesStatus && matchesSearch;
    });
  }, [tickets, statusFilter, search]);

  const statusBreakdown = useMemo(() => {
    return ticketStatuses.map((status) => {
      const count = tickets.filter((ticket) => ticket.status === status).length;
      const percentage = tickets.length ? Math.round((count / tickets.length) * 100) : 0;

      return { status, count, percentage };
    });
  }, [tickets]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject || !form.requester || !form.location || !form.description) {
      return;
    }

    const now = new Date();
    const dueDate = new Date(now.getTime() + 1000 * 60 * 60 * 24);

    try {
      await createTicketMutation({
        variables: {
          input: {
            subject: form.subject,
            requester: form.requester,
            location: form.location,
            channel: 'Portal',
            category: form.category,
            description: form.description,
            status: mapStatusToBackend('new'),
            priority: mapPriorityToBackend(form.priority),
            dueDate: dueDate.toISOString(),
            updates: [
              {
                timestamp: now.toISOString(),
                message: 'Ticket created',
                user: form.requester
              }
            ]
          }
        }
      });

      await refetch();
      setForm(defaultFormState);
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-300">{t('Support Hub')}</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('Tickets')}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {t(
                'Monitor live requests, prioritize escalations, and deliver quick resolutions across every OnTime Dental clinic.'
              )}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">{t('Average satisfaction')}</p>
            <p className="text-3xl font-semibold text-emerald-300">{metrics.satisfaction}%</p>
            <p className="text-xs text-slate-500">{t('Based on last 30 closed tickets')}</p>
          </div>
        </div>
        <nav className="mt-6 border-t border-slate-800">
          <ul className="mx-auto flex max-w-7xl flex-wrap gap-2 px-6 py-4 text-sm text-slate-300">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition ${
                    item.href === '/tickets'
                      ? 'bg-primary-500/20 text-primary-200'
                      : 'hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-primary-900/10">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t('Active tickets')}</p>
          <p className="mt-2 text-4xl font-semibold text-white">{metrics.open}</p>
          <p className="mt-3 text-xs text-slate-400">{t('New, in progress, and waiting requests')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-primary-900/10">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t('Urgent escalations')}</p>
          <p className="mt-2 text-4xl font-semibold text-rose-200">{metrics.urgent}</p>
          <p className="mt-3 text-xs text-slate-400">{t('Equipment failures and clinic outages')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-primary-900/10">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t('Awaiting clinics')}</p>
          <p className="mt-2 text-4xl font-semibold text-amber-200">{metrics.waiting}</p>
          <p className="mt-3 text-xs text-slate-400">{t('Tickets pending feedback or confirmation')}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-primary-900/10">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t('Response playbook')}</p>
          <p className="mt-2 text-base text-slate-300">
            {t('Trigger automatic alerts for urgent tickets and share live updates with clinic leaders.')}
          </p>
          <button className="mt-4 w-full rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-400">
            {t('Open escalation matrix')}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">{t('Live queue')}</h2>
                <p className="text-sm text-slate-400">
                  {t('Filter by status, drill into tickets, and follow resolution updates in real time.')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/60 px-3 py-1.5">
                  <span className="text-xs text-slate-500">{t('Filter')}</span>
                  {(['all', ...ticketStatuses] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        statusFilter === status
                          ? 'bg-primary-500/20 text-primary-100'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'all' ? t('All') : statusLabels[status]}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-9 w-48 rounded-full border border-slate-800 bg-slate-950/60 px-4 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                    placeholder={t('Search tickets')}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                    ⌕
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center text-sm text-slate-400">
                  {t('No tickets found. Try adjusting your filters or creating a new ticket below.')}
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 transition hover:border-primary-500/60 hover:shadow-lg hover:shadow-primary-900/10"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-slate-800 px-3 py-1 text-xs font-semibold text-slate-400">
                            {ticket.id}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[ticket.status]}`}>
                            {statusLabels[ticket.status]}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[ticket.priority]}`}
                          >
                            {t('Priority')} · {priorityLabels[ticket.priority]}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              categoryPalettes[ticket.category] ?? 'bg-slate-500/10 text-slate-200'
                            }`}
                          >
                            {categoryLabels[ticket.category] ?? ticket.category}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                        <p className="text-sm text-slate-400">{ticket.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                          <span>{t('Requester: {requester}', { requester: ticket.requester })}</span>
                          <span>{t('Clinic: {clinic}', { clinic: ticket.location })}</span>
                          <span>{t('Channel: {channel}', { channel: ticket.channel })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between text-right text-xs text-slate-400">
                        <div>
                          <p className="font-semibold text-slate-200">{t('Created')}</p>
                          <p>{formatDate(ticket.createdAt)}</p>
                        </div>
                        <div className="mt-3">
                          <p className="font-semibold text-slate-200">{t('Target Resolution')}</p>
                          <p>{formatDate(ticket.dueDate)}</p>
                        </div>
                        <div className="mt-3">
                          <p className="font-semibold text-slate-200">{t('Updates')}</p>
                          <p>{t('{count} touchpoints logged', { count: ticket.updates.length.toString() })}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">{t('Create new ticket')}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {t('Log a clinic request. A coordinator will triage it instantly and send updates to the requester.')}
            </p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200">
                {t('Subject')}
                <input
                  value={form.subject}
                  onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
                  placeholder={t('Describe the issue')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                {t('Requester')}
                <input
                  value={form.requester}
                  onChange={(event) => setForm((prev) => ({ ...prev, requester: event.target.value }))}
                  placeholder={t('Clinic contact')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                {t('Clinic / Location')}
                <input
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder={t('Where is this happening?')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  required
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                {t('Category')}
                <select
                  value={form.category}
                  onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                >
                  <option value="IT Support">{t('IT Support')}</option>
                  <option value="Equipment">{t('Equipment')}</option>
                  <option value="Facilities">{t('Facilities')}</option>
                  <option value="HR">{t('HR')}</option>
                  <option value="Clinical">{t('Clinical')}</option>
                  <option value="Supplies">{t('Supplies')}</option>
                  <option value="Patient Care">{t('Patient Care')}</option>
                  <option value="Training">{t('Training')}</option>
                  <option value="Other">{t('Other')}</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                {t('Priority')}
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priority: event.target.value as TicketPriority }))
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-primary-400 focus:outline-none"
                >
                  <option value="low">{t('Low')}</option>
                  <option value="medium">{t('Medium')}</option>
                  <option value="high">{t('High')}</option>
                  <option value="urgent">{t('Urgent')}</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
                {t('Detailed description')}
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  rows={4}
                  placeholder={t('Provide context, impacted patients, and any steps already taken.')}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  required
                />
              </label>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                <p className="text-xs text-slate-500">
                  {t('By submitting you will notify the operations coordination team and start the SLA clock.')}
                </p>
                <button
                  type="submit"
                  className="rounded-lg bg-primary-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-400"
                >
                  {t('Log ticket')}
                </button>
              </div>
            </form>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">{t('Status radar')}</h2>
            <p className="mt-1 text-sm text-slate-400">{t('Snapshot of volume by lifecycle stage.')}</p>
            <ul className="mt-5 space-y-4">
              {statusBreakdown.map((item) => (
                <li key={item.status} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-200">{statusLabels[item.status]}</p>
                    <p className="text-xs text-slate-500">{statusDescriptions[item.status]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{item.count}</p>
                    <p className="text-xs text-slate-500">
                      {t('{percentage}% of tickets', { percentage: item.percentage.toString() })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">{t('Operations bulletin')}</h2>
            <ul className="mt-4 space-y-4 text-sm text-slate-300">
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">{t('Digital workflows')}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {t('Every urgent ticket sends SMS alerts to regional directors for faster acknowledgment.')}
                </p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">{t('Sunrise huddles')}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {t('Share overnight ticket summaries with on-call dentists before the first appointment block.')}
                </p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">{t('Learning loop')}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {t('Resolved tickets with high satisfaction feed back into our service playbook templates.')}
                </p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-primary-500/10 via-primary-500/0 to-primary-500/20 p-6">
            <h2 className="text-xl font-semibold text-white">{t('VIP monitoring')}</h2>
            <p className="mt-1 text-sm text-slate-200">
              {t('Enable concierge tracking for executives, urgent surgical cases, and enterprise partners.')}
            </p>
            <button className="mt-4 w-full rounded-lg border border-primary-400/40 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-100 transition hover:border-primary-300 hover:bg-primary-500/30">
              {t('Launch white-glove view')}
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
