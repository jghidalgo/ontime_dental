'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import { useQuery, useMutation, gql } from '@apollo/client';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';

// GraphQL Queries and Mutations
const GET_DOCUMENT_ENTITIES = gql`
  query GetDocumentEntities {
    documentEntities {
      id
      entityId
      name
      groups {
        id
        name
        documents {
          id
          title
          version
          date
          description
          url
          fileName
        }
      }
    }
  }
`;

const ADD_DOCUMENT = gql`
  mutation AddDocument($entityId: String!, $groupId: String!, $document: DocumentRecordInput!) {
    addDocument(entityId: $entityId, groupId: $groupId, document: $document) {
      id
      entityId
      name
      groups {
        id
        name
        documents {
          id
          title
          version
          date
          description
          url
          fileName
        }
      }
    }
  }
`;

const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument(
    $entityId: String!
    $groupId: String!
    $documentId: String!
    $document: DocumentRecordInput!
  ) {
    updateDocument(
      entityId: $entityId
      groupId: $groupId
      documentId: $documentId
      document: $document
    ) {
      id
      entityId
      name
      groups {
        id
        name
        documents {
          id
          title
          version
          date
          description
          url
          fileName
        }
      }
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($entityId: String!, $groupId: String!, $documentId: String!) {
    deleteDocument(entityId: $entityId, groupId: $groupId, documentId: $documentId) {
      id
      entityId
      groups {
        id
        documents {
          id
          title
        }
      }
    }
  }
`;

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

export default function DocumentsPage() {
  const router = useRouter();
  const { t } = useTranslations();

  // GraphQL hooks
  const { data, loading, error, refetch } = useQuery(GET_DOCUMENT_ENTITIES);
  const [addDocument] = useMutation(ADD_DOCUMENT, {
    refetchQueries: ['GetDocumentEntities']
  });
  const [updateDocument] = useMutation(UPDATE_DOCUMENT, {
    refetchQueries: ['GetDocumentEntities']
  });
  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    refetchQueries: ['GetDocumentEntities']
  });

  const [globalEntityId, setGlobalEntityId] = useState<string>('complete-dental-solutions');
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<{
    title: string;
    version: string;
    date: string;
    description: string;
    fileName: string;
    fileUrl: string;
  }>({
    title: '',
    version: '',
    date: '',
    description: '',
    fileName: '',
    fileUrl: ''
  });
  const [editForm, setEditForm] = useState<{
    title: string;
    version: string;
    date: string;
    description: string;
    fileName: string;
    fileUrl: string;
  }>({
    title: '',
    version: '',
    date: '',
    description: '',
    fileName: '',
    fileUrl: ''
  });
  const [snackbar, setSnackbar] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  const objectUrlsRef = useRef<string[]>([]);
  
  const resetEditForm = () =>
    setEditForm({
      title: '',
      version: '',
      date: '',
      description: '',
      fileName: '',
      fileUrl: ''
    });

  const resetCreateForm = () =>
    setCreateForm({
      title: '',
      version: '',
      date: '',
      description: '',
      fileName: '',
      fileUrl: ''
    });

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Get documents from GraphQL data
  const documents = useMemo(() => {
    if (!data?.documentEntities) return [];
    return data.documentEntities.map((entity: any) => ({
      id: entity.entityId,
      name: entity.name,
      groups: entity.groups
    }));
  }, [data]);

  useEffect(() => {
    const token = globalThis.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    setSelectedGroupId('');
  }, [selectedEntityId]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      for (const url of objectUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  // Handler for creating a new document
  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appliedSelection) return;

    try {
      const docId = `DOC-${Date.now()}`;
      await addDocument({
        variables: {
          entityId: appliedSelection.entityId,
          groupId: appliedSelection.groupId,
          document: {
            id: docId,
            title: createForm.title,
            version: createForm.version,
            date: createForm.date,
            description: createForm.description,
            url: createForm.fileUrl || '#',
            fileName: createForm.fileName || undefined
          }
        }
      });

      showSnackbar('Document created successfully!', 'success');
      resetCreateForm();
      setShowCreateForm(false);
    } catch (error: any) {
      showSnackbar(`Failed to create document: ${error.message}`, 'error');
    }
  };

  // Handler for updating an existing document
  const handleUpdateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    try {
      await updateDocument({
        variables: {
          entityId: editingTarget.entityId,
          groupId: editingTarget.groupId,
          documentId: editingTarget.documentId,
          document: {
            id: editingTarget.documentId,
            title: editForm.title,
            version: editForm.version,
            date: editForm.date,
            description: editForm.description,
            url: editForm.fileUrl,
            fileName: editForm.fileName || undefined
          }
        }
      });

      showSnackbar('Document updated successfully!', 'success');
      setEditingTarget(null);
      resetEditForm();
    } catch (error: any) {
      showSnackbar(`Failed to update document: ${error.message}`, 'error');
    }
  };

  // Handler for deleting a document
  const handleDeleteDocument = async (documentId: string) => {
    if (!appliedSelection) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await deleteDocument({
        variables: {
          entityId: appliedSelection.entityId,
          groupId: appliedSelection.groupId,
          documentId
        }
      });

      showSnackbar('Document deleted successfully!', 'success');
    } catch (error: any) {
      showSnackbar(`Failed to delete document: ${error.message}`, 'error');
    }
  };

  // Handler for downloading a document
  const handleDownloadDocument = (doc: DocumentRecord) => {
    if (doc.url === '#' || !doc.url) {
      showSnackbar('No download URL available for this document', 'error');
      return;
    }

    // If it's a blob URL, trigger download
    if (doc.url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.fileName || `${doc.title}.pdf`;
      link.click();
    } else {
      // Open external URL in new tab
      window.open(doc.url, '_blank');
    }
  };

  const availableGroups = useMemo(() => {
    const entity = documents.find((item: DocumentEntity) => item.id === selectedEntityId);
    return entity?.groups ?? [];
  }, [documents, selectedEntityId]);

  const appliedDocuments = useMemo(() => {
    if (!appliedSelection) return [];

    const entity = documents.find((item: DocumentEntity) => item.id === appliedSelection.entityId);
    const group = entity?.groups.find((item: DocumentGroup) => item.id === appliedSelection.groupId);

    return group?.documents ?? [];
  }, [appliedSelection, documents]);

  const appliedEntityName = appliedSelection
    ? documents.find((entity: DocumentEntity) => entity.id === appliedSelection.entityId)?.name ?? '—'
    : '—';
  const appliedGroupName = appliedSelection
    ? documents
        .find((entity: DocumentEntity) => entity.id === appliedSelection.entityId)
        ?.groups.find((group: DocumentGroup) => group.id === appliedSelection.groupId)?.name ?? '—'
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <PageHeader
          category={t('Document Library')}
          title={t('Documents')}
          subtitle={t('Access and manage forms, policies, and resources across all OnTime Dental entities.')}
          showEntitySelector={true}
          entityLabel="Entity"
          selectedEntityId={globalEntityId}
          onEntityChange={(id) => setGlobalEntityId(id)}
        />
        <TopNavigation />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur">
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
                    {documents.map((entity: DocumentEntity) => (
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
                    {availableGroups.map((group: DocumentGroup) => (
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
                {appliedSelection && (
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-xl bg-primary-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                  >
                    {t('Add Document')}
                  </button>
                )}
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
                        appliedDocuments.map((document: DocumentRecord) => (
                          <tr key={document.id} className="transition hover:bg-white/5">
                            <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-slate-400">{document.id}</td>
                            <td className="max-w-xs px-6 py-4 text-sm text-white">{t(document.title)}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">{document.version}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-400">{document.date}</td>
                            <td className="px-6 py-4 text-sm text-slate-300">{t(document.description)}</td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => handleDownloadDocument(document)}
                                className="inline-flex items-center rounded-lg border border-primary-500/40 bg-primary-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100 transition hover:border-primary-400/60 hover:bg-primary-500/20"
                              >
                                {document.fileName ? document.fileName : t('Download')}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
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
                                      fileUrl: document.url
                                    });
                                  }}
                                  className="inline-flex items-center rounded-lg border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200 transition hover:border-primary-400/40 hover:text-primary-100"
                                >
                                  {t('Edit')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(document.id)}
                                  className="inline-flex items-center rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-200 transition hover:border-red-400/60 hover:bg-red-500/20"
                                >
                                  {t('Delete')}
                                </button>
                              </div>
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
                  onSubmit={handleUpdateDocument}
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

            {showCreateForm && appliedSelection && (
              <section className="mt-10 rounded-3xl border border-green-500/30 bg-green-500/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{t('Add New Document')}</h2>
                    <p className="text-sm text-slate-300">
                      {t('Fill in the document details and optionally upload a file.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetCreateForm();
                    }}
                    className="rounded-lg border border-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-white/20 hover:text-white"
                  >
                    {t('Cancel')}
                  </button>
                </div>

                <form
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                  onSubmit={handleCreateDocument}
                >
                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Title')}</span>
                    <input
                      type="text"
                      required
                      value={createForm.title}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Version')}</span>
                    <input
                      type="text"
                      required
                      value={createForm.version}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, version: event.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Date')}</span>
                    <input
                      type="text"
                      required
                      value={createForm.date}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, date: event.target.value }))}
                      placeholder="MM/DD/YYYY"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300 sm:col-span-2">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Description')}</span>
                    <textarea
                      required
                      value={createForm.description}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="min-h-[6rem] w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40"
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-sm text-slate-300 sm:col-span-2">
                    <span className="font-medium uppercase tracking-wide text-xs text-slate-400">{t('Upload file (optional)')}</span>
                    <input
                      type="file"
                      accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const newUrl = URL.createObjectURL(file);
                        objectUrlsRef.current.push(newUrl);

                        setCreateForm((prev) => ({
                          ...prev,
                          fileName: file.name,
                          fileUrl: newUrl
                        }));
                      }}
                      className="w-full cursor-pointer rounded-xl border border-dashed border-white/20 bg-slate-900/60 px-3 py-3 text-sm text-slate-300 shadow-inner outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/40 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950 file:transition file:hover:bg-primary-400"
                    />
                    {createForm.fileName && (
                      <p className="text-xs text-primary-100">{t('Selected file')}: {createForm.fileName}</p>
                    )}
                  </label>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-xl bg-primary-500 px-6 py-2 text-sm font-semibold text-slate-950 transition hover:bg-primary-400"
                    >
                      {t('Create Document')}
                    </button>
                  </div>
                </form>
              </section>
            )}
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
    </main>
  );
}
