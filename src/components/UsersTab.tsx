'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/user-queries';
import { CREATE_USER, UPDATE_USER, DELETE_USER } from '@/graphql/user-mutations';
import { GET_COMPANIES } from '@/graphql/company-queries';
import { useTranslations } from '@/lib/i18n';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
  phone?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  createdAt?: string;
};

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
  companyId: string;
  phone: string;
  position: string;
  department: string;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'dentist', label: 'Dentist' },
  { value: 'hygienist', label: 'Hygienist' },
  { value: 'assistant', label: 'Dental Assistant' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'lab_tech', label: 'Lab Technician' },
];

export default function UsersTab() {
  const { t } = useTranslations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterCompany, setFilterCompany] = useState<string>('');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
    companyId: '',
    phone: '',
    position: '',
    department: '',
  });

  // GraphQL hooks
  const { data: usersData, loading: usersLoading, refetch } = useQuery(GET_USERS, {
    variables: filterCompany ? { companyId: filterCompany } : {},
  });
  const { data: companiesData } = useQuery(GET_COMPANIES);
  const [createUser, { loading: creating }] = useMutation(CREATE_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: filterCompany ? { companyId: filterCompany } : {} }
    ],
    awaitRefetchQueries: true,
  });
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: filterCompany ? { companyId: filterCompany } : {} }
    ],
    awaitRefetchQueries: true,
  });
  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [
      { query: GET_USERS, variables: filterCompany ? { companyId: filterCompany } : {} }
    ],
    awaitRefetchQueries: true,
  });

  const users = usersData?.users || [];
  const companies = companiesData?.companies || [];

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'receptionist',
      companyId: '',
      phone: '',
      position: '',
      department: '',
    });
    setShowCreateModal(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      companyId: user.companyId || '',
      phone: user.phone || '',
      position: user.position || '',
      department: user.department || '',
    });
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const input: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      // Only include optional fields if they have values
      if (formData.companyId) {
        input.companyId = formData.companyId;
      }
      if (formData.phone) {
        input.phone = formData.phone;
      }
      if (formData.position) {
        input.position = formData.position;
      }
      if (formData.department) {
        input.department = formData.department;
      }

      if (editingUser) {
        // Only include password if it was changed
        if (formData.password) {
          input.password = formData.password;
        }
        await updateUser({
          variables: { id: editingUser.id, input },
        });
        showSnackbar(t('User updated successfully!'), 'success');
      } else {
        // Password is required for new users
        if (!formData.password) {
          showSnackbar(t('Password is required for new users'), 'error');
          return;
        }
        input.password = formData.password;
        await createUser({
          variables: { input },
        });
        
        // Clear filter or set to new user's company to show the new user
        if (formData.companyId && filterCompany !== formData.companyId) {
          setFilterCompany(''); // Clear filter to show all users
        }
        
        showSnackbar(t('User created successfully!'), 'success');
      }

      handleCloseModal();
      refetch();
    } catch (error: any) {
      showSnackbar(error.message || t('An error occurred'), 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = globalThis.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`);
    if (confirmDelete) {
      try {
        await deleteUser({ variables: { id } });
        refetch();
        showSnackbar(t('User deleted successfully'), 'success');
      } catch (error: any) {
        showSnackbar(error.message || t('Failed to delete user'), 'error');
      }
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await updateUser({
        variables: {
          id: user.id,
          input: { isActive: !user.isActive },
        },
      });
      refetch();
      showSnackbar(
        t(user.isActive ? 'User deactivated successfully' : 'User activated successfully'),
        'success'
      );
    } catch (error: any) {
      showSnackbar(error.message || t('Failed to update user status'), 'error');
    }
  };

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return '-';
    const company = companies.find((c: any) => c.id === companyId);
    return company?.shortName || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('User Management')}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {t('Manage user accounts and assign them to companies.')}
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('Add User')}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="w-64">
          <label htmlFor="company-filter" className="mb-2 block text-sm font-semibold text-slate-200">
            {t('Filter by Company')}
          </label>
          <select
            id="company-filter"
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">{t('All Companies')}</option>
            {companies.map((company: any) => (
              <option key={company.id} value={company.id}>
                {company.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {usersLoading ? (
          <div className="p-12 text-center text-slate-400">{t('Loading users...')}</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
              <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">{t('No Users Yet')}</h3>
            <p className="mb-6 text-slate-400">
              {t('Get started by creating your first user account.')}
            </p>
            <button
              onClick={handleOpenCreate}
              className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              {t('Add First User')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Name')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Email')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Role')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Company')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Position')}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Status')}
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user: User) => (
                  <tr key={user.id} className="transition hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                      {user.phone && <div className="text-sm text-slate-400">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400">
                        {ROLES.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{getCompanyName(user.companyId)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{user.position || '-'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                        {user.isActive ? t('Active') : t('Inactive')}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-primary-400"
                          title={t('Edit')}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                          title={t('Delete')}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {editingUser ? t('Edit User') : t('Create New User')}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Full Name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Email')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., john.smith@company.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Password')} {!editingUser && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder={editingUser ? t('Leave blank to keep current') : t('Enter password')}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Role')} <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Company')}
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => handleInputChange('companyId', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">{t('No Company')}</option>
                    {companies.map((company: any) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Position')}
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Senior Dentist"
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

                {/* Department */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Department')}
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="e.g., Clinical"
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
                  {(() => {
                    if (creating || updating) return t('Saving...');
                    if (editingUser) return t('Update User');
                    return t('Create User');
                  })()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
