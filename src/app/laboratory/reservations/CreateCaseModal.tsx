'use client';

import { useState, type FormEvent, useEffect } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { CREATE_LAB_CASE } from '@/graphql/lab-mutations';
import { useTranslations } from '@/lib/i18n';
import { getUserSession } from '@/lib/permissions';

const GET_LABORATORIES = gql`
  query GetLaboratories {
    laboratories {
      id
      name
      procedures {
        name
        dailyCapacity
      }
    }
  }
`;

const GET_ALL_CLINICS = gql`
  query GetAllClinics {
    clinicLocations {
      id
      companyId
      companyName
      clinics {
        clinicId
        name
        address
        city
      }
    }
  }
`;

const GET_USERS_BY_COMPANY = gql`
  query GetUsersByCompany($companyId: ID!) {
    users(companyId: $companyId) {
      id
      name
      email
      role
    }
  }
`;

const GET_ALL_LAB_TECHNICIANS = gql`
  query GetAllLabTechnicians {
    users {
      id
      name
      email
      role
    }
  }
`;

const GET_PATIENTS = gql`
  query GetPatients($companyId: ID, $search: String) {
    patients(companyId: $companyId, search: $search) {
      id
      firstName
      lastName
      birthday
      email
      phone
    }
  }
`;

type CreateCaseModalProps = {
  procedure: string;
  date: Date;
  autoSchedule?: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateCaseModal({ procedure, date, autoSchedule = false, onClose, onSuccess }: Readonly<CreateCaseModalProps>) {
  const { t } = useTranslations();
  const userSession = getUserSession();
  const isAdminLike = userSession?.role === 'admin' || userSession?.role === 'manager';
  const userCompanyId = userSession?.companyId;

  const [patientType, setPatientType] = useState<'existing' | 'new'>('new');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [patientSearch, setPatientSearch] = useState<string>('');
  const [patientFirstName, setPatientFirstName] = useState<string>('');
  const [patientLastName, setPatientLastName] = useState<string>('');
  const [patientBirthday, setPatientBirthday] = useState<string>('');
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>(() => (procedure && procedure !== 'New Case' ? procedure : ''));
  const [availableProcedures, setAvailableProcedures] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { data: labsData, loading: labsLoading } = useQuery(GET_LABORATORIES);
  const { data: clinicsData, loading: clinicsLoading } = useQuery(GET_ALL_CLINICS);
  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS_BY_COMPANY, {
    variables: { companyId: selectedCompanyId },
    skip: !selectedCompanyId, // Don't fetch until a clinic is selected
  });
  const { data: techData, loading: techLoading } = useQuery(GET_ALL_LAB_TECHNICIANS);
  const { data: patientsData, loading: patientsLoading } = useQuery(GET_PATIENTS, {
    variables: { 
      companyId: selectedCompanyId,
      search: patientSearch || undefined 
    },
    skip: patientType === 'new' || !selectedCompanyId,
  });
  
  const laboratories = labsData?.laboratories || [];
  const clinicLocations = clinicsData?.clinicLocations || [];
  const users = usersData?.users || [];
  const allUsers = techData?.users || [];
  const patients = patientsData?.patients || [];
  
  // Flatten all clinics from all companies
  const allClinics = clinicLocations.flatMap((location: any) => 
    location.clinics.map((clinic: any) => ({
      ...clinic,
      companyName: location.companyName,
      companyId: location.companyId
    }))
  );

  const visibleClinics = isAdminLike || !userCompanyId ? allClinics : allClinics.filter((clinic: any) => clinic.companyId === userCompanyId);

  // Filter users with dentist role only
  const doctors = users.filter((user: any) => user.role === 'dentist');

  // Filter users with lab_tech role only
  const technicians = allUsers.filter((user: any) => user.role === 'lab_tech');

  const [createLabCase, { loading }] = useMutation(CREATE_LAB_CASE, {
    onCompleted: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const applyClinicSelection = (clinicId: string) => {
    setSelectedClinicId(clinicId);

    const clinic = allClinics.find((c: any) => c.clinicId === clinicId);
    if (clinic) {
      setSelectedClinic(clinic.name);
      setSelectedCompanyId(clinic.companyId);
    } else {
      setSelectedClinic('');
      setSelectedCompanyId('');
    }

    setSelectedDoctor('');
    setSelectedDoctorId('');
  };

  // Default clinic for non-admin users to their company clinic.
  useEffect(() => {
    if (isAdminLike) return;
    if (!userCompanyId) return;
    if (selectedClinicId) return;
    if (visibleClinics.length === 0) return;

    applyClinicSelection(visibleClinics[0].clinicId);
  }, [isAdminLike, selectedClinicId, visibleClinics]);

  // Update available procedures when lab is selected
  useEffect(() => {
    const lab = selectedLab ? laboratories.find((l: any) => l.id === selectedLab) : undefined;
    const procedures = lab?.procedures?.map((p: any) => p.name) ?? [];
    setAvailableProcedures(procedures);

    if (procedures.length === 0) {
      if (selectedProcedure) setSelectedProcedure('');
      return;
    }

    if (selectedProcedure && procedures.includes(selectedProcedure)) return;
    if (procedure && procedure !== 'New Case' && procedures.includes(procedure)) {
      setSelectedProcedure(procedure);
      return;
    }

    setSelectedProcedure(procedures[0] ?? '');
  }, [selectedLab, laboratories, procedure, selectedProcedure]);

  // Auto-select a lab that supports the selected procedure.
  useEffect(() => {
    if (selectedLab) return;
    if (!procedure || procedure === 'New Case') return;
    if (laboratories.length === 0) return;

    const candidateLabs = laboratories.filter((lab: any) =>
      Array.isArray(lab?.procedures) && lab.procedures.some((p: any) => p?.name === procedure)
    );
    if (candidateLabs.length === 0) return;

    const companyForDefaults = selectedCompanyId || userCompanyId;
    const savedKey = companyForDefaults ? `ontime.defaultLab.${companyForDefaults}.${procedure}` : undefined;
    if (savedKey) {
      const savedLabId = globalThis.localStorage.getItem(savedKey);
      if (savedLabId && candidateLabs.some((lab: any) => lab.id === savedLabId)) {
        setSelectedLab(savedLabId);
        setSelectedProcedure(procedure);
        return;
      }
    }

    const bestLab = candidateLabs
      .map((lab: any) => {
        const capacity = lab.procedures?.find((p: any) => p?.name === procedure)?.dailyCapacity ?? 0;
        return { lab, capacity };
      })
      .sort((a: any, b: any) => {
        if (b.capacity !== a.capacity) return b.capacity - a.capacity;
        return String(a.lab?.name || '').localeCompare(String(b.lab?.name || ''));
      })[0]?.lab;

    if (bestLab?.id) {
      setSelectedLab(bestLab.id);
      setSelectedProcedure(procedure);
    }
  }, [laboratories, procedure, selectedLab, selectedCompanyId, userCompanyId]);

  // Persist the last selected lab for this company+procedure.
  useEffect(() => {
    if (!selectedLab) return;
    if (!selectedProcedure) return;
    const companyForDefaults = selectedCompanyId || userCompanyId;
    if (!companyForDefaults) return;
    globalThis.localStorage.setItem(`ontime.defaultLab.${companyForDefaults}.${selectedProcedure}`, selectedLab);
  }, [selectedLab, selectedCompanyId, selectedProcedure, userCompanyId]);

  const handleLabChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLab(e.target.value);
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyClinicSelection(e.target.value);
  };

  const handleDoctorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    
    // Find the selected doctor and get their name
    const doctor = doctors.find((d: any) => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor.name);
    } else {
      setSelectedDoctor('');
    }
  };

  const handleTechnicianChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const technicianId = e.target.value;
    setSelectedTechnicianId(technicianId);
    
    // Find the selected technician and get their name
    const technician = technicians.find((t: any) => t.id === technicianId);
    if (technician) {
      setSelectedTechnician(technician.name);
    } else {
      setSelectedTechnician('');
    }
  };

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const formatBirthday = (birthday: any) => {
    if (!birthday) return 'N/A';
    try {
      // Handle different date formats
      const date = new Date(birthday);
      if (Number.isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate that clinic is selected (which provides companyId)
    if (!selectedCompanyId) {
      setError('Please select a clinic first');
      return;
    }

    if (!selectedLab) {
      setError('Please select a laboratory');
      return;
    }

    if (!selectedProcedure) {
      setError('Please select a procedure');
      return;
    }

    // Validate patient selection for existing patient
    if (patientType === 'existing' && !selectedPatient) {
      setError('Please select an existing patient');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const toothNumbersValue = formData.get('toothNumbers');
    const toothNumbers = toothNumbersValue && typeof toothNumbersValue === 'string'
      ? toothNumbersValue.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    // Get lab name from selected lab ID
    const selectedLabObj = laboratories.find((l: any) => l.id === selectedLab);
    const labName = selectedLabObj ? selectedLabObj.name : '';

    // Get patient information based on type
    let patientInfo: any = {};
    if (patientType === 'existing') {
      const patient = patients.find((p: any) => p.id === selectedPatient);
      if (patient) {
        patientInfo = {
          patientId: patient.id,
          patientFirstName: patient.firstName,
          patientLastName: patient.lastName,
          birthday: patient.birthday,
        };
      }
    } else {
      patientInfo = {
        patientFirstName: patientFirstName,
        patientLastName: patientLastName,
        birthday: patientBirthday,
      };
    }

    createLabCase({
      variables: {
        input: {
          companyId: selectedCompanyId,
          labId: selectedLab,
          lab: labName,
          clinicId: selectedClinicId,
          clinic: selectedClinic,
          ...patientInfo,
          reservationDate: autoSchedule ? undefined : formatDate(date),
          doctorId: selectedDoctorId,
          doctor: selectedDoctor,
          procedure: selectedProcedure,
          category: selectedProcedure,
          priority: formData.get('priority') || 'normal',
          shadeGuide: formData.get('shadeGuide') || undefined,
          materialType: formData.get('materialType') || undefined,
          notes: formData.get('notes') || undefined,
          toothNumbers: toothNumbers.length > 0 ? toothNumbers : undefined,
          estimatedCompletion: formData.get('estimatedCompletion') || undefined,
          technicianId: selectedTechnicianId || undefined,
          technician: selectedTechnician || undefined,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900/95 backdrop-blur-xl px-6 sm:px-8 py-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-white">{t('Create Laboratory Case')}</h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              {autoSchedule ? t('Auto-scheduled based on availability') : date.toLocaleDateString()} - {procedure || t('New case')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {/* Patient Type Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Patient')}</h3>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="patientType"
                  value="new"
                  checked={patientType === 'new'}
                  onChange={() => setPatientType('new')}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">{t('New Patient')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="patientType"
                  value="existing"
                  checked={patientType === 'existing'}
                  onChange={() => setPatientType('existing')}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">{t('Existing Patient')}</span>
              </label>
            </div>
          </div>

          {/* Clinic Selection - Moved here so it comes before patient search */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Clinic')}</h3>
            <label className="block">
              <span className="text-sm font-medium text-slate-300">{t('Clinic')} *</span>
              <select
                name="clinic"
                required
                value={selectedClinicId}
                onChange={handleClinicChange}
                disabled={clinicsLoading}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{clinicsLoading ? t('Loading clinics...') : t('Select a clinic')}</option>
                {visibleClinics.map((clinic: any) => (
                  <option key={clinic.clinicId} value={clinic.clinicId}>
                    {clinic.name} ({clinic.companyName})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Patient Information')}</h3>
            
            {patientType === 'existing' ? (
              <div className="space-y-4">
                {/* Patient Search */}
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('Search Patient')} *</span>
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder={t('Search by name, email, or phone...')}
                    disabled={!selectedCompanyId}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {!selectedCompanyId && (
                    <p className="mt-1 text-xs text-slate-500">{t('Please select a clinic first')}</p>
                  )}
                </label>

                {/* Patient Selection */}
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('Select Patient')} *</span>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    required
                    disabled={!selectedCompanyId || patientsLoading}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!selectedCompanyId 
                        ? t('Select clinic first')
                        : patientsLoading 
                        ? t('Loading patients...') 
                        : patients.length === 0 
                        ? t('No patients found') 
                        : t('Select a patient')}
                    </option>
                    {patients.map((patient: any) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} - {formatBirthday(patient.birthday)}
                        {patient.email && ` - ${patient.email}`}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Show selected patient details */}
                {selectedPatient && patients.find((p: any) => p.id === selectedPatient) && (
                  <div className="rounded-xl border border-primary-400/30 bg-primary-500/5 p-4">
                    <h4 className="text-sm font-semibold text-primary-300 mb-2">{t('Patient Details')}</h4>
                    {(() => {
                      const patient = patients.find((p: any) => p.id === selectedPatient);
                      return (
                        <div className="space-y-1 text-sm text-slate-300">
                          <p><span className="text-slate-500">{t('Name')}:</span> {patient.firstName} {patient.lastName}</p>
                          <p><span className="text-slate-500">{t('Birthday')}:</span> {formatBirthday(patient.birthday)}</p>
                          {patient.email && <p><span className="text-slate-500">{t('Email')}:</span> {patient.email}</p>}
                          {patient.phone && <p><span className="text-slate-500">{t('Phone')}:</span> {patient.phone}</p>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('First Name')} *</span>
                  <input
                    type="text"
                    name="patientFirstName"
                    value={patientFirstName}
                    onChange={(e) => setPatientFirstName(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                    placeholder="John"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('Last Name')} *</span>
                  <input
                    type="text"
                    name="patientLastName"
                    value={patientLastName}
                    onChange={(e) => setPatientLastName(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                    placeholder="Doe"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-300">{t('Birthday')} *</span>
                  <input
                    type="date"
                    name="birthday"
                    value={patientBirthday}
                    onChange={(e) => setPatientBirthday(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Case Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Case Details')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Lab - First */}
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Lab')} *</span>
                <select
                  name="lab"
                  required
                  value={selectedLab}
                  onChange={handleLabChange}
                  disabled={labsLoading}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{labsLoading ? t('Loading...') : t('Select a laboratory')}</option>
                  {laboratories.map((lab: any) => (
                    <option key={lab.id} value={lab.id}>{lab.name}</option>
                  ))}
                </select>
              </label>

              {/* Category/Procedure - Disabled until lab is selected */}
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Procedure/Category')} *</span>
                <select
                  name="category"
                  required
                  value={selectedProcedure}
                  onChange={(e) => setSelectedProcedure(e.target.value)}
                  disabled={!selectedLab || availableProcedures.length === 0}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedLab 
                      ? t('Select a lab first') 
                      : availableProcedures.length === 0 
                      ? t('No procedures configured') 
                      : t('Select a procedure')}
                  </option>
                  {availableProcedures.map((proc) => (
                    <option key={proc} value={proc}>{proc}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Priority')}</span>
                <select
                  name="priority"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="rush">Rush</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Doctor')} *</span>
                <select
                  name="doctor"
                  required
                  value={selectedDoctorId}
                  onChange={handleDoctorChange}
                  disabled={!selectedClinicId || usersLoading}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedClinicId 
                      ? t('Select a clinic first') 
                      : usersLoading 
                      ? t('Loading doctors...') 
                      : doctors.length === 0 
                      ? t('No doctors found') 
                      : t('Select a doctor')}
                  </option>
                  {doctors.map((doctor: any) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Technical Specifications')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Shade Guide')}</span>
                <input
                  type="text"
                  name="shadeGuide"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                  placeholder="A2, B1, etc."
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Material Type')}</span>
                <input
                  type="text"
                  name="materialType"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                  placeholder="Zirconia, E-max, etc."
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Tooth Numbers')}</span>
                <input
                  type="text"
                  name="toothNumbers"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                  placeholder="8, 9, 10"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Estimated Completion')}</span>
                <input
                  type="date"
                  name="estimatedCompletion"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                />
              </label>
              <label className="block lg:col-span-2">
                <span className="text-sm font-medium text-slate-300">{t('Technician')}</span>
                <select
                  name="technician"
                  value={selectedTechnicianId}
                  onChange={handleTechnicianChange}
                  disabled={techLoading}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {techLoading 
                      ? t('Loading technicians...') 
                      : technicians.length === 0 
                      ? t('No technicians found') 
                      : t('Select a technician (optional)')}
                  </option>
                  {technicians.map((tech: any) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Notes')}</h3>
            <label className="block">
              <span className="sr-only">{t('Notes')}</span>
              <textarea
                name="notes"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none resize-none"
                placeholder="Special instructions or notes..."
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-white/10 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-primary-400 disabled:opacity-50"
            >
              {loading ? t('Creating...') : t('Create Case')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
