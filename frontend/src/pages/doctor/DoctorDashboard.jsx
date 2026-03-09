import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  CalendarDays,
  Users,
  DollarSign,
  Star,
  ChevronRight,
  AlertCircle,
  Clock,
  UserCircle,
  ClipboardList,
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
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-7 bg-gray-200 rounded w-12" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-28 mt-2" />
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

function PatientRowSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse py-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-14 shrink-0" />
    </div>
  );
}

// ─── Quick action config ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  {
    label: 'All Appointments',
    icon: CalendarDays,
    path: '/appointments',
    bg: 'bg-blue-50',
    fg: 'text-blue-600',
  },
  {
    label: 'Manage Patients',
    icon: Users,
    path: '/doctor/patients',
    bg: 'bg-emerald-50',
    fg: 'text-emerald-600',
  },
  {
    label: 'Prescriptions',
    icon: ClipboardList,
    path: '/doctor/prescription',
    bg: 'bg-purple-50',
    fg: 'text-purple-600',
  },
  {
    label: 'View Earnings',
    icon: DollarSign,
    path: '/doctor/earnings',
    bg: 'bg-amber-50',
    fg: 'text-amber-600',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayCount: 0,
    totalPatients: 0,
    monthEarnings: 0,
    pendingReviews: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apptRes, patientsRes, earningsRes] = await Promise.allSettled([
        axios.get('/api/appointments', { params: { date: 'today', status: 'UPCOMING' } }),
        axios.get('/api/doctor/patients'),
        axios.get('/api/doctor/earnings'),
      ]);

      if (apptRes.status === 'fulfilled') {
        const data = Array.isArray(apptRes.value.data) ? apptRes.value.data : [];
        setTodayAppointments(data);
        setStats((prev) => ({ ...prev, todayCount: data.length }));
      }

      if (patientsRes.status === 'fulfilled') {
        const data = Array.isArray(patientsRes.value.data) ? patientsRes.value.data : [];
        setRecentPatients(data.slice(0, 5));
        setStats((prev) => ({ ...prev, totalPatients: data.length }));
      }

      if (earningsRes.status === 'fulfilled') {
        const raw = earningsRes.value.data ?? {};
        const txns = Array.isArray(raw) ? raw : (raw.transactions ?? []);
        const now = new Date();
        const monthTotal = txns
          .filter((tx) => {
            const d = new Date(tx.date ?? tx.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          })
          .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
        const pending = txns.filter((tx) => tx.status === 'PENDING').length;
        setStats((prev) => ({ ...prev, monthEarnings: monthTotal, pendingReviews: pending }));
      }
    } catch {
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    {
      label: "Today's Appointments",
      value: stats.todayCount,
      icon: CalendarDays,
      bg: 'bg-blue-50',
      fg: 'text-blue-600',
      sub: 'Scheduled for today',
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      bg: 'bg-emerald-50',
      fg: 'text-emerald-600',
      sub: 'Under your care',
    },
    {
      label: 'Month Earnings',
      value: `$${stats.monthEarnings.toFixed(0)}`,
      icon: DollarSign,
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
      sub: 'This month',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      icon: Star,
      bg: 'bg-purple-50',
      fg: 'text-purple-600',
      sub: 'Awaiting payment',
    },
  ];

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
                Welcome back, Dr. {user?.name ?? 'Doctor'}! 👋
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Here's an overview of your practice today.
              </p>
            </div>

            {/* ── Stats grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                : statCards.map(({ label, value, icon: Icon, bg, fg, sub }) => (
                    <div key={label} className="card">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${fg}`} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
                            {label}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{sub}</p>
                    </div>
                  ))}
            </div>

            {/* ── Quick Actions ── */}
            <section aria-labelledby="quick-actions-heading">
              <h2
                id="quick-actions-heading"
                className="text-lg font-semibold text-gray-800 mb-3"
              >
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
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}
                    >
                      <Icon className={`w-6 h-6 ${fg}`} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* ── Today's Schedule ── */}
            <section aria-labelledby="schedule-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="schedule-heading" className="text-lg font-semibold text-gray-800">
                  Today's Schedule
                </h2>
                <button
                  onClick={() => navigate('/appointments')}
                  className="flex items-center gap-0.5 text-sm text-primary hover:text-primary-600 font-medium transition-colors"
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
                    onClick={fetchData}
                    className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 underline"
                  >
                    Retry
                  </button>
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="card text-center py-10">
                  <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-gray-600 font-medium">No appointments today</p>
                  <p className="text-gray-400 text-sm mt-1">Your schedule is clear for today.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              )}
            </section>

            {/* ── Recent Patients ── */}
            <section aria-labelledby="patients-heading">
              <div className="flex items-center justify-between mb-3">
                <h2 id="patients-heading" className="text-lg font-semibold text-gray-800">
                  Recent Patients
                </h2>
                <button
                  onClick={() => navigate('/doctor/patients')}
                  className="flex items-center gap-0.5 text-sm text-primary hover:text-primary-600 font-medium transition-colors"
                >
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="card">
                {loading ? (
                  <div className="divide-y divide-gray-100">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <PatientRowSkeleton key={i} />
                    ))}
                  </div>
                ) : recentPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCircle
                      className="w-10 h-10 text-gray-200 mx-auto mb-2"
                      aria-hidden="true"
                    />
                    <p className="text-gray-500 text-sm">No patients yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100" role="list">
                    {recentPatients.map((patient) => (
                      <li
                        key={patient.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-semibold text-primary">
                            {(patient.name ?? 'P').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {patient.name ?? 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {patient.condition ?? patient.specialty ?? 'General'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {patient.lastVisit
                            ? new Date(patient.lastVisit).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
