'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';

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

type DocumentRecord = {
  id: string;
  title: string;
  version: string;
  date: string;
  description: string;
  url: string;
  fileName?: string;
};

type DocumentGroup = {
  id: string;
  name: string;
  documents: DocumentRecord[];
};

type DocumentEntity = {
  id: string;
  name: string;
  groups: DocumentGroup[];
};

const initialDocumentCatalog: DocumentEntity[] = [
  {
    id: 'blanco-amos-dental-group',
    name: 'Blanco Amos Dental Group',
    groups: [
      {
        id: 'front-desk-forms',
        name: 'Front Desk Forms',
        documents: [
          {
            id: 'FD-142',
            title: 'Patient Welcome Packet (English)',
            version: '2.3',
            date: '05/14/2024',
            description: 'Updated intake checklist and consent signatures.',
            url: '#'
          },
          {
            id: 'FD-143',
            title: 'Patient Welcome Packet (Spanish)',
            version: '2.3',
            date: '05/14/2024',
            description: 'Translated materials for bilingual offices.',
            url: '#'
          }
        ]
      },
      {
        id: 'hr-forms',
        name: 'Human Resources Forms',
        documents: [
          {
            id: 'HR-209',
            title: 'Time-Off Request Policy',
            version: '1.4',
            date: '01/09/2024',
            description: 'Submission deadlines and approval routing details.',
            url: '#'
          },
          {
            id: 'HR-214',
            title: 'Employee Acknowledgement Form',
            version: '1.0',
            date: '11/22/2023',
            description: 'Signature form for new handbook policies.',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    id: 'complete-dental-lab',
    name: 'Complete Dental Lab',
    groups: [
      {
        id: 'front-desk-forms',
        name: 'Front Desk Forms',
        documents: [
          {
            id: '747',
            title: 'CCL Package',
            version: '1.0',
            date: '06/25/2020',
            description: 'Compliance checklist for customer onboarding.',
            url: '#'
          },
          {
            id: '940',
            title: 'Visit Records',
            version: '1.0',
            date: '10/20/2019',
            description: 'Template for documenting lab visit outcomes.',
            url: '#'
          }
        ]
      },
      {
        id: 'compliance',
        name: 'Compliance',
        documents: [
          {
            id: 'CMP-301',
            title: 'OSHA Readiness Binder',
            version: '3.1',
            date: '02/18/2024',
            description: 'Emergency response, sanitation and exposure protocols.',
            url: '#'
          }
        ]
      }
    ]
  },
  {
    id: 'complete-dental-supplies',
    name: 'Complete Dental Supplies',
    groups: [
      {
        id: 'operations',
        name: 'Operations',
        documents: [
          {
            id: 'OPS-410',
            title: 'Vendor Ordering Guide',
            version: '4.6',
            date: '03/02/2024',
            description: 'Quarterly catalog with pricing tiers and freight notes.',
            url: '#'
          },
          {
            id: 'OPS-414',
            title: 'Inventory Count Template',
            version: '2.0',
            date: '08/15/2023',
            description: 'Excel template for cycle counts and variance tracking.',
            url: '#'
          }
        ]
      },
      {
        id: 'hr-forms',
        name: 'Human Resources Forms',
        documents: [
          {
            id: 'HR-512',
            title: 'Safety Training Sign-Off',
            version: '1.8',
            date: '04/04/2024',
            description: 'Required acknowledgement for annual safety seminar.',
            url: '#'
          }
        ]
      }
    ]
  }
];

const cloneDocumentCatalog = (catalog: DocumentEntity[]): DocumentEntity[] =>
  catalog.map((entity) => ({
    ...entity,
    groups: entity.groups.map((group) => ({
      ...group,
      documents: group.documents.map((document) => ({ ...document }))
    }))
  }));

export default function DocumentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();

  const [userName, setUserName] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentEntity[]>(() => cloneDocumentCatalog(initialDocumentCatalog));
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [appliedSelection, setAppliedSelection] = useState<{
    entityId: string;
    groupId: string;
  } | null>(null);
  const [editingTarget, setEditingTarget] = useState<{
    entityId: string;
    groupId: string;
    documentId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    version: string;
    date: string;
    description: string;
    fileName: string;
    fileUrl: string;
    fileChanged: boolean;
  }>({
    title: '',
    version: '',
    date: '',
    description: '',
    fileName: '',
    fileUrl: '',
    fileChanged: false
  });
  const objectUrlsRef = useRef<string[]>([]);
  const resetEditForm = () =>
    setEditForm({
      title: '',
      version: '',
      date: '',
      description: '',
      fileName: '',
      fileUrl: '',
      fileChanged: false
    });

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    setUserName('Dr. Carter');
  }, [router]);

  useEffect(() => {
    setSelectedGroupId('');
  }, [selectedEntityId]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const availableGroups = useMemo(() => {
    const entity = documents.find((item) => item.id === selectedEntityId);
    return entity?.groups ?? [];
  }, [documents, selectedEntityId]);

  const appliedDocuments = useMemo(() => {
    if (!appliedSelection) return [];

    const entity = documents.find((item) => item.id === appliedSelection.entityId);
    const group = entity?.groups.find((item) => item.id === appliedSelection.groupId);

    return group?.documents ?? [];
  }, [appliedSelection, documents]);

  const appliedEntityName = appliedSelection
    ? documents.find((entity) => entity.id === appliedSelection.entityId)?.name ?? '—'
    : '—';
  const appliedGroupName = appliedSelection
    ? documents
        .find((entity) => entity.id === appliedSelection.entityId)
        ?.groups.find((group) => group.id === appliedSelection.groupId)?.name ?? '—'
    : '—';
  const appliedSummary = appliedSelection
    ? t('Showing {count} {items} for {entity} · {group}', {
        count: appliedDocuments.length.toString(),
        items: t(appliedDocuments.length === 1 ? 'item' : 'items'),
        entity: appliedEntityName,
        group: appliedGroupName
      })
    : t('Apply a filter to load documents for download.');

  const handleApply = () => {
    if (!selectedEntityId || !selectedGroupId) return;

    setAppliedSelection({
      entityId: selectedEntityId,
      groupId: selectedGroupId
    });
  };

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

            <nav className="mt-10 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition ${pathname === item.href ? 'bg-primary-500/15 text-primary-100 ring-1 ring-primary-400/30' : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'}`}
                >
                  <span>{t(item.label)}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-auto space-y-1 text-sm text-slate-400">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{t('Signed in as')}</p>
            <p className="font-medium text-slate-200">{userName || t('Loading...')}</p>
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem('ontime.authToken');
                router.push('/login');
              }}
              className="text-left text-xs font-medium text-slate-500 transition hover:text-primary-200"
            >
              {t('Log out')}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-6 py-12 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-5xl">
            <header className="flex flex-col gap-3 border-b border-white/5 pb-8">
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-semibold tracking-tight text-white">{t('Documents')}</h1>
                <span className="hidden text-sm text-slate-400 sm:inline-flex">
                  {t('Select an entity and group to view downloadable resources.')}
                </span>
              </div>
              <p className="text-sm text-slate-400 sm:hidden">
                {t('Select an entity and group to view downloadable resources.')}
              </p>
            </header>

            <section className="mt-10 rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-white">{t('Filter library')}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {t('Choose the business entity followed by the document group. Apply the selection to refresh the available files.')}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Select Entity')}</span>
                  <select
                    value={selectedEntityId}
                    onChange={(event) => setSelectedEntityId(event.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                  >
                    <option value="">{t('Select entity...')}</option>
                    {documents.map((entity) => (
                      <option key={entity.id} value={entity.id}>
                        {entity.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Select Group')}</span>
                  <select
                    value={selectedGroupId}
                    onChange={(event) => setSelectedGroupId(event.target.value)}
                    disabled={!selectedEntityId}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <option value="">{selectedEntityId ? t('Select group...') : t('Select entity first')}</option>
                    {availableGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={!selectedEntityId || !selectedGroupId}
                    className="w-full rounded-xl bg-primary-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-primary-500/40 disabled:text-slate-400"
                  >
                    {t('Apply')}
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-10 rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur">
              <div className="flex items-center justify-between gap-4 border-b border-white/5 px-6 py-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">{t('Available documents')}</h2>
                  <p className="text-sm text-slate-400">{appliedSummary}</p>
                </div>
              </div>

              <div className="overflow-hidden">
                <div className="min-w-full overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/5 text-left text-sm text-slate-300">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('ID')}</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Title')}</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Version')}</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Date')}</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Description')}</th>
                        <th className="px-6 py-3 font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Download')}</th>
                        <th className="px-6 py-3 text-right font-semibold uppercase tracking-wide text-xs text-slate-400">{t('Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {appliedDocuments.length > 0 ? (
                        appliedDocuments.map((document) => (
                          <tr key={document.id} className="transition hover:bg-white/5">
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-400">{document.id}</td>
                            <td className="max-w-xs px-6 py-4 text-sm text-white">{t(document.title)}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">{document.version}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">{document.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-300">{t(document.description)}</td>
                            <td className="px-6 py-4">
                              <a
                                href={document.url}
                                className="inline-flex items-center rounded-lg border border-primary-500/40 bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/60 hover:bg-primary-500/20"
                              >
                                {document.fileName ? document.fileName : t('Download')}
                              </a>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!appliedSelection) return;

                                  setEditingTarget({
                                    entityId: appliedSelection.entityId,
                                    groupId: appliedSelection.groupId,
                                    documentId: document.id
                                  });
                                  setEditForm({
                                    title: document.title,
                                    version: document.version,
                                    date: document.date,
                                    description: document.description,
                                    fileName: document.fileName ?? '',
                                    fileUrl: document.url,
                                    fileChanged: false
                                  });
                                }}
                                className="inline-flex items-center rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                              >
                                {t('Edit')}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-16 text-center text-sm text-slate-500">
                            {appliedSelection
                              ? t('No documents were found for the selected group.')
                              : t('No records to display. Apply a filter to load documents.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {editingTarget && (
              <section className="mt-10 rounded-3xl border border-primary-500/30 bg-primary-500/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{t('Edit document')}</h2>
                    <p className="text-sm text-slate-300">
                      {t('Update the document details or upload a new file to replace the existing download link.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (editForm.fileChanged && editForm.fileUrl) {
                        URL.revokeObjectURL(editForm.fileUrl);
                      }
                      setEditingTarget(null);
                      resetEditForm();
                    }}
                    className="rounded-lg border border-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    {t('Cancel')}
                  </button>
                </div>

                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!editingTarget) return;

                    setDocuments((prev) =>
                      prev.map((entity) => {
                        if (entity.id !== editingTarget.entityId) return entity;

                        return {
                          ...entity,
                          groups: entity.groups.map((group) => {
                            if (group.id !== editingTarget.groupId) return group;

                            return {
                              ...group,
                              documents: group.documents.map((doc) => {
                                if (doc.id !== editingTarget.documentId) return doc;

                                if (editForm.fileChanged && doc.url.startsWith('blob:')) {
                                  URL.revokeObjectURL(doc.url);
                                }

                                return {
                                  ...doc,
                                  title: editForm.title,
                                  version: editForm.version,
                                  date: editForm.date,
                                  description: editForm.description,
                                  url: editForm.fileChanged ? editForm.fileUrl : doc.url,
                                  fileName: editForm.fileChanged ? editForm.fileName : doc.fileName
                                };
                              })
                            };
                          })
                        };
                      })
                    );

                    setEditingTarget(null);
                    resetEditForm();
                  }}
                >
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Title')}</span>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Version')}</span>
                    <input
                      type="text"
                      required
                      value={editForm.version}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, version: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Date')}</span>
                    <input
                      type="text"
                      required
                      value={editForm.date}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, date: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300 sm:col-span-2">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Description')}</span>
                    <textarea
                      required
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="min-h-[6rem] w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300 sm:col-span-2">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Upload new file')}</span>
                    <input
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const newUrl = URL.createObjectURL(file);
                        objectUrlsRef.current.push(newUrl);

                        setEditForm((prev) => ({
                          ...prev,
                          fileName: file.name,
                          fileUrl: newUrl,
                          fileChanged: true
                        }));
                      }}
                      className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-slate-900/60 px-3 py-3 text-sm text-slate-300 shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 file:transition file:hover:bg-primary-400"
                    />
                    {editForm.fileName && (
                      <p className="text-xs text-primary-100">{t('Selected file')}: {editForm.fileName}</p>
                    )}
                  </label>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-xl bg-primary-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                    >
                      {t('Save changes')}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
