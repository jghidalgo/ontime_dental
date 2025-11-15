'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';
import LaboratorySettingsModal from './LaboratorySettingsModal';

// GraphQL Queries
const GET_LABORATORIES = gql`
  query GetLaboratories {
    laboratories {
      id
      name
      shortName
      contactPerson
      phone
      email
      address
      city
      state
      zip
      country
      website
      taxId
      specialties
      turnaroundTime {
        standard
        rush
      }
      procedures {
        name
        dailyCapacity
      }
      departments {
        id
        name
        description
        order
      }
      notes
      isActive
      createdAt
    }
  }
`;

const CREATE_LABORATORY = gql`
  mutation CreateLaboratory($input: CreateLaboratoryInput!) {
    createLaboratory(input: $input) {
      id
      name
      shortName
      contactPerson
      phone
      email
      address
      city
      state
      zip
      isActive
    }
  }
`;

const UPDATE_LABORATORY = gql`
  mutation UpdateLaboratory($id: ID!, $input: UpdateLaboratoryInput!) {
    updateLaboratory(id: $id, input: $input) {
      id
      name
      shortName
      contactPerson
      phone
      email
      address
      city
      state
      zip
      isActive
    }
  }
`;

const DELETE_LABORATORY = gql`
  mutation DeleteLaboratory($id: ID!) {
    deleteLaboratory(id: $id) {
      success
      message
    }
  }
`;

type Laboratory = {
  id: string;
  name: string;
  shortName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website?: string;
  taxId?: string;
  specialties: string[];
  turnaroundTime: {
    standard: number;
    rush: number;
  };
  procedures?: {
    name: string;
    dailyCapacity: number;
  }[];
  notes?: string;
  isActive: boolean;
  createdAt: string;
};

type LaboratoryFormData = {
  name: string;
  shortName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website: string;
  taxId: string;
  specialties: string;
  turnaroundTimeStandard: string;
  turnaroundTimeRush: string;
  notes: string;
  isActive: boolean;
};

const specialtyOptions = [
  'Crowns & Bridges',
  'Implant Restorations',
  'Dentures',
  'Aligners & Orthodontics',
  'Veneers',
  'Night Guards',
  'Partial Dentures',
  'Full Dentures',
  'Temporary Restorations',
  'CAD/CAM Services',
  'All-on-4/6',
  'Other'
];

