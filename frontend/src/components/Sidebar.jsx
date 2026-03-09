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
  { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/patient/find-doctor', label: 'Find Doctor', icon: Search, exact: false },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, exact: false },
  { to: '/patient/billing', label: 'Billing', icon: CreditCard, exact: false },
  { to: '/patient/reports', label: 'Reports', icon: FileText, exact: false },
  { to: '/patient/donations', label: 'Donations', icon: Heart, exact: false },
  { to: '/profile', label: 'Profile', icon: User, exact: false },
];

const doctorLinks = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/doctor/patients', label: 'My Patients', icon: Users, exact: false },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, exact: false },
  { to: '/doctor/prescription', label: 'Prescriptions', icon: ClipboardList, exact: false },
  { to: '/doctor/earnings', label: 'Earnings', icon: DollarSign, exact: false },
  { to: '/profile', label: 'Profile', icon: User, exact: false },
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
      {links.map(({ to, label, icon: Icon, exact }) => (
        <NavLink
          key={to}
          to={to}
          end={exact}
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
