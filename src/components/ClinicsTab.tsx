'use client';

import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useTranslations } from '@/lib/i18n';

// GraphQL Queries
const GET_CLINIC_LOCATIONS = gql`
  query GetClinicLocations {
    clinicLocations {
      id
      companyId
      companyName
      headquarters
      description
      mapCenter {
        lat
        lng
      }
      clinics {
        clinicId
        name
        address
        city
        zip
        phone
        email
        hours
        coordinates {
          lat
          lng
        }
      }
    }
  }
`;

const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
      shortName
    }
  }
`;

const CREATE_CLINIC_LOCATION = gql`
  mutation CreateClinicLocation($input: ClinicLocationInput!) {
    createClinicLocation(input: $input) {
      id
      companyId
      companyName
    }
  }
`;

const ADD_CLINIC = gql`
  mutation AddClinic($companyId: String!, $clinic: ClinicInput!) {
    addClinic(companyId: $companyId, clinic: $clinic) {
      id
      companyId
      clinics {
        clinicId
        name
      }
    }
  }
`;

const UPDATE_CLINIC = gql`
  mutation UpdateClinic($companyId: String!, $clinicId: String!, $clinic: ClinicInput!) {
    updateClinic(companyId: $companyId, clinicId: $clinicId, clinic: $clinic) {
      id
      companyId
      clinics {
        clinicId
        name
      }
    }
  }
`;

const REMOVE_CLINIC = gql`
  mutation RemoveClinic($companyId: String!, $clinicId: String!) {
    removeClinic(companyId: $companyId, clinicId: $clinicId) {
      id
      companyId
      clinics {
        clinicId
        name
      }
    }
  }