export default function LaboratoriesTab() {
  const { t } = useTranslations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedLaboratory, setSelectedLaboratory] = useState<Laboratory | null>(null);
  const [editingLab, setEditingLab] = useState<Laboratory | null>(null);
  const [formData, setFormData] = useState<LaboratoryFormData>({
    name: '',
    shortName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
    website: '',
    taxId: '',
    specialties: '',
    turnaroundTimeStandard: '7',
    turnaroundTimeRush: '3',
    notes: '',
    isActive: true,
  });

  // GraphQL hooks
  const { data: labsData, loading, refetch } = useQuery(GET_LABORATORIES);
  const [createLaboratory, { loading: creating }] = useMutation(CREATE_LABORATORY);
  const [updateLaboratory, { loading: updating }] = useMutation(UPDATE_LABORATORY);
  const [deleteLaboratory] = useMutation(DELETE_LABORATORY);

  const laboratories: Laboratory[] = labsData?.laboratories || [];

  const handleOpenCreate = () => {
    setEditingLab(null);
    setFormData({
      name: '',
      shortName: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: 'USA',
      website: '',
      taxId: '',
      specialties: '',
      turnaroundTimeStandard: '7',
      turnaroundTimeRush: '3',
      notes: '',
      isActive: true,
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (lab: Laboratory) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      shortName: lab.shortName,
      contactPerson: lab.contactPerson,
      phone: lab.phone,
      email: lab.email,
      address: lab.address,
      city: lab.city,
      state: lab.state,
      zip: lab.zip,
      country: lab.country,
      website: lab.website || '',
      taxId: lab.taxId || '',
      specialties: lab.specialties.join(', '),
      turnaroundTimeStandard: lab.turnaroundTime.standard.toString(),
      turnaroundTimeRush: lab.turnaroundTime.rush.toString(),
      notes: lab.notes || '',
      isActive: lab.isActive,
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingLab(null);
  };

  const handleOpenSettings = (lab: Laboratory) => {
    setSelectedLaboratory(lab);
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setSelectedLaboratory(null);
  };

  const handleSettingsSuccess = () => {
    refetch();
    handleCloseSettings();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const specialtiesArray = formData.specialties
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const input = {
      name: formData.name,
      shortName: formData.shortName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
      website: formData.website || undefined,
      taxId: formData.taxId || undefined,
      specialties: specialtiesArray,
      turnaroundTime: {
        standard: Number.parseInt(formData.turnaroundTimeStandard) || 7,
        rush: Number.parseInt(formData.turnaroundTimeRush) || 3,
      },
      notes: formData.notes || undefined,
      isActive: formData.isActive,
    };

    try {
      if (editingLab) {
        await updateLaboratory({
          variables: {
            id: editingLab.id,
            input,
          },
        });
      } else {
        await createLaboratory({
          variables: { input },
        });
      }

      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving laboratory:', error);
      alert('Failed to save laboratory. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this laboratory?')) {
      return;
    }

    try {
      await deleteLaboratory({
        variables: { id },
      });
      await refetch();
    } catch (error) {
      console.error('Error deleting laboratory:', error);
      alert('Failed to delete laboratory. Please try again.');
    }
  };

  const handleInputChange = (field: keyof LaboratoryFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('Laboratory Management')}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t('Manage external laboratories for case production.')}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('Add Laboratory')}
        </button>
      </div>

      {/* Laboratories List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            {t('Loading laboratories...')}
          </div>
        ) : laboratories.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <p className="mt-4 text-slate-400">{t('No laboratories found')}</p>
            <p className="mt-1 text-sm text-slate-500">{t('Add your first laboratory to get started.')}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Laboratory Name')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Contact')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Location')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Turnaround')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Status')}
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('Actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {laboratories.map((lab) => {
                return (
                  <tr key={lab.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-white">{lab.name}</p>
                          <p className="text-sm text-slate-400">{lab.shortName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{lab.contactPerson}</p>
                      <p className="text-sm text-slate-400">{lab.phone}</p>
                      <p className="text-sm text-slate-400">{lab.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{lab.city}, {lab.state}</p>
                      <p className="text-sm text-slate-400">{lab.country}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{lab.turnaroundTime.standard} days</p>
                      <p className="text-xs text-slate-400">Rush: {lab.turnaroundTime.rush} days</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          lab.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-slate-500/10 text-slate-400'
                        }`}
                      >
                        {lab.isActive ? t('Active') : t('Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenSettings(lab)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-900/20 hover:text-primary-400"
                          title={t('Settings')}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(lab)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                          title={t('Edit')}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(lab.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-900/20 hover:text-red-400"
                          title={t('Delete')}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  {editingLab ? t('Edit Laboratory') : t('Add Laboratory')}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Laboratory Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Miami Dental Lab"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Short Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., MDL"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Contact Person')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Phone')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('Address')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('City')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('State')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('ZIP')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Country')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Website')}
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Tax ID')}
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('Specialties')}
                </label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Crowns & Bridges, Implants, Dentures (comma-separated)"
                />
                <p className="mt-1 text-xs text-slate-500">
                  {t('Common specialties')}: {specialtyOptions.slice(0, 5).join(', ')}
                </p>
              </div>

              {/* Turnaround Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Standard Turnaround (days)')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.turnaroundTimeStandard}
                    onChange={(e) => handleInputChange('turnaroundTimeStandard', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {t('Rush Turnaround (days)')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.turnaroundTimeRush}
                    onChange={(e) => handleInputChange('turnaroundTimeRush', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t('Notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="Additional notes about this laboratory..."
                />
              </div>

              {/* Status Checkboxes */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                  />
                  <span className="text-sm text-slate-300">{t('Active')}</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating || updating ? t('Saving...') : editingLab ? t('Update Laboratory') : t('Create Laboratory')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Laboratory Settings Modal */}
      {showSettingsModal && selectedLaboratory && (
        <LaboratorySettingsModal
          laboratory={selectedLaboratory}
          onClose={handleCloseSettings}
          onSuccess={handleSettingsSuccess}
        />
      )}
    </div>
  );
}
