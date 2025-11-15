'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';

// GraphQL Queries and Mutations
const GET_DMS_INTEGRATIONS = gql`
  query GetDMSIntegrations($companyId: ID!) {
    dmsIntegrations(companyId: $companyId) {
      id
      companyId
      provider
      serverHost
      serverPort
      username
      database
      isActive
      lastSyncAt
      createdAt
    }
  }
`;

const TEST_DMS_CONNECTION = gql`
  mutation TestDMSConnection($input: TestDMSConnectionInput!) {
    testDMSConnection(input: $input) {
      success
      message
      databases
    }
  }
`;

const CREATE_DMS_INTEGRATION = gql`
  mutation CreateDMSIntegration($input: CreateDMSIntegrationInput!) {
    createDMSIntegration(input: $input) {
      id
      companyId
      provider
      serverHost
      serverPort
      username
      database
      isActive
    }
  }
`;

const UPDATE_DMS_INTEGRATION = gql`
  mutation UpdateDMSIntegration($id: ID!, $input: UpdateDMSIntegrationInput!) {
    updateDMSIntegration(id: $id, input: $input) {
      id
      companyId
      provider
      serverHost
      serverPort
      username
      database
      isActive
    }
  }
`;

const DELETE_DMS_INTEGRATION = gql`
  mutation DeleteDMSIntegration($id: ID!) {
    deleteDMSIntegration(id: $id) {
      success
      message
    }
  }
`;

const SYNC_PATIENTS_FROM_DMS = gql`
  mutation SyncPatientsFromDMS($input: SyncPatientsInput!) {
    syncPatientsFromDMS(input: $input) {
      success
      message
      patientsAdded
      patientsUpdated
      patientsSkipped
      errors
    }
  }
`;

const GET_DMS_SYNC_STATUS = gql`
  query GetDMSSyncStatus($integrationId: ID!) {
    dmsSyncStatus(integrationId: $integrationId) {
      integrationId
      isRunning
      lastSyncAt
      lastSyncResult {
        success
        message
        patientsAdded
        patientsUpdated
        patientsSkipped
        errors
      }
    }
  }
`;

type DMSProvider = 'open-dental' | 'dentrix' | 'eaglesoft' | 'practice-works';

type DMSIntegration = {
  id: string;
  companyId: string;
  provider: DMSProvider;
  serverHost: string;
  serverPort: number;
  username: string;
  database: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
};

type IntegrationsTabProps = {
  selectedCompanyId: string | null;
};

