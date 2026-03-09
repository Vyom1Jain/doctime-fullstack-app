import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  CalendarDays,
  Pill,
  Search,
  FileText,
  CreditCard,
  Heart,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import AppointmentCard from '../../components/AppointmentCard';

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-7 bg-gray-200 rounded w-10" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-24 mt-2" />
    </div>
  );
}

function AppointmentSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-36" />
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-44" />
        </div>
        <div className="h-6 bg-gray-200 rounded-full w-20 shrink-0" />
      </div>
    </div>
  );
}

// ─── Quick action config ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: 'Find Doctor',
    icon: Search,
    path: '/patient/find-doctor',
    bg: 'bg-blue-50',
    fg: 'text-blue-600',
  },
  {
    label: 'View Reports',
    icon: FileText,
    path: '/patient/reports',
    bg: 'bg-purple-50',
    fg: 'text-purple-600',
  },
  {
    label: 'Billing & Payments',
    icon: CreditCard,
    path: '/patient/billing',
    bg: 'bg-amber-50',
    fg: 'text-amber-600',
  },
  {
    label: 'Donate',
    icon: Heart,
    path: '/patient/donations',
    bg: 'bg-rose-50',
    fg: 'text-rose-600',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptRes, rxRes] = await Promise.allSettled([
        axios.get('/api/appointments', { params: { status: 'UPCOMING' } }),
        axios.get('/api/prescriptions'),
      ]);

      if (apptRes.status === 'fulfilled') {
        setAppointments(apptRes.value.data?.slice(0, 3) ?? []);
      }
      if (rxRes.status === 'fulfilled') {
        const data = rxRes.value.data;
        setPrescriptionCount(Array.isArray(data) ? data.length : 0);
      }
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const upcomingCount = appointments.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Welcome header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('dashboard.welcome')}, {user?.name ?? 'Patient'}! 👋
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Here's a summary of your health activity.
              </p>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                <>
                  <StatSkeleton />
                  <StatSkeleton />
                </>
              ) : (
                <>
                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5 text-primary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Upcoming
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{upcomingCount}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t('dashboard.appointments')}</p>
                  </div>

                  <div className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0">
                        <Pill className="w-5 h-5 text-secondary" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                          Recent
                        </p>
                        <p className="text-2xl font-bold text-gray-900">{prescriptionCount}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{t('dashboard.prescriptions')}</p>
                  </div>
                </>
              )}
            </div>

            {/* ── Quick Actions ── */}
            <section aria-labelledby="quick-actions-heading">
              <h2 id="quick-actions-heading" className="text-lg font-semibold text-gray-800 mb-3">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map(({ label, icon: Icon, path, bg, fg }) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="card flex flex-col items-center gap-3 py-5 cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                    aria-label={label}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
                      <Icon className={`w-6 h-6 ${fg}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Upcoming Appointments ── */}
            <section aria-labelledby="upcoming-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="upcoming-heading" className="text-lg font-semibold text-gray-800">
                  Upcoming Appointments
                </h2>
                <button
                  onClick={() => navigate('/appointments')}
                  className="flex items-center gap-0.5 text-sm text-primary hover:text-primary-700 font-medium transition-colors"
                >
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <AppointmentSkeleton />
                  <AppointmentSkeleton />
                </div>
              ) : error ? (
                <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={fetchDashboardData}
                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : appointments.length === 0 ? (
                <div className="card text-center py-12">
                  <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-gray-600 font-medium">No upcoming appointments</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Book your first appointment to get started
                  </p>
                  <button
                    onClick={() => navigate('/patient/find-doctor')}
                    className="btn-primary mt-5 text-sm py-2.5 px-5"
                  >
                    {t('appointments.find')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              )}
            </section>

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
