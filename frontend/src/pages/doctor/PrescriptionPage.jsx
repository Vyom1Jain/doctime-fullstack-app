import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Printer,
  Send,
  AlertCircle,
  ChevronLeft,
  User,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Default medication shape ─────────────────────────────────────────────────
const DEFAULT_MEDICATION = {
  name: '',
  dosage: '',
  frequency: '',
  duration: '',
  instructions: '',
};

// ─── Reusable form field wrapper ──────────────────────────────────────────────
function FormField({ label, error, children, required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}{' '}
        {required && <span className="text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
          {error.message}
        </p>
      )}
    </div>
  );
}

// ─── Read-only prescription preview ──────────────────────────────────────────
function PrescriptionPreview({ data, appointment, doctor }) {
  return (
    <div
      id="prescription-preview"
      className="bg-white rounded-xl shadow-sm p-6 sm:p-8 space-y-6 print:shadow-none print:p-0"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 pb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-primary">Doctime Health</h2>
          <p className="text-sm text-gray-500 mt-0.5">Digital Prescription</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p className="font-semibold text-gray-800">Dr. {doctor?.name ?? '—'}</p>
          <p>{doctor?.specialty ?? 'General Practitioner'}</p>
          <p className="mt-1">
            {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Patient info */}
      <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Patient</p>
          <p className="font-semibold text-gray-900 mt-0.5">
            {appointment?.patientName ?? '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Appointment</p>
          <p className="font-semibold text-gray-900 mt-0.5">#{appointment?.id ?? '—'}</p>
        </div>
      </div>

      {/* Diagnosis */}
      {data.diagnosis && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Diagnosis
          </h3>
          <p className="text-gray-800 leading-relaxed">{data.diagnosis}</p>
        </div>
      )}

      {/* Medications table */}
      {data.medications?.filter((m) => m.name).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Medications
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  {['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions'].map(
                    (h) => (
                      <th key={h} className="text-left p-2 border border-gray-200">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {data.medications
                  .filter((m) => m.name)
                  .map((med, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="p-2 font-medium text-gray-900 border border-gray-200">
                        {med.name}
                      </td>
                      <td className="p-2 text-gray-600 border border-gray-200">{med.dosage}</td>
                      <td className="p-2 text-gray-600 border border-gray-200">
                        {med.frequency}
                      </td>
                      <td className="p-2 text-gray-600 border border-gray-200">{med.duration}</td>
                      <td className="p-2 text-gray-400 border border-gray-200">
                        {med.instructions || '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lab tests */}
      {data.labTests && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Lab Tests Ordered
          </h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{data.labTests}</p>
        </div>
      )}

      {/* Follow-up */}
      {data.followUpDate && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Follow-up Date
          </h3>
          <p className="text-gray-800">
            {new Date(data.followUpDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
      )}

      {/* Doctor's notes */}
      {data.notes && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
            Doctor's Notes
          </h3>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">{data.notes}</p>
        </div>
      )}

      {/* Digital signature */}
      <div className="border-t border-gray-200 pt-4 flex justify-end">
        <div className="text-center text-sm text-gray-500">
          <div className="w-32 border-t-2 border-gray-400 mb-1" />
          <p className="font-medium text-gray-700">Dr. {doctor?.name ?? '—'}</p>
          <p>Digital Signature</p>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrescriptionPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loadingAppt, setLoadingAppt] = useState(!!appointmentId);
  const [apptError, setApptError] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      diagnosis: '',
      medications: [{ ...DEFAULT_MEDICATION }],
      labTests: '',
      followUpDate: '',
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'medications' });
  const formValues = watch();

  useEffect(() => {
    if (!appointmentId) return;
    let cancelled = false;
    const fetchAppointment = async () => {
      setLoadingAppt(true);
      setApptError(null);
      try {
        const res = await axios.get(`/api/appointments/${appointmentId}`);
        if (!cancelled) setAppointment(res.data);
      } catch {
        if (!cancelled) setApptError('Could not load appointment details.');
      } finally {
        if (!cancelled) setLoadingAppt(false);
      }
    };
    fetchAppointment();
    return () => { cancelled = true; };
  }, [appointmentId]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await axios.post('/api/prescriptions', {
        ...data,
        appointmentId,
        patientName: appointment?.patientName,
      });
      setSubmitted(true);
    } catch {
      setSubmitError('Failed to submit prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8 flex items-center justify-center">
            <div className="card text-center py-14 max-w-sm w-full mx-auto">
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" aria-hidden="true" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Prescription Submitted!</h2>
              <p className="text-gray-500 text-sm mb-6">
                The prescription has been saved and sent to the patient.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/doctor/patients')}
                  className="btn-outline py-2 px-4 text-sm"
                >
                  My Patients
                </button>
                <button
                  onClick={() => navigate('/doctor/dashboard')}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Page header ── */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Write Prescription</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {appointmentId ? `Appointment #${appointmentId}` : 'New Prescription'}
                </p>
              </div>
            </div>

            {/* ── Appointment info banner ── */}
            {loadingAppt ? (
              <div className="card animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-28" />
                </div>
              </div>
            ) : apptError ? (
              <div className="card flex items-center gap-3 border border-amber-100 bg-amber-50">
                <AlertCircle
                  className="w-5 h-5 text-amber-500 shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm text-amber-700">{apptError}</p>
              </div>
            ) : appointment ? (
              <div className="card flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {appointment.patientName ?? 'Patient'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {appointment.dateTime
                      ? new Date(appointment.dateTime).toLocaleDateString(undefined, {
                          dateStyle: 'medium',
                        })
                      : '—'}
                    {appointment.type ? ` · ${appointment.type}` : ''}
                  </p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full shrink-0">
                  {appointment.status ?? 'UPCOMING'}
                </span>
              </div>
            ) : null}

            {/* ── Preview / Print controls ── */}
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setPreviewMode((v) => !v)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary font-medium transition-colors"
              >
                {previewMode ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
                {previewMode ? 'Edit Form' : 'Preview'}
              </button>
              {previewMode && (
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  <Printer className="w-4 h-4" aria-hidden="true" />
                  Print / Download
                </button>
              )}
            </div>

            {/* ── Preview mode ── */}
            {previewMode ? (
              <PrescriptionPreview
                data={formValues}
                appointment={appointment}
                doctor={user}
              />
            ) : (
              /* ── Form ── */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                {/* Diagnosis */}
                <div className="card space-y-4">
                  <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" aria-hidden="true" />
                    Diagnosis
                  </h2>
                  <FormField label="Diagnosis" error={errors.diagnosis} required>
                    <textarea
                      {...register('diagnosis', { required: 'Diagnosis is required' })}
                      rows={3}
                      placeholder="Enter diagnosis or chief complaint…"
                      className={`input-field resize-none ${
                        errors.diagnosis ? 'border-red-400 focus:ring-red-400' : ''
                      }`}
                      aria-required="true"
                    />
                  </FormField>
                </div>

                {/* Medications */}
                <div className="card space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-primary" aria-hidden="true" />
                      Medications
                    </h2>
                    <button
                      type="button"
                      onClick={() => append({ ...DEFAULT_MEDICATION })}
                      className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-600 font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Add Medication
                    </button>
                  </div>

                  {fields.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No medications added. Click "Add Medication" to begin.
                    </p>
                  )}

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Medication {index + 1}
                        </span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            aria-label={`Remove medication ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField
                          label="Medicine Name"
                          error={errors.medications?.[index]?.name}
                          required
                        >
                          <input
                            {...register(`medications.${index}.name`, {
                              required: 'Medicine name is required',
                            })}
                            type="text"
                            placeholder="e.g. Amoxicillin"
                            className={`input-field ${
                              errors.medications?.[index]?.name
                                ? 'border-red-400 focus:ring-red-400'
                                : ''
                            }`}
                          />
                        </FormField>

                        <FormField
                          label="Dosage"
                          error={errors.medications?.[index]?.dosage}
                          required
                        >
                          <input
                            {...register(`medications.${index}.dosage`, {
                              required: 'Dosage is required',
                            })}
                            type="text"
                            placeholder="e.g. 500mg"
                            className={`input-field ${
                              errors.medications?.[index]?.dosage
                                ? 'border-red-400 focus:ring-red-400'
                                : ''
                            }`}
                          />
                        </FormField>

                        <FormField
                          label="Frequency"
                          error={errors.medications?.[index]?.frequency}
                          required
                        >
                          <input
                            {...register(`medications.${index}.frequency`, {
                              required: 'Frequency is required',
                            })}
                            type="text"
                            placeholder="e.g. Twice daily"
                            className={`input-field ${
                              errors.medications?.[index]?.frequency
                                ? 'border-red-400 focus:ring-red-400'
                                : ''
                            }`}
                          />
                        </FormField>

                        <FormField
                          label="Duration"
                          error={errors.medications?.[index]?.duration}
                          required
                        >
                          <input
                            {...register(`medications.${index}.duration`, {
                              required: 'Duration is required',
                            })}
                            type="text"
                            placeholder="e.g. 7 days"
                            className={`input-field ${
                              errors.medications?.[index]?.duration
                                ? 'border-red-400 focus:ring-red-400'
                                : ''
                            }`}
                          />
                        </FormField>
                      </div>

                      <FormField label="Instructions (optional)">
                        <input
                          {...register(`medications.${index}.instructions`)}
                          type="text"
                          placeholder="e.g. Take after meals"
                          className="input-field"
                        />
                      </FormField>
                    </div>
                  ))}
                </div>

                {/* Lab tests */}
                <div className="card space-y-4">
                  <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-primary" aria-hidden="true" />
                    Lab Tests Ordered
                  </h2>
                  <FormField label="Lab Tests (optional)">
                    <textarea
                      {...register('labTests')}
                      rows={3}
                      placeholder="e.g. Complete Blood Count (CBC), Fasting Blood Glucose…"
                      className="input-field resize-none"
                    />
                  </FormField>
                </div>

                {/* Follow-up & Notes */}
                <div className="card space-y-4">
                  <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" aria-hidden="true" />
                    Additional Details
                  </h2>
                  <FormField label="Follow-up Date (optional)">
                    <input
                      {...register('followUpDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="input-field"
                    />
                  </FormField>
                  <FormField label="Doctor's Notes (optional)">
                    <textarea
                      {...register('notes')}
                      rows={4}
                      placeholder="Additional instructions, lifestyle advice, or notes for the patient…"
                      className="input-field resize-none"
                    />
                  </FormField>
                </div>

                {/* Submit error */}
                {submitError && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                    <p className="text-sm text-red-600">{submitError}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                    Preview
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" aria-hidden="true" />
                        Submit Prescription
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
