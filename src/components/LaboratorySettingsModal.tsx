'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';

const UPDATE_LABORATORY = gql`
  mutation UpdateLaboratory($id: ID!, $input: UpdateLaboratoryInput!) {
    updateLaboratory(id: $id, input: $input) {
      id
      name
      procedures {
        name
        dailyCapacity
      }
    }
  }
`;

type Procedure = {
  id: string;
  name: string;
  dailyCapacity: number;
};

type SnackbarState = {
  show: boolean;
  message: string;
  type: 'success' | 'error';
};

type Laboratory = {
  id: string;
  name: string;
  shortName: string;
  procedures?: Procedure[];
};

type LaboratorySettingsModalProps = {
  laboratory: Laboratory;
  onClose: () => void;
  onSuccess: () => void;
};

export default function LaboratorySettingsModal({
  laboratory,
  onClose,
  onSuccess,
}: LaboratorySettingsModalProps) {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'procedures' | 'pricing' | 'materials'>('procedures');
  const [procedures, setProcedures] = useState<Procedure[]>(
    (laboratory.procedures || []).map((proc, index) => ({
      ...proc,
      id: proc.id || `${Date.now()}-${index}`,
    }))
  );
  const [newProcedureName, setNewProcedureName] = useState('');
  const [newProcedureCapacity, setNewProcedureCapacity] = useState('10');
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  const [updateLaboratory, { loading }] = useMutation(UPDATE_LABORATORY);

  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnackbar({ show: true, message, type });
    setTimeout(() => {
      setSnackbar({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleAddProcedure = (e: FormEvent) => {
    e.preventDefault();
    if (!newProcedureName.trim()) return;

    const newProcedure: Procedure = {
      id: Date.now().toString(),
      name: newProcedureName.trim(),
      dailyCapacity: Number.parseInt(newProcedureCapacity) || 10,
    };

    setProcedures([...procedures, newProcedure]);
    setNewProcedureName('');
    setNewProcedureCapacity('10');
    
    // Show success message
    showSnackbar(t(`Procedure "${newProcedure.name}" added. Click "Save Settings" to persist changes.`), 'success');
  };

  const handleUpdateProcedure = (id: string, field: 'name' | 'dailyCapacity', value: string | number) => {
    setProcedures(
      procedures.map((proc) =>
        proc.id === id ? { ...proc, [field]: value } : proc
      )
    );
  };

  const handleDeleteProcedure = (id: string) => {
    setProcedures(procedures.filter((proc) => proc.id !== id));
  };

  const handleSave = async () => {
    try {
      // Filter out empty procedures and ensure valid data
      const validProcedures = procedures
        .filter(proc => proc.name.trim() && proc.dailyCapacity > 0)
        .map(({ id, ...rest }) => ({
          name: rest.name.trim(),
          dailyCapacity: Number(rest.dailyCapacity)
        }));

      console.log('Saving procedures:', validProcedures);

      const result = await updateLaboratory({
        variables: {
          id: laboratory.id,
          input: {
            procedures: validProcedures,
          },
        },
      });

      console.log('Save result:', result);
      showSnackbar(t('Settings saved successfully!'), 'success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      console.error('Error updating laboratory settings:', error);
      showSnackbar(t(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{laboratory.name}</h3>
              <p className="text-sm text-slate-400">{t('Laboratory Settings')}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('procedures')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'procedures'
                  ? 'border-b-2 border-primary-500 text-primary-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('Procedures')}
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'pricing'
                  ? 'border-b-2 border-primary-500 text-primary-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('Pricing')}
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeTab === 'materials'
                  ? 'border-b-2 border-primary-500 text-primary-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('Materials')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'procedures' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">{t('Procedures & Daily Capacity')}</h4>
                <p className="text-sm text-slate-400">
                  {t('Configure the procedures this laboratory can handle and their daily capacity.')}
                </p>
              </div>

              {/* Add New Procedure Form */}
              <form onSubmit={handleAddProcedure} className="rounded-xl border border-slate-700 bg-slate-800/40 p-4">
                <h5 className="text-sm font-semibold text-white mb-3">{t('Add New Procedure')}</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('Procedure Name')}
                    </label>
                    <input
                      type="text"
                      value={newProcedureName}
                      onChange={(e) => setNewProcedureName(e.target.value)}
                      placeholder="e.g., Crown, Bridge, Denture..."
                      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {t('Daily Capacity')}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        value={newProcedureCapacity}
                        onChange={(e) => setNewProcedureCapacity(e.target.value)}
                        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <button
                        type="submit"
                        className="flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              {/* Procedures List */}
              {procedures.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-800/20 p-12 text-center">
                  <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-4 text-slate-400">{t('No procedures configured')}</p>
                  <p className="mt-1 text-sm text-slate-500">{t('Add your first procedure above.')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {procedures.map((procedure) => (
                    <div
                      key={procedure.id}
                      className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-800/40 p-4 transition hover:border-slate-600"
                    >
                      <div className="flex-1">
                        <input
                          type="text"
                          value={procedure.name}
                          onChange={(e) => handleUpdateProcedure(procedure.id, 'name', e.target.value)}
                          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-medium text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div className="w-32">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={procedure.dailyCapacity}
                            onChange={(e) =>
                              handleUpdateProcedure(procedure.id, 'dailyCapacity', Number.parseInt(e.target.value) || 1)
                            }
                            className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          />
                          <span className="text-xs text-slate-400 whitespace-nowrap">{t('per day')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProcedure(procedure.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-900/20 hover:text-red-400"
                        title={t('Delete')}
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-slate-400">{t('Pricing configuration')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('Coming soon...')}</p>
            </div>
          )}

          {activeTab === 'materials' && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/20 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <p className="mt-4 text-slate-400">{t('Materials configuration')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('Coming soon...')}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              {t('Cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? t('Saving...') : t('Save Settings')}
            </button>
          </div>
        </div>
      </div>

      {/* Snackbar Notification */}
      {snackbar.show && (
        <div
          className={`fixed bottom-6 right-6 z-[60] animate-slide-in-up rounded-xl border px-6 py-4 shadow-2xl transition-all ${
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
