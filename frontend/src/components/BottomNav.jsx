import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const patientLinks = [
  { to: '/patient/dashboard', icon: '🏠', label: 'Home' },
  { to: '/appointments', icon: '📅', label: 'Appointments' },
  { to: '/patient/find-doctor', icon: '🔍', label: 'Doctors' },
  { to: '/patient/reports', icon: '📄', label: 'Reports' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

const doctorLinks = [
  { to: '/doctor/dashboard', icon: '🏠', label: 'Home' },
  { to: '/appointments', icon: '📅', label: 'Schedule' },
  { to: '/doctor/patients', icon: '👥', label: 'Patients' },
  { to: '/doctor/earnings', icon: '💰', label: 'Earnings' },
  { to: '/profile', icon: '👤', label: 'Profile' },
]

const BottomNav = () => {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const links = user?.role === 'DOCTOR' ? doctorLinks : patientLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50">
      <div className="max-w-lg mx-auto flex">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 flex flex-col items-center py-2 text-[11px] gap-0.5 transition-colors ${
              pathname.startsWith(link.to) && link.to !== '/'
                ? 'text-primary font-semibold'
                : 'text-slate-400'
            }`}
          >
            <span className="text-lg leading-none">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
