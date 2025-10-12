'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type GroupKey = 'corporate' | 'frontdesk' | 'offices';

type DirectoryEntry = {
  id: string;
  location: string;
  phone: string;
  extension: string;
  department: string;
  employee: string;
};

type DirectoryEntity = {
  id: string;
  name: string;
  groups: Record<GroupKey, DirectoryEntry[]>;
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

const contactSections = [
  { id: 'extensions', label: 'Extensions' },
  { id: 'medical-centers', label: 'Medical Centers' },
  { id: 'transportation', label: 'Transportation' },
  { id: 'locations-search', label: 'Locations Search' }
] as const;

type ContactSectionId = (typeof contactSections)[number]['id'];

const groupLabels: Record<GroupKey, string> = {
  corporate: 'Corporate',
  frontdesk: 'Front Desk',
  offices: 'Offices'
};

const directory: DirectoryEntity[] = [
  {
    id: 'bluno-james',
    name: 'Bluno James Dental Group',
    groups: {
      corporate: [
        {
          id: 'EXT-100',
          location: 'Coral Gables HQ',
          phone: '(305) 555-1100',
          extension: '1001',
          department: 'Executive Suite',
          employee: 'Damaris Núñez'
        },
        {
          id: 'EXT-101',
          location: 'Coral Gables HQ',
          phone: '(305) 555-1100',
          extension: '1015',
          department: 'Operations',
          employee: 'Kevin Ortega'
        }
      ],
      frontdesk: [
        {
          id: 'EXT-201',
          location: 'CE Miller Front Desk',
          phone: '(305) 555-2002',
          extension: '2002',
          department: 'Reception',
          employee: 'Naomi Chen'
        },
        {
          id: 'EXT-202',
          location: 'CE Miller Front Desk',
          phone: '(305) 555-2003',
          extension: '2003',
          department: 'Patient Liaison',
          employee: 'Isaac Ponce'
        }
      ],
      offices: [
        {
          id: 'EXT-301',
          location: 'CE Coral Gables',
          phone: '(305) 555-3001',
          extension: '3010',
          department: 'Hygiene',
          employee: 'Alexis Stone'
        },
        {
          id: 'EXT-302',
          location: 'Miller Dental',
          phone: '(305) 555-3012',
          extension: '3012',
          department: 'Orthodontics',
          employee: 'Dr. Farid Blanco'
        }
      ]
    }
  },
  {
    id: 'ontime-holdings',
    name: 'OnTime Dental Holdings',
    groups: {
      corporate: [
        {
          id: 'EXT-410',
          location: 'San Juan Support Center',
          phone: '(787) 555-4100',
          extension: '4100',
          department: 'Finance',
          employee: 'Maya Rivera'
        },
        {
          id: 'EXT-411',
          location: 'San Juan Support Center',
          phone: '(787) 555-4101',
          extension: '4108',
          department: 'Human Resources',
          employee: 'Carlos Vélez'
        }
      ],
      frontdesk: [
        {
          id: 'EXT-512',
          location: 'Old San Juan Clinic',
          phone: '(787) 555-5200',
          extension: '5202',
          department: 'Reception',
          employee: 'Luz Martínez'
        }
      ],
      offices: [
        {
          id: 'EXT-620',
          location: 'Caguas Specialty',
          phone: '(787) 555-6200',
          extension: '6215',
          department: 'Pediatric Dentistry',
          employee: 'Dr. Elisa Navarro'
        },
        {
          id: 'EXT-621',
          location: 'Bayamón Family Dental',
          phone: '(787) 555-6210',
          extension: '6218',
          department: 'Endodontics',
          employee: 'Dr. Samuel Ortiz'
        }
      ]
    }
  }
];

export default function ContactsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>('');
  const [activeSection, setActiveSection] = useState<ContactSectionId>('extensions');
  const [formEntityId, setFormEntityId] = useState<string>(directory[0]?.id ?? '');
  const [formGroupId, setFormGroupId] = useState<GroupKey>('corporate');
  const [activeSelection, setActiveSelection] = useState<{ entityId: string; group: GroupKey }>(() => ({
    entityId: directory[0]?.id ?? '',
    group: 'corporate'
  }));

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  useEffect(() => {
    const entity = directory.find((item) => item.id === formEntityId);
    if (!entity) return;

    if (!entity.groups[formGroupId]?.length) {
      setFormGroupId('corporate');
    }
  }, [formEntityId, formGroupId]);

  const navigationWithState = useMemo(
    () => navigationItems.map((item) => ({ ...item, isActive: pathname === item.href })),
    [pathname]
  );

  const selectedEntity = useMemo(
    () => directory.find((item) => item.id === activeSelection.entityId) ?? directory[0],
    [activeSelection.entityId]
  );

  const selectedEntries = selectedEntity?.groups[activeSelection.group] ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSelection({ entityId: formEntityId, group: formGroupId });
  };

  const isExtensionsSection = activeSection === 'extensions';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[120rem]">
        <aside className="hidden w-72 flex-col border-r border-white/5 bg-white/[0.02] px-6 py-10 backdrop-blur-2xl lg:flex">
          <div>
            <div className="flex items-center gap-3 text-slate-100">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-500/15 text-sm font-semibold uppercase tracking-[0.35em] text-primary-100 ring-1 ring-primary-400/30">
                OD
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.45em] text-primary-200/70">OnTime</p>
                <p className="text-base font-semibold text-slate-50">Dental OS</p>
              </div>
            </div>

            <nav className="mt-12 space-y-1">
              {navigationWithState.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    item.isActive
                      ? 'border-primary-400/60 bg-primary-500/15 text-white shadow-lg shadow-primary-900/30'
                      : 'border-white/5 text-slate-300 hover:border-primary-400/40 hover:bg-white/[0.06] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`text-xs font-semibold uppercase tracking-[0.3em] ${item.isActive ? 'text-primary-200' : 'text-slate-500'}`}>
                    {item.isActive ? '•' : '→'}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-300 shadow-2xl shadow-slate-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-primary-200/70">Directory tip</p>
            <p className="mt-3 text-base font-semibold text-slate-50">Keep contacts current</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Ensure reception and operations teams know the fastest way to reach every location. Update extensions whenever new team members onboard.
            </p>
            <button className="mt-4 w-full rounded-2xl border border-primary-400/30 bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-50 transition hover:bg-primary-400/30">
              Submit update
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex flex-col gap-8 border-b border-white/5 bg-white/[0.02] px-6 pb-10 pt-10 backdrop-blur-2xl lg:px-12">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.35em] text-primary-200/70">Contacts hub</p>
                <h1 className="text-3xl font-semibold text-slate-50">Reach every OnTime team instantly</h1>
                <p className="max-w-2xl text-sm text-slate-400">
                  Browse location extensions, clinic reception desks, and support center directories. Use the filters below to quickly surface the numbers you need.
                </p>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-auto">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                  Signed in as <span className="font-semibold text-slate-100">{userName || 'team'}</span>
                </div>
                <button
                  onClick={() => {
                    window.localStorage.removeItem('ontime.authToken');
                    router.push('/login');
                  }}
                  className="rounded-2xl bg-primary-500/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                >
                  Logout
                </button>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 border-t border-white/5 pt-6">
              {contactSections.map((section) => {
                const isLocationsLink = section.id === 'locations-search';
                const isActive = !isLocationsLink && activeSection === section.id;

                if (isLocationsLink) {
                  return (
                    <Link
                      key={section.id}
                      href="/contacts/locations-search"
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-300 transition hover:border-primary-400/40 hover:text-white"
                    >
                      {section.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-500/90 text-slate-900 shadow-lg shadow-primary-900/40'
                        : 'border border-white/10 bg-white/5 text-slate-300 hover:border-primary-400/40 hover:text-white'
                    }`}
                  >
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="relative mx-auto max-w-6xl px-6 py-12 lg:px-10">
            {isExtensionsSection ? (
              <div className="space-y-10">
                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-4">
                      <span className="inline-flex items-center rounded-full bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary-100">
                        Extensions
                      </span>
                      <h2 className="text-3xl font-semibold text-slate-50">Directory filters</h2>
                      <p className="max-w-xl text-sm text-slate-400">
                        Select an entity and group to see the most up-to-date extension numbers for front office and operational teams across the network.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Select an entity</label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <select
                            value={formEntityId}
                            onChange={(event) => setFormEntityId(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition focus:border-primary-400/60 focus:text-white"
                          >
                            {directory.map((entity) => (
                              <option key={entity.id} value={entity.id}>
                                {entity.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Select a group</label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <select
                            value={formGroupId}
                            onChange={(event) => setFormGroupId(event.target.value as GroupKey)}
                            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition focus:border-primary-400/60 focus:text-white"
                          >
                            {(Object.keys(groupLabels) as GroupKey[]).map((groupKey) => (
                              <option key={groupKey} value={groupKey}>
                                {groupLabels[groupKey]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400"
                      >
                        Go
                      </button>
                    </form>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Results</p>
                      <h3 className="text-2xl font-semibold text-slate-50">
                        {groupLabels[activeSelection.group]} · {selectedEntity?.name}
                      </h3>
                      <p className="text-sm text-slate-400">{selectedEntries.length} contacts matched your filters.</p>
                    </div>
                    <button className="self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white">
                      Export directory
                    </button>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-white/5">
                    <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-200">
                      <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
                        <tr>
                          <th className="px-4 py-3 font-medium">ID</th>
                          <th className="px-4 py-3 font-medium">Location</th>
                          <th className="px-4 py-3 font-medium">Phone number</th>
                          <th className="px-4 py-3 font-medium">Ext</th>
                          <th className="px-4 py-3 font-medium">Department</th>
                          <th className="px-4 py-3 font-medium">Employee</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedEntries.length ? (
                          selectedEntries.map((entry) => (
                            <tr key={entry.id} className="transition hover:bg-primary-500/10">
                              <td className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/60">{entry.id}</td>
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.location}</td>
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.phone}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-primary-100">{entry.extension}</td>
                              <td className="px-4 py-3 text-sm text-slate-200">{entry.department}</td>
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.employee}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-400">
                              No contacts found for this group. Try a different filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            ) : (
              <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
                <div className="mx-auto max-w-xl space-y-4">
                  <span className="inline-flex items-center rounded-full bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary-100">
                    Coming soon
                  </span>
                  <h2 className="text-3xl font-semibold text-slate-50">
                    {contactSections.find((section) => section.id === activeSection)?.label} directory is in progress
                  </h2>
                  <p className="text-sm text-slate-400">
                    We&apos;re preparing resources for this section. In the meantime, use the extensions view to reach our front desks and corporate teams.
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
