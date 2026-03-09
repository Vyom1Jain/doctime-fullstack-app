import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  CreditCard,
  FileText,
  Heart,
  User,
  Users,
  ClipboardList,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const patientLinks = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/patient/find-doctor', label: 'Find Doctor', icon: Search },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/patient/billing', label: 'Billing', icon: CreditCard },
  { to: '/patient/reports', label: 'Reports', icon: FileText },
  { to: '/patient/donations', label: 'Donations', icon: Heart },
  { to: '/profile', label: 'Profile', icon: User },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/doctor/patients', label: 'My Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/doctor/prescription', label: 'Prescriptions', icon: ClipboardList },
  { to: '/doctor/earnings', label: 'Earnings', icon: DollarSign },
  { to: '/profile', label: 'Profile', icon: User },
];

const linkBase =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150';
const linkInactive = 'text-gray-600 hover:bg-primary-50 hover:text-primary';
const linkActive = 'bg-primary-50 text-primary font-semibold';

export default function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'DOCTOR' ? doctorLinks : patientLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-gray-100 py-6 px-3 gap-1 shrink-0">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to !== '/appointments' && !to.endsWith('dashboard')}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
