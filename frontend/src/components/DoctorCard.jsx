import { Star, Briefcase, DollarSign, CheckCircle, XCircle } from 'lucide-react';

export default function DoctorCard({ doctor = {}, onBook }) {
  const {
    name = 'Unknown Doctor',
    specialty = '',
    rating = 0,
    experience = 0,
    consultationFee = 0,
    available = false,
    profilePicture,
  } = doctor;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        {profilePicture ? (
          <img
            src={profilePicture}
            alt={`Dr. ${name}`}
            className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-primary-100"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-50 border-2 border-primary-100 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">Dr. {name}</h3>
          {specialty && (
            <p className="text-sm text-primary font-medium">{specialty}</p>
          )}

          {/* Availability badge */}
          <span
            className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
              available
                ? 'bg-green-50 text-green-600'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {available ? (
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
            ) : (
              <XCircle className="w-3 h-3" aria-hidden="true" />
            )}
            {available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
        <div>
          <div className="flex items-center justify-center gap-0.5 text-yellow-400">
            <Star className="w-4 h-4 fill-current" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">
              {rating > 0 ? rating.toFixed(1) : '—'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Rating</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-0.5">
            <Briefcase className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">{experience}y</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Experience</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-0.5">
            <DollarSign className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800">
              {consultationFee > 0 ? `$${consultationFee}` : 'Free'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Fee</p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onBook?.(doctor)}
        disabled={!available}
        aria-disabled={!available}
        className={`btn-primary w-full mt-1 ${!available ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        Book Appointment
      </button>
    </div>
  );
}