export default function IntegrationsTab({ selectedCompanyId }: IntegrationsTabProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<DMSIntegration | null>(null);
  const [syncFullMode, setSyncFullMode] = useState(false);
  const [syncLimit, setSyncLimit] = useState('100');
  const [currentStep, setCurrentStep] = useState<'provider' | 'credentials' | 'database'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<DMSProvider | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<DMSIntegration | null>(null);
  const [availableDatabases, setAvailableDatabases] = useState<string[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);
  
  const [formData, setFormData] = useState({
    serverHost: '',
    serverPort: '3306',
    username: '',
    password: '',
    database: '',
  });

  // GraphQL hooks
  const { data, loading, refetch } = useQuery(GET_DMS_INTEGRATIONS, {
    variables: { companyId: selectedCompanyId },
    skip: !selectedCompanyId,
  });

  const [testConnection] = useMutation(TEST_DMS_CONNECTION);
  const [createIntegration] = useMutation(CREATE_DMS_INTEGRATION);
  const [updateIntegration] = useMutation(UPDATE_DMS_INTEGRATION);
  const [deleteIntegration] = useMutation(DELETE_DMS_INTEGRATION);
  const [syncPatients, { loading: syncing }] = useMutation(SYNC_PATIENTS_FROM_DMS);

  const integrations: DMSIntegration[] = data?.dmsIntegrations || [];

  const dmsProviders = [
    {
      id: 'open-dental' as DMSProvider,
      name: 'Open Dental',
      description: 'Connect to Open Dental practice management system',
      icon: '🦷',
      color: 'bg-blue-500',
    },
    {
      id: 'dentrix' as DMSProvider,
      name: 'Dentrix',
      description: 'Connect to Dentrix practice management system',
      icon: '📊',
      color: 'bg-purple-500',
    },
    {
      id: 'eaglesoft' as DMSProvider,
      name: 'Eaglesoft',
      description: 'Connect to Patterson Eaglesoft system',
      icon: '🦅',
      color: 'bg-amber-500',
    },
    {
      id: 'practice-works' as DMSProvider,
      name: 'Practice Works',
      description: 'Connect to Practice Works system',
      icon: '⚙️',
      color: 'bg-emerald-500',
    },
  ];

  const handleOpenCreate = () => {
    setEditingIntegration(null);
    setCurrentStep('provider');
    setSelectedProvider(null);
    setAvailableDatabases([]);
    setFormData({
      serverHost: '',
      serverPort: '3306',
      username: '',
      password: '',
      database: '',
    });
    setShowConfigModal(true);
  };

  const handleSelectProvider = (provider: DMSProvider) => {
    setSelectedProvider(provider);
    setCurrentStep('credentials');
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    setTestingConnection(true);
    try {
      const result = await testConnection({
        variables: {
          input: {
            provider: selectedProvider,
            serverHost: formData.serverHost,
            serverPort: parseInt(formData.serverPort),
            username: formData.username,
            password: formData.password,
          },
        },
      });

      if (result.data?.testDMSConnection.success) {
        setAvailableDatabases(result.data.testDMSConnection.databases || []);
        setCurrentStep('database');
      } else {
        alert(result.data?.testDMSConnection.message || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      alert('Failed to connect. Please check your credentials and try again.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveIntegration = async () => {
    if (!selectedProvider || !selectedCompanyId) return;

    try {
      if (editingIntegration) {
        await updateIntegration({
          variables: {
            id: editingIntegration.id,
            input: {
              serverHost: formData.serverHost,
              serverPort: parseInt(formData.serverPort),
              username: formData.username,
              password: formData.password,
              database: formData.database,
              isActive: true,
            },
          },
        });
      } else {
        await createIntegration({
          variables: {
            input: {
              companyId: selectedCompanyId,
              provider: selectedProvider,
              serverHost: formData.serverHost,
              serverPort: parseInt(formData.serverPort),
              username: formData.username,
              password: formData.password,
              database: formData.database,
              isActive: true,
            },
          },
        });
      }

      await refetch();
      setShowConfigModal(false);
    } catch (error) {
      console.error('Error saving integration:', error);
      alert('Failed to save integration. Please try again.');
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration?')) return;

    try {
      await deleteIntegration({
        variables: { id },
      });
      await refetch();
    } catch (error) {
      console.error('Error deleting integration:', error);
      alert('Failed to delete integration.');
    }
  };

  const handleOpenSyncModal = (integration: DMSIntegration) => {
    setSelectedIntegration(integration);
    setSyncFullMode(false);
    setSyncLimit('100');
    setShowSyncModal(true);
  };

  const handleSyncPatients = async () => {
    if (!selectedIntegration) return;

    try {
      const result = await syncPatients({
        variables: {
          input: {
            integrationId: selectedIntegration.id,
            fullSync: syncFullMode,
            limit: Number.parseInt(syncLimit, 10),
          },
        },
      });

      const syncResult = result.data?.syncPatientsFromDMS;
      
      if (syncResult?.success) {
        alert(
          `Sync completed successfully!\n\n` +
          `Patients Added: ${syncResult.patientsAdded}\n` +
          `Patients Updated: ${syncResult.patientsUpdated}\n` +
          `Patients Skipped: ${syncResult.patientsSkipped}\n` +
          (syncResult.errors.length > 0 ? `\nErrors:\n${syncResult.errors.join('\n')}` : '')
        );
      } else {
        alert(`Sync failed: ${syncResult?.message || 'Unknown error'}`);
      }

      await refetch();
      setShowSyncModal(false);
    } catch (error: any) {
      console.error('Error syncing patients:', error);
      alert(`Failed to sync patients: ${error.message}`);
    }
  };

  if (!selectedCompanyId) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="mt-4 text-slate-400">Please select a company first</p>
        <p className="mt-1 text-sm text-slate-500">Integrations are configured per company</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">DMS Integrations</h2>
          <p className="mt-1 text-sm text-slate-400">
            Connect with dental management systems to sync patient data
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Integration
        </button>
      </div>

      {/* Integrations List */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading integrations...
          </div>
        ) : integrations.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-slate-400">No integrations configured</p>
            <p className="mt-1 text-sm text-slate-500">Add your first DMS integration to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {integrations.map((integration) => {
              const providerInfo = dmsProviders.find((p) => p.id === integration.provider);
              return (
                <div key={integration.id} className="p-6 hover:bg-slate-800/30 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${providerInfo?.color} text-2xl`}>
                        {providerInfo?.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{providerInfo?.name}</h3>
                        <p className="mt-0.5 text-sm text-slate-400">
                          {integration.serverHost}:{integration.serverPort} • {integration.database}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <div className={`h-2 w-2 rounded-full ${integration.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                            {integration.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {integration.lastSyncAt && (
                            <span>Last sync: {new Date(integration.lastSyncAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSyncModal(integration)}
                        disabled={!integration.isActive || syncing}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Sync patients from DMS"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {syncing ? 'Syncing...' : 'Sync Patients'}
                      </button>
                      <button
                        onClick={() => handleDeleteIntegration(integration.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                        title="Delete integration"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowConfigModal(false)}
          />
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">Configure DMS Integration</h3>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className={`flex items-center gap-2 ${currentStep === 'provider' ? 'text-primary-400' : 'text-slate-500'}`}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep === 'provider' ? 'bg-primary-500 text-white' : 'bg-slate-700'}`}>
                      1
                    </div>
                    <span>Provider</span>
                  </div>
                  <div className="h-px w-8 bg-slate-700" />
                  <div className={`flex items-center gap-2 ${currentStep === 'credentials' ? 'text-primary-400' : 'text-slate-500'}`}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep === 'credentials' ? 'bg-primary-500 text-white' : 'bg-slate-700'}`}>
                      2
                    </div>
                    <span>Credentials</span>
                  </div>
                  <div className="h-px w-8 bg-slate-700" />
                  <div className={`flex items-center gap-2 ${currentStep === 'database' ? 'text-primary-400' : 'text-slate-500'}`}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${currentStep === 'database' ? 'bg-primary-500 text-white' : 'bg-slate-700'}`}>
                      3
                    </div>
                    <span>Database</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Provider Selection */}
              {currentStep === 'provider' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Select your dental management system provider</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {dmsProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleSelectProvider(provider.id)}
                        className="flex items-center gap-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 p-4 text-left transition hover:border-primary-500 hover:bg-slate-800"
                      >
                        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${provider.color} text-2xl`}>
                          {provider.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{provider.name}</h4>
                          <p className="mt-0.5 text-sm text-slate-400">{provider.description}</p>
                        </div>
                        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Server Credentials */}
              {currentStep === 'credentials' && selectedProvider && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dmsProviders.find(p => p.id === selectedProvider)?.color} text-xl`}>
                      {dmsProviders.find(p => p.id === selectedProvider)?.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{dmsProviders.find(p => p.id === selectedProvider)?.name}</p>
                      <p className="text-sm text-slate-400">Enter your server connection details</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">
                        Server Host <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.serverHost}
                        onChange={(e) => setFormData({ ...formData, serverHost: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="e.g., localhost or 192.168.1.100"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Port <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.serverPort}
                          onChange={(e) => setFormData({ ...formData, serverPort: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="3306"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Username <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          placeholder="Database username"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-200">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Database password"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep('provider')}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleTestConnection}
                      disabled={testingConnection || !formData.serverHost || !formData.username || !formData.password}
                      className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testingConnection ? 'Testing Connection...' : 'Test Connection'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Database Selection */}
              {currentStep === 'database' && (
                <div className="space-y-4">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Connection successful!</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      Select Database <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formData.database}
                      onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">-- Select a database --</option>
                      {availableDatabases.map((db) => (
                        <option key={db} value={db}>
                          {db}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-slate-500">
                      Found {availableDatabases.length} database(s) on the server
                    </p>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setCurrentStep('credentials');
                        setAvailableDatabases([]);
                      }}
                      className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveIntegration}
                      disabled={!formData.database}
                      className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Integration
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sync Patients Modal */}
      {showSyncModal && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowSyncModal(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-white">Sync Patients from DMS</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Import patient data from {dmsProviders.find(p => p.id === selectedIntegration.provider)?.name}
                </p>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="rounded-lg bg-slate-800/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dmsProviders.find(p => p.id === selectedIntegration.provider)?.color} text-xl`}>
                    {dmsProviders.find(p => p.id === selectedIntegration.provider)?.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {selectedIntegration.serverHost}:{selectedIntegration.serverPort}
                    </p>
                    <p className="text-sm text-slate-400">Database: {selectedIntegration.database}</p>
                  </div>
                </div>
              </div>

              {/* Sync Options */}
              <div className="space-y-4">
                <div>
                  <label className="mb-3 flex items-center gap-3 text-sm font-semibold text-slate-200">
                    <input
                      type="checkbox"
                      checked={syncFullMode}
                      onChange={(e) => setSyncFullMode(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary-600 focus:ring-2 focus:ring-primary-500/20"
                    />
                    Full Sync
                  </label>
                  <p className="ml-7 text-sm text-slate-500">
                    {syncFullMode 
                      ? 'Sync all patients from the DMS database (may take longer)' 
                      : 'Sync only patients modified since last sync'}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Limit <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={syncLimit}
                    onChange={(e) => setSyncLimit(e.target.value)}
                    min="1"
                    max="10000"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="100"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    Maximum number of patients to sync in this batch (1-10,000)
                  </p>
                </div>
              </div>

              {/* Last Sync Info */}
              {selectedIntegration.lastSyncAt && (
                <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-300">Last Sync</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(selectedIntegration.lastSyncAt).toLocaleString()}
                      </p>
                    </div>
                    <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Important</p>
                    <p className="mt-1 text-sm text-amber-200/80">
                      This will import patient records from your DMS. Existing patients with matching names and birthdates will be updated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowSyncModal(false)}
                  disabled={syncing}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSyncPatients}
                  disabled={syncing || !syncLimit || Number.parseInt(syncLimit) < 1}
                  className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {syncing ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Start Sync
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
