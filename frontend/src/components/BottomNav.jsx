import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const patientNav = [
  { to: '/patient/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/patient/find-doctor', label: 'Find', icon: Search },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
];

const doctorNav = [
  { to: '/doctor/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/doctor/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const { user } = useAuth();
  const navItems = user?.role === 'DOCTOR' ? doctorNav : patientNav;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors duration-150
              ${isActive ? 'text-primary' : 'text-gray-500'}`
            }
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-400'}`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
