import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  X,
  Calendar,
  Clock,
  Video,
  Building2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import DoctorCard from '../../components/DoctorCard';

// ─── Constants ────────────────────────────────────────────────────────────────
const SPECIALTIES = [
  'All',
  'General',
  'Cardiologist',
  'Dermatologist',
  'Orthopedic',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
];

const PAGE_SIZE = 9;

// Generate 9 AM–5 PM slots in 30-min increments
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const totalMinutes = 9 * 60 + i * 30;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${suffix}`;
});

// Minimum selectable date: today
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DoctorSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-4 bg-gray-200 rounded w-10" />
            <div className="h-3 bg-gray-200 rounded w-12" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-lg mt-4" />
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm transition-all ${
        isSuccess ? 'bg-secondary' : 'bg-red-500'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {toast.message}
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ doctor, onClose, onSuccess }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('VIDEO');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!date) errs.date = 'Please select a date.';
    if (!time) errs.time = 'Please select a time slot.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await axios.post('/api/appointments', {
        doctorId: doctor.id,
        date,
        time,
        type,
      });
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Booking failed. Please try again.';
      setFieldErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="booking-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 id="booking-modal-title" className="text-lg font-bold text-gray-900">
              Book Appointment
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              with Dr. {doctor.name}
              {doctor.specialty && (
                <span className="text-primary font-medium"> · {doctor.specialty}</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Date */}
          <div>
            <label htmlFor="booking-date" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
                Date
              </span>
            </label>
            <input
              id="booking-date"
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className={`input-field ${fieldErrors.date ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {fieldErrors.date && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.date}</p>
            )}
          </div>

          {/* Time */}
          <div>
            <label htmlFor="booking-time" className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
                Time Slot
              </span>
            </label>
            <select
              id="booking-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`input-field ${fieldErrors.time ? 'border-red-400 focus:ring-red-400' : ''}`}
            >
              <option value="">Select a time</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {fieldErrors.time && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.time}</p>
            )}
          </div>

          {/* Appointment Type */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Appointment Type</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'VIDEO', label: 'Video Call', Icon: Video },
                { value: 'IN_PERSON', label: 'In Person', Icon: Building2 },
              ].map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                    type === value
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                  aria-pressed={type === value}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Fee info */}
          {doctor.consultationFee > 0 && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600">Consultation Fee</span>
              <span className="font-semibold text-gray-900">${doctor.consultationFee}</span>
            </div>
          )}

          {/* Submit error */}
          {fieldErrors.submit && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-600">{fieldErrors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Booking…' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FindDoctor() {
  const { t } = useTranslation();

  // Filter state
  const [nameQuery, setNameQuery] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Data state
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Booking
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Fetch doctors whenever filters/page change (debounced for name)
  const fetchDoctors = useCallback(async (currentPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: currentPage - 1, size: PAGE_SIZE };
      if (nameQuery.trim()) params.name = nameQuery.trim();
      if (specialty !== 'All') params.specialty = specialty;
      if (availableOnly) params.available = true;

      const res = await axios.get('/api/doctors', { params });
      const data = res.data;

      // Handle both paginated and array responses
      if (Array.isArray(data)) {
        setDoctors(data);
        setTotalPages(1);
      } else {
        setDoctors(data.content ?? []);
        setTotalPages(data.totalPages ?? 1);
      }
    } catch {
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [nameQuery, specialty, availableOnly]);

  // Debounce name search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchDoctors(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [nameQuery, specialty, availableOnly, fetchDoctors]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchDoctors(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = () => {
    setSelectedDoctor(null);
    showToast('Appointment booked successfully!', 'success');
  };

  const clearFilters = () => {
    setNameQuery('');
    setSpecialty('All');
    setAvailableOnly(false);
  };

  const hasActiveFilters = nameQuery || specialty !== 'All' || availableOnly;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto space-y-5">

            {/* ── Page header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('appointments.find')}
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Search and book appointments with top doctors.
              </p>
            </div>

            {/* ── Filters ── */}
            <div className="card !p-4 space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="Search by doctor name…"
                  className="input-field pl-10 pr-10 py-2.5"
                  aria-label="Search doctors by name"
                />
                {nameQuery && (
                  <button
                    onClick={() => setNameQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Specialty + availability row */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="input-field py-2 flex-1"
                    aria-label="Filter by specialty"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s === 'All' ? 'All Specialties' : s}</option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <div
                    role="switch"
                    aria-checked={availableOnly}
                    tabIndex={0}
                    onClick={() => setAvailableOnly((v) => !v)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setAvailableOnly((v) => !v);
                      }
                    }}
                    className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                      availableOnly ? 'bg-secondary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        availableOnly ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Available only</span>
                </label>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-gray-500 hover:text-primary flex items-center gap-1 shrink-0"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* ── Results count ── */}
            {!loading && !error && (
              <p className="text-sm text-gray-500">
                {doctors.length === 0
                  ? 'No doctors found'
                  : `Showing ${doctors.length} doctor${doctors.length !== 1 ? 's' : ''}`}
                {hasActiveFilters && ' matching your filters'}
              </p>
            )}

            {/* ── Error ── */}
            {error && (
              <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-600 flex-1">{error}</p>
                <button
                  onClick={() => fetchDoctors(page)}
                  className="text-xs font-medium text-red-600 hover:text-red-700 underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Doctor Grid ── */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <DoctorSkeleton key={i} />
                ))}
              </div>
            ) : !error && doctors.length === 0 ? (
              <div className="card text-center py-16">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" aria-hidden="true" />
                <p className="text-gray-600 font-semibold text-lg">No doctors found</p>
                <p className="text-gray-400 text-sm mt-1">
                  Try adjusting your search or filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="btn-outline mt-5 text-sm py-2 px-5"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onBook={setSelectedDoctor}
                  />
                ))}
              </div>
            )}

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    aria-current={p === page ? 'page' : undefined}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </nav>
            )}

          </div>
        </main>
      </div>

      <BottomNav />

      {/* Booking Modal */}
      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
