import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { appointmentApi, doctorApi, statsApi } from "../../services/api";
import {
  SPECIALTY_DATA,
  SPECIALTIES,
  HEALTH_CONCERNS,
  SpecialtyIcon,
  formatSpecialty,
} from "../../constants/specialtyData";

const SkeletonCard = ({ className = "" }) => (
  <div className={`skeleton h-20 ${className}`} />
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, docRes, statsRes] = await Promise.allSettled([
          appointmentApi.getByPatient(user.userId),
          doctorApi.getAll(),
          statsApi.getSummary(),
        ]);
        if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data);
        if (docRes.status === "fulfilled") setDoctors(docRes.value.data);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.userId]);

  const upcoming = appointments.filter(
    (a) =>
      ["PENDING", "CONFIRMED"].includes(a.status) &&
      new Date(a.appointmentDateTime) >= new Date(),
  );
  const completedCount = appointments.filter(
    (a) => a.status === "COMPLETED",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-br from-primary to-blue-600 text-white px-5 pt-6 pb-8 rounded-b-3xl animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-xs">{t("dashboard.welcome")}</p>
            <h1 className="text-xl font-bold">{user.name}</h1>
          </div>
          <Link
            to="/profile"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-semibold">
            {user.name?.[0] || "P"}
          </Link>
        </div>
        <div className="bg-white/15 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold">Skip the travel!</p>
            <p className="text-xs text-blue-100 mt-0.5">
              Consult top doctors online, anytime.
            </p>
          </div>
          <Link
            to="/patient/find-doctor"
            className="bg-white text-primary text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0">
            Consult Now
          </Link>
        </div>
      </section>

      <main className="px-4 space-y-5 -mt-3">
        {/* ── Trust Badges ── */}
        <section
          className="bg-white rounded-2xl shadow-sm p-3 flex justify-around animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}>
          {[
            { icon: "✓", label: "Verified Doctors", color: "text-green-600" },
            { icon: "📄", label: "Digital Rx", color: "text-primary" },
            { icon: "🔄", label: "Free Follow-up", color: "text-secondary" },
          ].map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <span className={`text-sm ${b.color}`}>{b.icon}</span>
              <span className="font-medium">{b.label}</span>
            </div>
          ))}
        </section>

        {/* ── Next Appointment ── */}
        {(loading || upcoming[0]) && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}>
            {loading ? (
              <SkeletonCard />
            ) : (
              <div className="card-compact flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-primary">
                      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Next Appointment
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      Dr. {upcoming[0]?.doctorName || "Your doctor"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(upcoming[0].appointmentDateTime).toLocaleString(
                        "en-IN",
                        {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${upcoming[0].status === "CONFIRMED" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {upcoming[0].status}
                  </span>
                  {upcoming[0].type === "ONLINE" &&
                    upcoming[0].status === "CONFIRMED" && (
                      <Link
                        to={`/video/${upcoming[0].id}`}
                        className="text-[10px] bg-secondary text-white px-3 py-1 rounded-full font-medium">
                        Join
                      </Link>
                    )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Specialties Horizontal Scroll ── */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-900">
              Consult Top Specialists
            </h2>
            <Link
              to="/patient/find-doctor"
              className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-hidden pb-1">
            {SPECIALTIES.filter((s) => s !== "OTHER")
              .slice(0, 10)
              .map((key) => {
                const sp = SPECIALTY_DATA[key];
                return (
                  <button
                    key={key}
                    onClick={() =>
                      navigate(`/patient/find-doctor?specialty=${key}`)
                    }
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px]">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95"
                      style={{ backgroundColor: sp.bgColor }}>
                      <SpecialtyIcon specialty={key} size={28} />
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium text-center leading-tight">
                      {sp.shortLabel}
                    </span>
                  </button>
                );
              })}
          </div>
        </section>

        {/* ── Health Concerns Horizontal Scroll ── */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}>
          <h2 className="text-base font-semibold text-slate-900 mb-2">
            Common Health Concerns
          </h2>
          <div className="flex gap-3 overflow-x-auto scroll-hidden pb-1">
            {HEALTH_CONCERNS.map((c) => (
              <button
                key={c.label}
                onClick={() =>
                  navigate(`/patient/find-doctor?specialty=${c.specialty}`)
                }
                className="flex-shrink-0 w-28 rounded-xl overflow-hidden shadow-sm bg-white active:scale-[0.97] transition-transform">
                <div
                  className="h-20 flex items-center justify-center"
                  style={{ backgroundColor: `${c.color}15` }}>
                  <span className="text-3xl">{c.icon}</span>
                </div>
                <p className="text-[10px] font-medium text-slate-700 p-2 text-center leading-tight">
                  {c.label}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* ── My Stats ── */}
        <section
          className="grid grid-cols-3 gap-2 animate-fade-in-up"
          style={{ animationDelay: "0.25s" }}>
          <div className="card-compact text-center py-3">
            <p className="text-lg font-bold text-primary">{upcoming.length}</p>
            <p className="text-[10px] text-slate-500">Upcoming</p>
          </div>
          <div className="card-compact text-center py-3">
            <p className="text-lg font-bold text-slate-900">{completedCount}</p>
            <p className="text-[10px] text-slate-500">Completed</p>
          </div>
          <div className="card-compact text-center py-3">
            <p className="text-lg font-bold text-slate-900">
              {appointments.length}
            </p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}>
          <h2 className="text-base font-semibold text-slate-900 mb-2">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                to: "/appointments",
                label: t("dashboard.appointments"),
                svg: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
                color: "#4A90E2",
              },
              {
                to: "/patient/prescriptions",
                label: "Rx",
                svg: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
                color: "#10B981",
              },
              {
                to: "/patient/reports",
                label: "Reports",
                svg: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z",
                color: "#F59E0B",
              },
              {
                to: "/patient/billing",
                label: "Billing",
                svg: "M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",
                color: "#8B5CF6",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="card-compact flex flex-col items-center gap-1.5 py-3 active:scale-95 transition-transform">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}>
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill={item.color}>
                    <path d={item.svg} />
                  </svg>
                </div>
                <span className="text-[10px] text-slate-600 font-medium">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section
          className="bg-white rounded-2xl shadow-sm p-4 animate-fade-in-up"
          style={{ animationDelay: "0.35s" }}>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            How It Works
          </h2>
          <div className="flex justify-between">
            {[
              {
                step: "1",
                title: "Find Doctor",
                desc: "Choose specialty",
                svg: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
              },
              {
                step: "2",
                title: "Consult",
                desc: "Video / Audio call",
                svg: "M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z",
              },
              {
                step: "3",
                title: "Get Rx",
                desc: "Digital prescription",
                svg: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="flex flex-col items-center text-center w-1/3 px-1">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center mb-1.5">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-primary">
                    <path d={s.svg} />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {s.title}
                </p>
                <p className="text-[10px] text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Available Doctors ── */}
        <section
          className="animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold text-slate-900">
              Available Doctors
            </h2>
            <Link
              to="/patient/find-doctor"
              className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : doctors.filter((d) => d.availableForConsultation).length === 0 ? (
            <div className="card-compact text-center py-6">
              <p className="text-sm text-slate-500">
                No doctors available right now.
              </p>
              <Link
                to="/patient/find-doctor"
                className="text-xs text-primary mt-1 inline-block">
                Browse all doctors
              </Link>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scroll-hidden pb-1">
              {doctors
                .filter((d) => d.availableForConsultation)
                .slice(0, 6)
                .map((doc) => {
                  const sp =
                    SPECIALTY_DATA[doc.specialty] || SPECIALTY_DATA.OTHER;
                  return (
                    <Link
                      key={doc.id}
                      to="/patient/find-doctor"
                      className="flex-shrink-0 w-36 bg-white rounded-xl shadow-sm overflow-hidden active:scale-[0.97] transition-transform">
                      <div
                        className="h-24 flex flex-col items-center justify-center relative"
                        style={{ backgroundColor: sp.bgColor }}>
                        <div
                          className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-xl font-bold shadow-sm"
                          style={{ color: sp.color }}>
                          {doc.name?.[0] || "D"}
                        </div>
                        <span className="absolute top-2 right-2 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-dot" />
                        </span>
                        {doc.rating > 0 && (
                          <span className="absolute bottom-1 right-2 text-[9px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                            ★ {doc.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          Dr. {doc.name}
                        </p>
                        <p
                          className="text-[10px] font-medium truncate"
                          style={{ color: sp.color }}>
                          {sp.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {doc.experienceYears} yrs • ₹{doc.consultationFee}
                        </p>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </section>

        {/* ── Trust Metrics ── */}
        {stats && (
          <section
            className="bg-slate-800 text-white rounded-2xl p-4 flex justify-around animate-fade-in-up"
            style={{ animationDelay: "0.45s" }}>
            {[
              { value: `${stats.doctorCount}+`, label: "Doctors" },
              { value: `${stats.specialtyCount}+`, label: "Specialties" },
              { value: `${stats.completedAppointments}+`, label: "Consults" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[10px] text-slate-300">{m.label}</p>
              </div>
            ))}
          </section>
        )}

        {/* ── Recent Activity ── */}
        {appointments.length > 0 && (
          <section
            className="animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-slate-900">
                Recent Activity
              </h2>
              <Link
                to="/appointments"
                className="text-xs text-primary font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {appointments.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="card-compact flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-600">
                      {appt.doctorName?.[0] || "D"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Dr. {appt.doctorName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(appt.appointmentDateTime).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short" },
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${appt.status === "COMPLETED" ? "bg-blue-50 text-blue-600" : appt.status === "CONFIRMED" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PatientDashboard;
