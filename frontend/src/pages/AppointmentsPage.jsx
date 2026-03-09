import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarPlus, Calendar } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import AppointmentCard from '../components/AppointmentCard';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];
const STATUS_MAP = { All: '', Upcoming: 'UPCOMING', Completed: 'COMPLETED', Cancelled: 'CANCELLED' };

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  );
}

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ All: 0, Upcoming: 0, Completed: 0, Cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const status = STATUS_MAP[activeTab];
      const { data } = await axios.get('/api/appointments', {
        params: status ? { status } : {},
      });
      const sorted = [...(data || [])].sort(
        (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
      );
      setAppointments(sorted);
    } catch {
      setError(t('errors.loadFailed', 'Failed to load appointments.'));
    } finally {
      setLoading(false);
    }
  }, [activeTab, t]);

  useEffect(() => {
    fetchAppointments();
    TABS.forEach(async (tab) => {
      try {
        const status = STATUS_MAP[tab];
        const { data } = await axios.get('/api/appointments', { params: status ? { status } : {} });
        setCounts((prev) => ({ ...prev, [tab]: (data || []).length }));
      } catch { /* non-critical */ }
    });
  }, [fetchAppointments]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('appointments.title', 'Appointments')}</h1>
              <p className="text-sm text-gray-500 mt-1">{t('appointments.subtitle', 'Manage all your appointments')}</p>
            </div>
            {user?.role === 'PATIENT' && (
              <Button onClick={() => navigate('/patient/find-doctor')} className="flex items-center gap-2 whitespace-nowrap">
                <CalendarPlus className="w-4 h-4" />
                {t('appointments.bookNew', 'Book New Appointment')}
              </Button>
            )}
          </div>

          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t(`appointments.tabs.${tab.toLowerCase()}`, tab)}
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
              {error}
              <button onClick={fetchAppointments} className="ml-2 underline font-medium">{t('common.retry', 'Retry')}</button>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-14 h-14 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-600">{t('appointments.empty.title', 'No appointments found')}</p>
              <p className="text-sm text-gray-400 mt-1 mb-6">
                {t('appointments.empty.subtitle', `You have no ${activeTab.toLowerCase()} appointments.`)}
              </p>
              {user?.role === 'PATIENT' && (
                <Button onClick={() => navigate('/patient/find-doctor')}>{t('appointments.bookNew', 'Book New Appointment')}</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((appt) => <AppointmentCard key={appt.id} appointment={appt} />)}
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
