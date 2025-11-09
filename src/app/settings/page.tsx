'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, gql } from '@apollo/client';
import TopNavigation from '@/components/TopNavigation';
import PageHeader from '@/components/PageHeader';
import UsersTab from '@/components/UsersTab';
import ClinicsTab from '@/components/ClinicsTab';
import LaboratoriesTab from '@/components/LaboratoriesTab';
import CompanySettingsModal from '@/components/CompanySettingsModal';
import { useTranslations } from '@/lib/i18n';

// GraphQL Queries and Mutations
const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      shortName
      location
      address
      phone
      email
      taxId
      isActive
      createdAt
    }
  }
`;

const CREATE_COMPANY = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      id
      name
      shortName
      location
      address
      phone
      email
      taxId
      isActive
    }
  }
`;

const UPDATE_COMPANY = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      id
      name
      shortName
      location
      address
      phone
      email
      taxId
      isActive
    }
  }
`;

type Company = {
  id: string;
  name: string;
  shortName: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  isActive: boolean;
  createdAt?: string;
};

type CompanyFormData = {
  name: string;
  shortName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
};

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'clinics' | 'laboratories' | 'system'>('companies');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsCompany, setSettingsCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    shortName: '',
    location: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
  });

  // GraphQL hooks
  const { data, loading, refetch } = useQuery(GET_COMPANIES);
  const [createCompany, { loading: creating }] = useMutation(CREATE_COMPANY);
  const [updateCompany, { loading: updating }] = useMutation(UPDATE_COMPANY);

  const companies: Company[] = data?.companies || [];

  const handleOpenCreate = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      shortName: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      taxId: '',
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      shortName: company.shortName,
      location: company.location,
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || '',
      taxId: company.taxId || '',
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      shortName: '',
      location: '',
      address: '',
      phone: '',
      email: '',
      taxId: '',
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingCompany) {
        // Update existing company
        await updateCompany({
          variables: {
            id: editingCompany.id,
            input: formData,
          },
        });
      } else {
        // Create new company
        await createCompany({
          variables: {
            input: formData,
          },
        });
      }

      await refetch();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save company. Please try again.');
    }
  };

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenSettings = (company: Company) => {
    setSettingsCompany(company);
    setShowSettingsModal(true);
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setSettingsCompany(null);
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <PageHeader
          category={t('Administration')}
          title={t('Settings')}
          subtitle={t('Manage system configuration, companies, and user settings.')}
        />
        <TopNavigation />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Settings Tabs */}
        <div className="mb-8 flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'companies'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Companies')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'users'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Users')}
          </button>
          <button
            onClick={() => setActiveTab('clinics')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'clinics'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Clinics')}
          </button>
          <button
            onClick={() => setActiveTab('laboratories')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'laboratories'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('Laboratories')}
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'system'
                ? 'border-b-2 border-primary-500 text-primary-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t('System')}
          </button>
        </div>

        {/* Companies Tab */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{t('Company Management')}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {t('Create and manage company entities across your organization.')}
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('Add Company')}
              </button>
            </div>

            {/* Companies List */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-400">
                  {t('Loading companies...')}
                </div>
              ) : companies.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-4 text-slate-400">{t('No companies found')}</p>
                  <p className="mt-1 text-sm text-slate-500">{t('Create your first company to get started.')}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Company Name')}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Short Name')}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Location')}
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {t('Contact')}
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
                    {companies.map((company) => (
                      <tr key={company.id} className="transition hover:bg-slate-800/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500/10 text-primary-400">
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-semibold text-white">{company.name}</p>
                              {company.taxId && (
                                <p className="text-xs text-slate-500">Tax ID: {company.taxId}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
                            {company.shortName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">{company.location}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-300">
                            {company.email && <p>{company.email}</p>}
                            {company.phone && <p className="text-slate-500">{company.phone}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              company.isActive
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {company.isActive ? t('Active') : t('Inactive')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(company)}
                              className="text-primary-400 transition hover:text-primary-300"
                              title={t('Edit Company')}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenSettings(company)}
                              className="text-slate-400 transition hover:text-slate-300"
                              title={t('Company Settings')}
                            >
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Users Tab - Placeholder */}
        {/* Users Tab */}
        {activeTab === 'users' && <UsersTab />}

        {/* Clinics Tab */}
        {activeTab === 'clinics' && <ClinicsTab />}

        {/* Laboratories Tab */}
        {activeTab === 'laboratories' && <LaboratoriesTab />}

        {/* System Tab - Placeholder */}
        {activeTab === 'system' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="mt-4 text-slate-400">{t('System settings coming soon')}</p>
          </div>
        )}
      </div>

      {/* Create/Edit Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingCompany ? t('Edit Company') : t('Create New Company')}
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

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Company Name */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Company Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Complete Dental Solutions"
                  />
                </div>

                {/* Short Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Short Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => handleInputChange('shortName', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., CDS Florida"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Location')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Jacksonville, FL"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., 123 Main Street, Suite 100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., (904) 555-0100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., info@company.com"
                  />
                </div>

                {/* Tax ID */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Tax ID / EIN')}
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleInputChange('taxId', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., 12-3456789"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {creating || updating
                    ? t('Saving...')
                    : editingCompany
                    ? t('Update Company')
                    : t('Create Company')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Company Settings Modal */}
      {showSettingsModal && settingsCompany && (
        <CompanySettingsModal
          company={settingsCompany}
          onClose={handleCloseSettings}
        />
      )}
    </main>
  );
}
