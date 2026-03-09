import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  Search,
  Users,
  X,
  AlertCircle,
  UserCircle,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Skeletons ────────────────────────────────────────────────────────────────
function PatientCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-16 shrink-0" />
      </div>
    </div>
  );
}

// ─── Patient expanded details ─────────────────────────────────────────────────
function PatientDetails({ patient }) {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [apptRes, rxRes] = await Promise.allSettled([
          axios.get('/api/appointments', { params: { patientId: patient.id } }),
          axios.get('/api/prescriptions', { params: { patientId: patient.id } }),
        ]);
        if (cancelled) return;
        if (apptRes.status === 'fulfilled') {
          setAppointments(Array.isArray(apptRes.value.data) ? apptRes.value.data : []);
        }
        if (rxRes.status === 'fulfilled') {
          setPrescriptions(Array.isArray(rxRes.value.data) ? rxRes.value.data : []);
        }
      } catch {
        // details are supplementary — fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [patient.id]);

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-48" />
        <div className="h-3 bg-gray-200 rounded w-40" />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
      {/* Appointment history */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          Appointment History
          <span className="ml-auto bg-primary-50 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </h4>
        {appointments.length === 0 ? (
          <p className="text-xs text-gray-400">No appointments found.</p>
        ) : (
          <ul className="space-y-1.5">
            {appointments.slice(0, 5).map((apt) => (
              <li key={apt.id} className="flex items-center gap-2 text-xs text-gray-600">
                <Clock className="w-3 h-3 text-gray-300 shrink-0" aria-hidden="true" />
                <span className="truncate">{apt.type ?? 'Consultation'}</span>
                <span className="ml-auto text-gray-400 shrink-0">
                  {apt.dateTime
                    ? new Date(apt.dateTime).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                    apt.status === 'COMPLETED'
                      ? 'bg-green-50 text-green-600'
                      : apt.status === 'CANCELLED'
                      ? 'bg-red-50 text-red-500'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {apt.status ?? 'UPCOMING'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Prescriptions */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" aria-hidden="true" />
          Prescriptions Issued
          <span className="ml-auto bg-secondary-50 text-secondary text-xs font-semibold px-2 py-0.5 rounded-full">
            {prescriptions.length}
          </span>
        </h4>
        {prescriptions.length === 0 ? (
          <p className="text-xs text-gray-400">No prescriptions issued.</p>
        ) : (
          <ul className="space-y-1.5">
            {prescriptions.slice(0, 3).map((rx) => (
              <li key={rx.id} className="flex items-center gap-2 text-xs text-gray-600">
                <span className="truncate flex-1">{rx.diagnosis ?? 'Prescription'}</span>
                <span className="text-gray-400 shrink-0">
                  {rx.createdAt
                    ? new Date(rx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Patient card ─────────────────────────────────────────────────────────────
function PatientCard({ patient }) {
  const [expanded, setExpanded] = useState(false);

  const initials = (patient.name ?? 'P')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const subtitle = [
    patient.age ? `Age ${patient.age}` : null,
    patient.condition ?? patient.specialty,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="card">
      <button
        className="w-full flex items-center gap-3 text-left focus:outline-none"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} details for ${patient.name ?? 'patient'}`}
      >
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{patient.name ?? 'Unknown'}</p>
          <p className="text-xs text-gray-500 truncate">{subtitle || 'General'}</p>
          {patient.lastVisit && (
            <p className="text-xs text-gray-400 mt-0.5">
              Last visit:{' '}
              {new Date(patient.lastVisit).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          {patient.appointmentCount != null && (
            <span className="text-xs font-semibold bg-primary-50 text-primary px-2 py-0.5 rounded-full">
              {patient.appointmentCount} visit{patient.appointmentCount !== 1 ? 's' : ''}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" aria-hidden="true" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
          )}
        </div>
      </button>

      {expanded && <PatientDetails patient={patient} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyPatientsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/doctor/patients');
      setPatients(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.condition ?? '').toLowerCase().includes(q) ||
        (p.specialty ?? '').toLowerCase().includes(q),
    );
  }, [patients, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {loading
                  ? 'Loading…'
                  : `${patients.length} patient${patients.length !== 1 ? 's' : ''} under your care`}
              </p>
            </div>

            {/* ── Search ── */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by name or condition…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-10"
                aria-label="Search patients"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* ── Content ── */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PatientCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchPatients}
                  className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-14">
                <Users className="w-14 h-14 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                <p className="text-gray-600 font-medium">
                  {searchQuery ? 'No patients match your search' : 'No patients yet'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchQuery
                    ? 'Try a different name or condition.'
                    : 'Your patients will appear here after their first appointment.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-outline mt-5 text-sm py-2 px-4"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
