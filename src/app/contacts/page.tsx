'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_DIRECTORY_DATA } from '@/graphql/queries';
import { UPDATE_DIRECTORY_ENTRY, DELETE_DIRECTORY_ENTRY } from '@/graphql/mutations';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { getUserSession, hasPermission, hasModuleAccess } from '@/lib/permissions';
import { useTranslations } from '@/lib/i18n';

type GroupKey = 'corporate' | 'frontdesk' | 'offices';

type DirectoryEntry = {
  id: string;
  location: string;
  phone: string;
  extension: string;
  department: string;
  employee: string;
  order?: number;
};

type DirectoryEntityWithEntries = {
  id: string;
  entityId: string;
  name: string;
  corporate: DirectoryEntry[];
  frontdesk: DirectoryEntry[];
  offices: DirectoryEntry[];
};

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

export default function ContactsPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [userName, setUserName] = useState<string>('');
  const [canModify, setCanModify] = useState<boolean>(true); // Permission to modify contacts
  const [selectedEntityId, setSelectedEntityId] = useState<string>('complete-dental-solutions');
  const [activeSection, setActiveSection] = useState<ContactSectionId>('extensions');
  const [formEntityId, setFormEntityId] = useState<string>('');
  const [formGroupId, setFormGroupId] = useState<GroupKey>('corporate');
  const [activeSelection, setActiveSelection] = useState<{ entityId: string; group: GroupKey }>(() => ({
    entityId: '',
    group: 'corporate'
  }));
  
  // Edit modal state
  const [editingEntry, setEditingEntry] = useState<DirectoryEntry | null>(null);
  const [editForm, setEditForm] = useState({
    location: '',
    phone: '',
    extension: '',
    department: '',
    employee: ''
  });

  // Fetch directory data from GraphQL
  const { data, loading, error, refetch } = useQuery(GET_ALL_DIRECTORY_DATA);

  // Mutations
  const [updateEntry, { loading: updating }] = useMutation(UPDATE_DIRECTORY_ENTRY, {
    onCompleted: () => {
      refetch();
      setEditingEntry(null);
    },
    onError: (err) => {
      console.error('Error updating entry:', err);
      alert('Failed to update entry. Please try again.');
    }
  });

  const [deleteEntry, { loading: deleting }] = useMutation(DELETE_DIRECTORY_ENTRY, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry. Please try again.');
    }
  });

  const directory = useMemo<DirectoryEntityWithEntries[]>(
    () => data?.allDirectoryData || [],
    [data]
  );

  // Handler functions
  const handleEditClick = (entry: DirectoryEntry) => {
    setEditingEntry(entry);
    setEditForm({
      location: entry.location,
      phone: entry.phone,
      extension: entry.extension,
      department: entry.department,
      employee: entry.employee
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    await updateEntry({
      variables: {
        id: editingEntry.id,
        input: {
          entityId: activeSelection.entityId,
          group: activeSelection.group,
          ...editForm,
          order: editingEntry.order || 0
        }
      }
    });
  };

  const handleDeleteClick = async (entry: DirectoryEntry) => {
    if (confirm(`Are you sure you want to delete ${entry.employee}?`)) {
      await deleteEntry({
        variables: { id: entry.id }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditForm({
      location: '',
      phone: '',
      extension: '',
      department: '',
      employee: ''
    });
  };

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');

    if (!token) {
      router.push('/login');
      return;
    }

    // Check module access and permissions
    const user = getUserSession();
    if (user) {
      if (!hasModuleAccess(user, 'contacts')) {
        router.push('/dashboard');
        return;
      }
      setCanModify(hasPermission(user, 'canModifyContacts'));
    }

    setUserName('Dr. Carter');
  }, [router]);

  // Initialize form and active selection when data loads
  useEffect(() => {
    if (directory.length > 0 && !formEntityId) {
      const firstEntity = directory[0];
      setFormEntityId(firstEntity.entityId);
      setActiveSelection({
        entityId: firstEntity.entityId,
        group: 'corporate'
      });
    }
  }, [directory, formEntityId]);

  useEffect(() => {
    const entity = directory.find((item) => item.entityId === formEntityId);
    if (!entity) return;

    const groupHasEntries = entity[formGroupId]?.length > 0;
    if (!groupHasEntries) {
      setFormGroupId('corporate');
    }
  }, [formEntityId, formGroupId, directory]);

  const selectedEntity = useMemo(
    () => directory.find((item) => item.entityId === activeSelection.entityId) ?? directory[0],
    [activeSelection.entityId, directory]
  );

  const selectedEntries = selectedEntity?.[activeSelection.group] ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveSelection({ entityId: formEntityId, group: formGroupId });
  };

  const isExtensionsSection = activeSection === 'extensions';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-400">Loading contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="text-red-400">Error loading contacts: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="border-b border-slate-800 bg-slate-900/60">
          <PageHeader
            category={t('Contacts hub')}
            title={t('Reach every team instantly')}
            // subtitle="Browse location extensions, clinic reception desks, and support center directories."
            showEntitySelector={true}
            entityLabel={t('Entity')}
            selectedEntityId={selectedEntityId}
            onEntityChange={setSelectedEntityId}
          />

          <TopNavigation />
        </div>

        <main className="mx-auto max-w-7xl px-6 py-10">
          <nav className="mb-8 flex flex-wrap gap-3">
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
                        <label htmlFor="entity-select" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Select an entity</label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <select
                            id="entity-select"
                            value={formEntityId}
                            onChange={(event) => setFormEntityId(event.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-200 outline-none transition focus:border-primary-400/60 focus:text-white"
                          >
                            {directory.map((entity) => (
                              <option key={entity.entityId} value={entity.entityId}>
                                {entity.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="group-select" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">Select a group</label>
                        <div className="mt-2 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
                          <select
                            id="group-select"
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
                          <th className="px-4 py-3 font-medium">Location</th>
                          <th className="px-4 py-3 font-medium">Phone number</th>
                          <th className="px-4 py-3 font-medium">Ext</th>
                          <th className="px-4 py-3 font-medium">Department</th>
                          <th className="px-4 py-3 font-medium">Employee</th>
                          <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedEntries.length ? (
                          selectedEntries.map((entry) => (
                            <tr key={entry.id} className="transition hover:bg-primary-500/10">
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.location}</td>
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.phone}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-primary-100">{entry.extension}</td>
                              <td className="px-4 py-3 text-sm text-slate-200">{entry.department}</td>
                              <td className="px-4 py-3 text-sm text-slate-100">{entry.employee}</td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleEditClick(entry)}
                                    className="rounded-lg border border-primary-400/30 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-100 transition hover:bg-primary-500/20"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(entry)}
                                    disabled={deleting}
                                    className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
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

          <TopNavigation />
        </div>

      {/* Edit Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-50">Edit Contact Entry</h2>
              <p className="mt-2 text-sm text-slate-400">Update the contact information below</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="edit-location" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                  Location
                </label>
                <input
                  id="edit-location"
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-phone" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                    Phone
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>

                <div>
                  <label htmlFor="edit-extension" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                    Extension
                  </label>
                  <input
                    id="edit-extension"
                    type="text"
                    value={editForm.extension}
                    onChange={(e) => setEditForm({ ...editForm, extension: e.target.value })}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-department" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                  Department
                </label>
                <input
                  id="edit-department"
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                />
              </div>

              <div>
                <label htmlFor="edit-employee" className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-200/80">
                  Employee Name
                </label>
                <input
                  id="edit-employee"
                  type="text"
                  value={editForm.employee}
                  onChange={(e) => setEditForm({ ...editForm, employee: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSaveEdit}
                disabled={updating}
                className="flex-1 rounded-2xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-primary-900/40 transition hover:bg-primary-400 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={updating}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-primary-400/30 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
