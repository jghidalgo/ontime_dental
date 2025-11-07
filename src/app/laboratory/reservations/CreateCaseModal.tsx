'use client';

import { useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_LAB_CASE } from '@/graphql/lab-mutations';
import { useTranslations } from '@/lib/i18n';

type CreateCaseModalProps = {
  procedure: string;
  date: Date;
  onClose: () => void;
  onSuccess: () => void;
};

const doctorOptions = [
  'Dr. Alexis Stone',
  'Dr. Maya Jensen',
  'Dr. Luis Carmona',
  'Dr. Javier Molina'
];

const clinicOptions = [
  'Miller Dental - Coral Gables',
  'Bayfront Smiles',
  'Sunset Orthodontics'
];

const labOptions = [
  'Complete Lab',
  'Miami Central Lab',
  'Precision Dental Lab'
];

const categoryOptions = [
  'Crowns & Bridges',
  'Implant Restorations',
  'Dentures',
  'Aligners & Ortho',
  'Other'
];

export default function CreateCaseModal({ procedure, date, onClose, onSuccess }: CreateCaseModalProps) {
  const { t } = useTranslations();
  const [patientType, setPatientType] = useState<'existing' | 'new'>('new');
  const [error, setError] = useState<string | null>(null);

  const [createLabCase, { loading }] = useMutation(CREATE_LAB_CASE, {
    onCompleted: () => {
      onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const toothNumbersValue = formData.get('toothNumbers');
    const toothNumbers = toothNumbersValue && typeof toothNumbersValue === 'string'
      ? toothNumbersValue.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    createLabCase({
      variables: {
        input: {
          lab: formData.get('lab'),
          clinic: formData.get('clinic'),
          patientFirstName: formData.get('patientFirstName'),
          patientLastName: formData.get('patientLastName'),
          birthday: formData.get('birthday'),
          reservationDate: formatDate(date),
          doctor: formData.get('doctor'),
          procedure: formData.get('procedure'),
          category: formData.get('category'),
          priority: formData.get('priority') || 'normal',
          shadeGuide: formData.get('shadeGuide') || undefined,
          materialType: formData.get('materialType') || undefined,
          notes: formData.get('notes') || undefined,
          toothNumbers: toothNumbers.length > 0 ? toothNumbers : undefined,
          estimatedCompletion: formData.get('estimatedCompletion') || undefined,
          technician: formData.get('technician') || undefined,
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
              {date.toLocaleDateString()} - {procedure || t('New case')}
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

          {/* Patient Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Patient Information')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('First Name')} *</span>
                <input
                  type="text"
                  name="patientFirstName"
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
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                />
              </label>
            </div>
          </div>

          {/* Case Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Case Details')}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Procedure')} *</span>
                <input
                  type="text"
                  name="procedure"
                  required
                  defaultValue={procedure}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                  placeholder="Crown - Anterior"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Category')} *</span>
                <select
                  name="category"
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
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
                <span className="text-sm font-medium text-slate-300">{t('Lab')} *</span>
                <select
                  name="lab"
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                >
                  {labOptions.map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Clinic')} *</span>
                <select
                  name="clinic"
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                >
                  {clinicOptions.map((clinic) => (
                    <option key={clinic} value={clinic}>{clinic}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-300">{t('Doctor')} *</span>
                <select
                  name="doctor"
                  required
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:border-primary-400/70 focus:outline-none"
                >
                  {doctorOptions.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
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
                <input
                  type="text"
                  name="technician"
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-primary-400/70 focus:outline-none"
                  placeholder="Technician name"
                />
              </label>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-200">{t('Notes')}</h3>
            <label className="block">
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