`;

type Clinic = {
  clinicId: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
};

type ClinicLocation = {
  id: string;
  companyId: string;
  companyName: string;
  headquarters: string;
  description: string;
  mapCenter: {
    lat: number;
    lng: number;
  };
  clinics: Clinic[];
};

type Company = {
  id: string;
  name: string;
  shortName: string;
};

export default function ClinicsTab() {
  const { t } = useTranslations();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddClinicModal, setShowAddClinicModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState(''); // For filtering
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [clinicFormData, setClinicFormData] = useState<Clinic>({
    clinicId: '',
    name: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    email: '',
    hours: '',
    coordinates: { lat: 0, lng: 0 },
  });

  // For creating new clinic location
  const [newLocationFormData, setNewLocationFormData] = useState({
    companyId: '',
    companyName: '',
    headquarters: '',
    description: '',
    mapCenter: { lat: 0, lng: 0 },
  });

  const { data: locationsData, loading, refetch } = useQuery(GET_CLINIC_LOCATIONS);
  const { data: companiesData } = useQuery(GET_COMPANIES);

  const [createClinicLocation, { loading: creatingLocation }] = useMutation(CREATE_CLINIC_LOCATION, {
    onCompleted: () => {
      setSnackbar({ message: t('Clinic location created successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
      handleCloseCreateModal();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const [addClinic, { loading: addingClinic }] = useMutation(ADD_CLINIC, {
    onCompleted: () => {
      setSnackbar({ message: t('Clinic added successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
      handleCloseAddClinicModal();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const [updateClinic, { loading: updatingClinic }] = useMutation(UPDATE_CLINIC, {
    onCompleted: () => {
      setSnackbar({ message: t('Clinic updated successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
      handleCloseAddClinicModal();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const [removeClinic, { loading: removingClinic }] = useMutation(REMOVE_CLINIC, {
    onCompleted: () => {
      setSnackbar({ message: t('Clinic deleted successfully'), type: 'success' });
      setTimeout(() => setSnackbar(null), 4000);
      refetch();
    },
    onError: (error) => {
      setSnackbar({ message: error.message, type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
    },
  });

  const clinicLocations: ClinicLocation[] = locationsData?.clinicLocations || [];
  const companies: Company[] = companiesData?.companies || [];

  // Filter clinic locations by selected company
  const filteredLocations = selectedCompanyFilter
    ? clinicLocations.filter((loc) => loc.companyId === selectedCompanyFilter)
    : clinicLocations;

  const handleOpenAddClinic = (companyId: string) => {
    setIsEditMode(false);
    setEditingClinicId('');
    setSelectedCompanyId(companyId);
    setClinicFormData({
      clinicId: '',
      name: '',
      address: '',
      city: '',
      zip: '',
      phone: '',
      email: '',
      hours: '',
      coordinates: { lat: 0, lng: 0 },
    });
    setShowAddClinicModal(true);
  };

  const handleOpenEditClinic = (companyId: string, clinic: Clinic) => {
    setIsEditMode(true);
    setEditingClinicId(clinic.clinicId);
    setSelectedCompanyId(companyId);
    setClinicFormData(clinic);
    setShowAddClinicModal(true);
  };

  const handleDeleteClinic = async (companyId: string, clinicId: string) => {
    if (globalThis.confirm(t('Are you sure you want to delete this clinic?'))) {
      try {
        await removeClinic({
          variables: {
            companyId,
            clinicId,
          },
        });
      } catch (error) {
        console.error('Error deleting clinic:', error);
      }
    }
  };

  const handleCreateLocation = () => {
    if (!newLocationFormData.companyId || !newLocationFormData.companyName) {
      setSnackbar({ message: t('Please fill in all required fields'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    createClinicLocation({
      variables: {
        input: {
          companyId: newLocationFormData.companyId,
          companyName: newLocationFormData.companyName,
          headquarters: newLocationFormData.headquarters,
          description: newLocationFormData.description,
          mapCenter: newLocationFormData.mapCenter,
          clinics: [],
        },
      },
      refetchQueries: [{ query: GET_CLINIC_LOCATIONS }],
    });
  };

  const handleCloseAddClinicModal = () => {
    setShowAddClinicModal(false);
    setIsEditMode(false);
    setEditingClinicId('');
    setSelectedCompanyId('');
    setClinicFormData({
      clinicId: '',
      name: '',
      address: '',
      city: '',
      zip: '',
      phone: '',
      email: '',
      hours: '',
      coordinates: { lat: 0, lng: 0 },
    });
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewLocationFormData({
      companyId: '',
      companyName: '',
      headquarters: '',
      description: '',
      mapCenter: { lat: 0, lng: 0 },
    });
  };

  const handleInputChange = (field: keyof Clinic, value: string | number) => {
    setClinicFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCoordinatesChange = (field: 'lat' | 'lng', value: number) => {
    setClinicFormData((prev) => ({
      ...prev,
      coordinates: { ...prev.coordinates, [field]: value },
    }));
  };

  const handleSubmitClinic = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedCompanyId) {
      setSnackbar({ message: t('Please select a company location'), type: 'error' });
      setTimeout(() => setSnackbar(null), 4000);
      return;
    }

    try {
      // Remove __typename from the data before sending to mutation
      const cleanClinicData = {
        clinicId: clinicFormData.clinicId,
        name: clinicFormData.name,
        address: clinicFormData.address,
        city: clinicFormData.city,
        zip: clinicFormData.zip,
        phone: clinicFormData.phone,
        email: clinicFormData.email,
        hours: clinicFormData.hours,
        coordinates: {
          lat: clinicFormData.coordinates.lat,
          lng: clinicFormData.coordinates.lng,
        },
      };

      if (isEditMode) {
        await updateClinic({
          variables: {
            companyId: selectedCompanyId,
            clinicId: editingClinicId,
            clinic: cleanClinicData,
          },
        });
      } else {
        await addClinic({
          variables: {
            companyId: selectedCompanyId,
            clinic: cleanClinicData,
          },
        });
      }
    } catch (error) {
      console.error('Error saving clinic:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Company Filter and Action Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{t('Clinic Management')}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {t('Manage clinics for each company in your organization.')}
            </p>
          </div>
        </div>

        {/* Filter and Action Buttons Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Company Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-300">
              {t('Filter by Company')}:
            </label>
            <select
              value={selectedCompanyFilter}
              onChange={(e) => setSelectedCompanyFilter(e.target.value)}
              className="px-4 py-2 bg-[#2d2d2d] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('All Companies')}</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('Create New Clinic Location')}
            </button>
            
            <button
              onClick={() => setShowAddClinicModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('Add Clinic to Existing')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-primary-500"></div>
        </div>
      ) : filteredLocations.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="mt-4 text-lg font-medium text-slate-300">
            {selectedCompanyFilter ? t('No clinics found for this company') : t('No clinics configured')}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {t('Start by adding clinics to your companies.')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredLocations.map((location) => (
            <div key={location.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
              {/* Company Header */}
              <div className="border-b border-slate-800 bg-slate-800/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{location.companyName}</h3>
                    <p className="mt-1 text-sm text-slate-400">{location.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('Headquarters')}: {location.headquarters}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAddClinic(location.companyId)}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('Add Clinic')}
                  </button>
                </div>
              </div>

              {/* Clinics List */}
              <div className="p-6">
                {location.clinics.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    {t('No clinics added yet')}
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {location.clinics.map((clinic) => (
                      <div
                        key={clinic.clinicId}
                        className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition hover:border-primary-500/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{clinic.name}</h4>
                            <p className="mt-1 text-xs text-slate-400">{clinic.address}</p>
                            <p className="text-xs text-slate-400">
                              {clinic.city}, {clinic.zip}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditClinic(location.companyId, clinic)}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-blue-400"
                              title={t('Edit clinic')}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteClinic(location.companyId, clinic.clinicId)}
                              disabled={removingClinic}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700 hover:text-red-400 disabled:opacity-50"
                              title={t('Delete clinic')}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2 border-t border-slate-700 pt-4">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{clinic.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{clinic.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{clinic.hours}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Clinic Location Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="border-b border-slate-700 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{t('Create New Clinic Location')}</h3>
              <p className="mt-1 text-sm text-slate-400">
                {t('Set up a new company location with clinic details')}
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateLocation(); }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Company')} <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={newLocationFormData.companyId}
                    onChange={(e) => {
                      const selected = companies.find((c) => c.id === e.target.value);
                      setNewLocationFormData((prev) => ({
                        ...prev,
                        companyId: e.target.value,
                        companyName: selected?.name || '',
                      }));
                    }}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">{t('Select a company')}</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Headquarters')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLocationFormData.headquarters}
                    onChange={(e) =>
                      setNewLocationFormData((prev) => ({ ...prev, headquarters: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('Main Office Location')}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    {t('Description')}
                  </label>
                  <textarea
                    value={newLocationFormData.description}
                    onChange={(e) =>
                      setNewLocationFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder={t('Optional description')}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Map Center Latitude')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocationFormData.mapCenter.lat}
                      onChange={(e) =>
                        setNewLocationFormData((prev) => ({
                          ...prev,
                          mapCenter: { ...prev.mapCenter, lat: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="0.0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Map Center Longitude')}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={newLocationFormData.mapCenter.lng}
                      onChange={(e) =>
                        setNewLocationFormData((prev) => ({
                          ...prev,
                          mapCenter: { ...prev.mapCenter, lng: parseFloat(e.target.value) || 0 },
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={creatingLocation}
                  className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creatingLocation}
                  className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingLocation ? t('Creating...') : t('Create Location')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Clinic Modal */}
      {showAddClinicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? t('Edit Clinic') : t('Add New Clinic')}
              </h2>
              <button
                onClick={handleCloseAddClinicModal}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitClinic}>
              <div className="max-h-[600px] overflow-y-auto p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Company Selection */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Select Company Location')} <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      <option value="">{t('-- Select a company location --')}</option>
                      {clinicLocations.map((location) => (
                        <option key={location.id} value={location.companyId}>
                          {location.companyName} - {location.headquarters}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Clinic ID')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.clinicId}
                      onChange={(e) => handleInputChange('clinicId', e.target.value)}
                      readOnly={isEditMode}
                      className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isEditMode ? 'opacity-60 cursor-not-allowed' : ''}`}
                      placeholder={t('e.g., CLN001')}
                    />
                    {isEditMode && (
                      <p className="mt-1 text-xs text-slate-500">{t('Clinic ID cannot be changed')}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Clinic Name')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder={t('Downtown Dental Clinic')}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Address')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder={t('123 Main Street')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('City')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('ZIP Code')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.zip}
                      onChange={(e) => handleInputChange('zip', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Phone')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={clinicFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Email')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={clinicFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Operating Hours')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clinicFormData.hours}
                      onChange={(e) => handleInputChange('hours', e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      placeholder={t('Mon-Fri: 8:00 AM - 6:00 PM')}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Latitude')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={clinicFormData.coordinates.lat}
                      onChange={(e) => handleCoordinatesChange('lat', parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-200">
                      {t('Longitude')} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="any"
                      value={clinicFormData.coordinates.lng}
                      onChange={(e) => handleCoordinatesChange('lng', parseFloat(e.target.value))}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseAddClinicModal}
                  disabled={addingClinic || updatingClinic}
                  className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={addingClinic || updatingClinic}
                  className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isEditMode 
                    ? (updatingClinic ? t('Updating...') : t('Update Clinic'))
                    : (addingClinic ? t('Adding...') : t('Add Clinic'))
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`rounded-lg border px-6 py-3 shadow-lg ${
              snackbar.type === 'success'
                ? 'border-green-500/20 bg-green-500/10 text-green-400'
                : 'border-red-500/20 bg-red-500/10 text-red-400'
            }`}
          >
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
}
