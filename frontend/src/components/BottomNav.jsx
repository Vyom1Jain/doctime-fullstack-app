import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SVG = ({ d, active }) => (
  <svg
    viewBox="0 0 24 24"
    className={`w-5 h-5 transition-colors ${active ? "fill-primary" : "fill-slate-400"}`}>
    <path d={d} />
  </svg>
);

const paths = {
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  calendar:
    "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  search:
    "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  person:
    "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  people:
    "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z",
};

const patientLinks = [
  { to: "/patient/dashboard", svg: paths.home, label: "Home" },
  { to: "/appointments", svg: paths.calendar, label: "Appts" },
  { to: "/donations", svg: paths.heart, label: "Donate" },
  { to: "/patient/find-doctor", svg: paths.search, label: "Doctors" },
  { to: "/profile", svg: paths.person, label: "Profile" },
];

const doctorLinks = [
  { to: "/doctor/dashboard", svg: paths.home, label: "Home" },
  { to: "/appointments", svg: paths.calendar, label: "Schedule" },
  { to: "/donations", svg: paths.heart, label: "Donate" },
  { to: "/doctor/patients", svg: paths.people, label: "Patients" },
  { to: "/profile", svg: paths.person, label: "Profile" },
];

const BottomNav = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const links = user?.role === "DOCTOR" ? doctorLinks : patientLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-100 z-50 safe-bottom">
      <div className="max-w-lg mx-auto flex">
        {links.map((link) => {
          const active = pathname.startsWith(link.to) && link.to !== "/";
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex-1 flex flex-col items-center pt-2 pb-1.5 text-[10px] gap-0.5 transition-all ${active ? "text-primary font-semibold" : "text-slate-400"}`}>
              {active && (
                <span className="absolute top-0 w-6 h-0.5 rounded-b bg-primary" />
              )}
              <SVG d={link.svg} active={active} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
