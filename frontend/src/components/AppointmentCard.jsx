import { Link } from 'react-router-dom';
import { MessageSquare, Video, CalendarDays, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  UPCOMING: { label: 'Upcoming', classes: 'bg-blue-50 text-blue-600' },
  COMPLETED: { label: 'Completed', classes: 'bg-green-50 text-green-600' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-50 text-red-500' },
};

function formatDateTime(dateTime) {
  if (!dateTime) return { date: '—', time: '' };
  const d = new Date(dateTime);
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
  };
}

export default function AppointmentCard({ appointment = {} }) {
  const { user } = useAuth();
  const isPatient = user?.role === 'PATIENT';

  const {
    id,
    doctorName,
    patientName,
    specialty,
    dateTime,
    status = 'UPCOMING',
    type,
  } = appointment;

  const displayName = isPatient ? doctorName : patientName;
  const { date, time } = formatDateTime(dateTime);
  const { label: statusLabel, classes: statusClasses } =
    statusConfig[status] ?? statusConfig.UPCOMING;

  return (
    <div className="card flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {isPatient ? `Dr. ${displayName ?? '—'}` : (displayName ?? '—')}
            </p>
            {specialty && (
              <p className="text-sm text-primary font-medium">{specialty}</p>
            )}
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusClasses}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Date / time / type row */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
          {date}
          {time && <span className="text-gray-400">· {time}</span>}
        </span>
        {type && (
          <span className="capitalize bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full self-center">
            {type.toLowerCase()}
          </span>
        )}
      </div>

      {/* Action buttons — only for non-cancelled appointments */}
      {status !== 'CANCELLED' && id && (
        <div className="flex gap-3 border-t border-gray-100 pt-3">
          <Link
            to={`/chat/${id}`}
            className="btn-outline flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Chat
          </Link>
          <Link
            to={`/video/${id}`}
            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
          >
            <Video className="w-4 h-4" aria-hidden="true" />
            Video Call
          </Link>
        </div>
      )}
    </div>
  );
}
