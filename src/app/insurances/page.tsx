'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import { GET_INSURANCES } from '@/graphql/insurance-queries';
import { CREATE_INSURANCE, UPDATE_INSURANCE, DELETE_INSURANCE } from '@/graphql/insurance-mutations';

interface Insurance {
  id: string;
  insurerId: string;
  name: string;
  companyId: string;
  contactName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  policyPrefix?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  insurerId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  policyPrefix: string;
  notes: string;
  isActive: boolean;
}

export default function InsurancesPage() {
  const router = useRouter();
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    insurerId: '',
    name: '',
    contactName: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    policyPrefix: '',
    notes: '',
    isActive: true,
  });

  useEffect(() => {
    const token = window.localStorage.getItem('ontime.authToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const { data, loading, error, refetch } = useQuery(GET_INSURANCES, {
    variables: { 
      companyId: selectedEntityId || undefined,
      isActive: showInactive ? undefined : true
    },
    skip: !selectedEntityId,
  });

  const [createInsurance, { loading: creating }] = useMutation(CREATE_INSURANCE, {
    onCompleted: () => {
      refetch();
      closeModal();
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const [updateInsurance, { loading: updating }] = useMutation(UPDATE_INSURANCE, {
    onCompleted: () => {
      refetch();
      closeModal();
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const [deleteInsurance] = useMutation(DELETE_INSURANCE, {
    onCompleted: () => {
      refetch();
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const openCreateModal = () => {
    setEditingInsurance(null);
    setFormData({
      insurerId: '',
      name: '',
      contactName: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      policyPrefix: '',
      notes: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (insurance: Insurance) => {
    setEditingInsurance(insurance);
    setFormData({
      insurerId: insurance.insurerId,
      name: insurance.name,
      contactName: insurance.contactName || '',
      phone: insurance.phone || '',
      email: insurance.email || '',
      website: insurance.website || '',
      address: insurance.address || '',
      city: insurance.city || '',
      state: insurance.state || '',
      zip: insurance.zip || '',
      policyPrefix: insurance.policyPrefix || '',
      notes: insurance.notes || '',
      isActive: insurance.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInsurance(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEntityId) {
      alert('Please select a company');
      return;
    }

    const input = {
      insurerId: formData.insurerId,
      name: formData.name,
      companyId: selectedEntityId,
      contactName: formData.contactName || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      state: formData.state || undefined,
      zip: formData.zip || undefined,
      policyPrefix: formData.policyPrefix || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive,
    };

    if (editingInsurance) {
      await updateInsurance({ variables: { id: editingInsurance.id, input } });
    } else {
      await createInsurance({ variables: { input } });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInsurance({ variables: { id } });
  };

  const filteredInsurances = (data?.insurances || []).filter((insurance: Insurance) =>
    insurance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insurance.insurerId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary-500/10 via-slate-950 to-slate-950" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary-500/20 blur-3xl" />

      <div className="relative w-full">
        <div className="flex-1">
          <div className="border-b border-white/5 bg-white/[0.02] backdrop-blur-2xl">
            <PageHeader
              category="Insurance Management"
              title="Insurance Providers"
              subtitle="Manage insurance companies and payer information"
              showEntitySelector={true}
              entityLabel="Entity"
              selectedEntityId={selectedEntityId}
              onEntityChange={(id) => setSelectedEntityId(id)}
            />
            <TopNavigation />
          </div>

          <main className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-4">
                <input
                  type="text"
                  placeholder="Search insurances..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none backdrop-blur-xl transition focus:border-primary-400/60"
                />
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                  />
                  Show Inactive
                </label>
              </div>
              <button
                onClick={openCreateModal}
                className="rounded-xl border border-primary-400/30 bg-primary-500/20 px-6 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/30"
              >
                + Add Insurance
              </button>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl backdrop-blur-xl">
              {loading && <p className="text-center text-slate-400">Loading insurances...</p>}
              {error && <p className="text-center text-red-400">Error: {error.message}</p>}
              {!loading && !error && (
                <div className="overflow-hidden rounded-2xl border border-white/5">
                  <table className="min-w-full divide-y divide-white/5 text-left text-sm">
                    <thead className="bg-white/[0.03] text-xs uppercase tracking-wider text-white/50">
                      <tr>
                        <th className="px-4 py-3 font-medium">Insurance ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Contact</th>
                        <th className="px-4 py-3 font-medium">Phone</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInsurances.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                            No insurances found. Click "Add Insurance" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredInsurances.map((insurance: Insurance) => (
                          <tr key={insurance.id} className="transition hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-200">
                              {insurance.insurerId}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-100">{insurance.name}</td>
                            <td className="px-4 py-3 text-slate-300">{insurance.contactName || '—'}</td>
                            <td className="px-4 py-3 text-slate-300">{insurance.phone || '—'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={'inline-flex rounded-full px-3 py-1 text-xs font-medium ' + 
                                  (insurance.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-500/20 text-slate-400')}
                              >
                                {insurance.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditModal(insurance)}
                                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 transition hover:border-primary-400/30 hover:text-primary-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(insurance.id)}
                                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-slate-50">
              {editingInsurance ? 'Edit Insurance' : 'Create New Insurance'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Insurance ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.insurerId}
                    onChange={(e) => setFormData({ ...formData, insurerId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Policy Prefix
                </label>
                <input
                  type="text"
                  value={formData.policyPrefix}
                  onChange={(e) => setFormData({ ...formData, policyPrefix: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                  placeholder="e.g., XYZ-"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 outline-none transition focus:border-primary-400/60"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 rounded border-white/20 bg-white/10 text-primary-500 focus:ring-2 focus:ring-primary-500/50"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                  Active Insurance
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="rounded-xl border border-primary-400/30 bg-primary-500/20 px-6 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/30 disabled:opacity-50"
                >
                  {creating || updating ? 'Saving...' : editingInsurance ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-900 p-8 shadow-2xl">
            <h2 className="mb-4 text-2xl font-bold text-slate-50">Delete Insurance</h2>
            <p className="mb-6 text-sm text-slate-400">
              Are you sure you want to delete this insurance? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="rounded-xl border border-red-500/30 bg-red-500/20 px-6 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
