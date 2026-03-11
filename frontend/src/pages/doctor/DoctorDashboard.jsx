import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { appointmentApi, doctorApi, billingApi } from "../../services/api";
import { SPECIALTY_DATA } from "../../constants/specialtyData";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, profileRes, earningsRes] = await Promise.allSettled([
          appointmentApi.getByDoctor(user.userId),
          doctorApi.getById(user.userId),
          billingApi.getDoctorBilling(user.userId),
        ]);
        if (apptRes.status === "fulfilled") setAppointments(apptRes.value.data);
        if (profileRes.status === "fulfilled")
          setProfile(profileRes.value.data);
        if (earningsRes.status === "fulfilled") {
          const total = earningsRes.value.data.reduce(
            (s, t) => s + Number(t.amount || 0),
            0,
          );
          setEarnings(total);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.userId]);

  const todayAppts = appointments.filter((a) => {
    const apptDate = new Date(a.appointmentDateTime).toDateString();
    return apptDate === new Date().toDateString();
  });

  const pendingAppts = appointments.filter((a) => a.status === "PENDING");
  const confirmedAppts = appointments.filter((a) => a.status === "CONFIRMED");
  const completedAppts = appointments.filter((a) => a.status === "COMPLETED");
  const profileIncomplete =
    profile &&
    (!profile.qualification ||
      profile.qualification === "To be updated" ||
      !profile.consultationFee ||
      profile.consultationFee === 0);

  const sp = profile?.specialty
    ? SPECIALTY_DATA[profile.specialty] || SPECIALTY_DATA.OTHER
    : null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ── Header with gradient ── */}
      <header className="bg-gradient-to-br from-secondary to-emerald-600 text-white px-5 pt-6 pb-8 rounded-b-3xl animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-emerald-100 text-xs">{t("dashboard.welcome")}</p>
            <h1 className="text-xl font-bold">Dr. {user.name}</h1>
            {sp && (
              <p className="text-xs text-emerald-100 mt-0.5">{sp.label}</p>
            )}
          </div>
          <Link
            to="/profile"
            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-semibold">
            {user.name?.[0] || "D"}
          </Link>
        </div>
      </header>

      <main className="px-4 space-y-4 -mt-4">
        {/* Profile incomplete alert */}
        {profileIncomplete && (
          <Link
            to="/doctor/edit-profile"
            className="block bg-amber-50 border border-amber-200 rounded-xl p-3 animate-fade-in-up">
            <p className="text-sm font-semibold text-amber-800">
              ⚠️ Complete your profile
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Add your qualification, fees, and bio to start receiving patients.
            </p>
          </Link>
        )}

        {/* Stats */}
        <section
          className="grid grid-cols-4 gap-2 animate-fade-in-up"
          style={{ animationDelay: "0.05s" }}>
          <div className="card-compact text-center py-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-500">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {todayAppts.length}
            </p>
            <p className="text-[10px] text-slate-500">Today</p>
          </div>
          <div className="card-compact text-center py-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-amber-500">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-amber-600">
              {pendingAppts.length}
            </p>
            <p className="text-[10px] text-slate-500">Pending</p>
          </div>
          <div className="card-compact text-center py-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-500">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              {completedAppts.length}
            </p>
            <p className="text-[10px] text-slate-500">Done</p>
          </div>
          <Link to="/doctor/earnings" className="card-compact text-center py-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-emerald-500">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              ₹{earnings.toFixed(0)}
            </p>
            <p className="text-[10px] text-slate-500">Earnings</p>
          </Link>
        </section>

        {/* Pending requests */}
        {pendingAppts.length > 0 && (
          <section
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}>
            <h2 className="text-base font-semibold text-slate-900">
              Pending Requests
            </h2>
            <div className="space-y-2">
              {pendingAppts.slice(0, 3).map((appt) => (
                <div
                  key={appt.id}
                  className="card-compact flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-sm font-semibold text-amber-700">
                      {(appt.patientName || "P")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {appt.patientName || "Patient"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(appt.appointmentDateTime).toLocaleString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/appointments"
                    className="text-xs text-primary font-medium bg-primary-50 px-3 py-1 rounded-full">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming confirmed */}
        <section
          className="space-y-2 animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Upcoming Appointments
            </h2>
            <Link
              to="/appointments"
              className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          <div className="space-y-2">
            {loading && (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            )}
            {!loading && confirmedAppts.length === 0 && (
              <p className="text-sm text-slate-500">
                No confirmed appointments.
              </p>
            )}
            {confirmedAppts.slice(0, 5).map((appt) => (
              <div
                key={appt.id}
                className="card-compact flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-sm font-semibold text-primary">
                    {(appt.patientName || "P")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {appt.patientName || "Patient"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {new Date(appt.appointmentDateTime).toLocaleString(
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] rounded-full bg-primary-50 text-primary px-2 py-0.5 font-medium">
                    {appt.type === "ONLINE" ? "Online" : "In Person"}
                  </span>
                  <Link
                    to={`/chat/${appt.id}`}
                    className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 fill-primary">
                      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                    </svg>
                  </Link>
                  {appt.type === "ONLINE" && (
                    <Link
                      to={`/video/${appt.id}`}
                      className="w-7 h-7 rounded-full bg-secondary-50 flex items-center justify-center">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-3.5 h-3.5 fill-secondary">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        {todayAppts.length > 0 && (
          <section
            className="space-y-2 animate-fade-in-up"
            style={{ animationDelay: "0.12s" }}>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Today's Schedule
              </h2>
              <Link
                to="/appointments"
                className="text-xs text-primary font-medium">
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {todayAppts.map((appt) => {
                const statusColors = {
                  PENDING: "bg-amber-50 text-amber-700",
                  CONFIRMED: "bg-blue-50 text-blue-700",
                  COMPLETED: "bg-emerald-50 text-emerald-700",
                  CANCELLED: "bg-red-50 text-red-700",
                };
                return (
                  <div
                    key={appt.id}
                    className="card-compact flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {(appt.patientName || "P")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {appt.patientName || "Patient"}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(appt.appointmentDateTime).toLocaleString(
                            "en-IN",
                            { hour: "2-digit", minute: "2-digit" },
                          )}{" "}
                          · {appt.type === "ONLINE" ? "Online" : "In Person"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${statusColors[appt.status] || "bg-slate-100 text-slate-600"}`}>
                      {appt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section
          className="space-y-2 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}>
          <h2 className="text-base font-semibold text-slate-900">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                to: "/appointments",
                label: "Schedule",
                svg: "M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z",
                color: "#4A90E2",
              },
              {
                to: "/doctor/patients",
                label: "Patients",
                svg: "M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z",
                color: "#10B981",
              },
              {
                to: "/doctor/reports",
                label: "Reports",
                svg: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z",
                color: "#F59E0B",
              },
              {
                to: "/doctor/earnings",
                label: "Earnings",
                svg: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
                color: "#8B5CF6",
              },
              {
                to: "/doctor/edit-profile",
                label: "Profile",
                svg: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
                color: "#EC4899",
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
      </main>
    </div>
  );
};

export default DoctorDashboard;
