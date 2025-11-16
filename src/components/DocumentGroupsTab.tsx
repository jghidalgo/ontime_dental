'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_DOCUMENT_GROUPS } from '@/graphql/document-group-queries';
import {
  CREATE_DOCUMENT_GROUP,
  UPDATE_DOCUMENT_GROUP,
  DELETE_DOCUMENT_GROUP,
  REORDER_DOCUMENT_GROUPS
} from '@/graphql/document-group-mutations';
import { useTranslations } from '@/lib/i18n';

interface DocumentGroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function DocumentGroupsTab() {
  const t = useTranslations();
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<DocumentGroup | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    type: 'success'
  });

  const { data, loading, refetch } = useQuery(GET_DOCUMENT_GROUPS);
  const [createGroup] = useMutation(CREATE_DOCUMENT_GROUP);
  const [updateGroup] = useMutation(UPDATE_DOCUMENT_GROUP);
  const [deleteGroup] = useMutation(DELETE_DOCUMENT_GROUP);
  const [reorderGroups] = useMutation(REORDER_DOCUMENT_GROUPS);

  const groups: DocumentGroup[] = data?.documentGroups || [];

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar({ open: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleOpenModal = (group?: DocumentGroup) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
        isActive: group.isActive
      });
    } else {
      setEditingGroup(null);
      setFormData({
        name: '',
        description: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Submitting document group:', formData);
      
      if (editingGroup) {
        console.log('Updating group:', editingGroup.id);
        const result = await updateGroup({
          variables: {
            id: editingGroup.id,
            input: formData
          }
        });
        console.log('Update result:', result);
        showSnackbar('Document group updated successfully!', 'success');
      } else {
        console.log('Creating new group');
        const result = await createGroup({
          variables: {
            input: formData
          }
        });
        console.log('Create result:', result);
        showSnackbar('Document group created successfully!', 'success');
      }
      
      console.log('Refetching groups...');
      await refetch();
      console.log('Closing modal');
      handleCloseModal();
    } catch (error) {
      console.error('Error saving document group:', error);
      showSnackbar(`Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup({
        variables: { id }
      });
      
      showSnackbar('Document group deleted successfully!', 'success');
      refetch();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting document group:', error);
      showSnackbar('Failed to delete document group', 'error');
    }
  };

  const handleToggleActive = async (group: DocumentGroup) => {
    try {
      await updateGroup({
        variables: {
          id: group.id,
          input: {
            name: group.name,
            description: group.description,
            isActive: !group.isActive,
            order: group.order
          }
        }
      });
      
      showSnackbar(`Group ${!group.isActive ? 'activated' : 'deactivated'} successfully!`, 'success');
      refetch();
    } catch (error) {
      console.error('Error toggling group status:', error);
      showSnackbar('Failed to update group status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-primary-500"></div>
          <p className="text-slate-400">Loading document groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Document Groups</h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage document categories shared across all companies
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Group
        </button>
      </div>

      {/* Groups Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-2xl backdrop-blur-xl">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Order
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No document groups found. Create your first group to get started.
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id} className="transition hover:bg-slate-800/30">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {group.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">{group.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-300">{group.description || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(group)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        group.isActive
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {group.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(group)}
                      className="text-primary-400 hover:text-primary-300 mr-4 transition"
                    >
                      Edit
                    </button>
                    {deleteConfirm === group.id ? (
                      <div className="inline-flex gap-2">
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-slate-400 hover:text-slate-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(group.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingGroup ? 'Edit Document Group' : 'Create Document Group'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-slate-200 mb-1">
                  Name *
                </label>
                <input
                  id="group-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="e.g., Legal Documents"
                />
              </div>

              <div>
                <label htmlFor="group-description" className="block text-sm font-medium text-slate-200 mb-1">
                  Description
                </label>
                <textarea
                  id="group-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description for this document group"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-slate-700 bg-slate-800 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-slate-200">
                  Active (visible in Documents module)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-700 text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  {editingGroup ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-xl border ${
              snackbar.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {snackbar.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{snackbar.message}</span>
            <button
              onClick={() => setSnackbar({ ...snackbar, open: false })}
              className="ml-2 hover:opacity-70 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
