import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { appointmentApi, videoApi, reviewApi } from "../services/api";

const STATUS_COLORS = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-green-50 text-green-700",
  COMPLETED: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
};

const TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [expandedNotes, setExpandedNotes] = useState({});
  const [showRateModal, setShowRateModal] = useState(null);
  const [rateForm, setRateForm] = useState({ rating: 5, comment: "" });
  const [reviewedAppts, setReviewedAppts] = useState({});
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    date: "",
    time: "",
    durationMinutes: 30,
  });

  const fetchAppointments = async () => {
    try {
      const isPatient = user.role === "PATIENT";
      const res = isPatient
        ? await appointmentApi.getByPatient(user.userId)
        : await appointmentApi.getByDoctor(user.userId);
      setAppointments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchAppointments();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await appointmentApi.cancel(id);
      fetchAppointments();
    } catch (e) {
      alert("Failed to cancel appointment");
    }
  };

  const handleRate = async () => {
    try {
      await reviewApi.create({
        appointmentId: showRateModal,
        rating: rateForm.rating,
        comment: rateForm.comment,
      });
      setReviewedAppts((prev) => ({ ...prev, [showRateModal]: true }));
      setShowRateModal(null);
      setRateForm({ rating: 5, comment: "" });
      alert("Thank you for your review!");
    } catch (e) {
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to submit review",
      );
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time) {
      alert("Please select date and time");
      return;
    }
    try {
      const dt = `${rescheduleForm.date}T${rescheduleForm.time}:00`;
      await appointmentApi.reschedule(
        showRescheduleModal,
        dt,
        rescheduleForm.durationMinutes,
      );
      setShowRescheduleModal(null);
      setRescheduleForm({ date: "", time: "", durationMinutes: 30 });
      fetchAppointments();
      alert("Appointment rescheduled!");
    } catch (e) {
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to reschedule. Time may conflict with another appointment.",
      );
    }
  };

  const filtered =
    activeTab === "ALL"
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">
          {t("dashboard.appointments")}
        </h1>
        <p className="text-sm text-slate-500">
          {appointments.length} total appointments
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap border ${activeTab === tab ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-500"}`}>
            {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <main className="space-y-3">
        {loading && (
          <p className="text-sm text-slate-500">Loading appointments…</p>
        )}
        {!loading && filtered.length === 0 && (
          <div className="card text-center py-8">
            <p className="text-sm text-slate-500">
              No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""}{" "}
              appointments.
            </p>
            {user.role === "PATIENT" && (
              <Link
                to="/patient/find-doctor"
                className="text-xs text-primary mt-2 inline-block">
                Find a doctor
              </Link>
            )}
          </div>
        )}
        {filtered.map((appt) => (
          <div key={appt.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-sm text-slate-900">
                  {user.role === "PATIENT"
                    ? `Dr. ${appt.doctorName || "Doctor"}`
                    : appt.patientName || "Patient"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(appt.appointmentDateTime).toLocaleDateString(
                    "en-IN",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}{" "}
                  at{" "}
                  {new Date(appt.appointmentDateTime).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                  {appt.durationMinutes && (
                    <span className="text-slate-400">
                      {" "}
                      · {appt.durationMinutes} min (till{" "}
                      {new Date(
                        new Date(appt.appointmentDateTime).getTime() +
                          appt.durationMinutes * 60000,
                      ).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${STATUS_COLORS[appt.status] || "bg-slate-100 text-slate-500"}`}>
                  {appt.status}
                </span>
                <span className="text-[10px] rounded-full bg-slate-100 text-slate-500 px-2 py-0.5">
                  {appt.type === "ONLINE" ? "💻 Online" : "🏥 In Person"}
                </span>
              </div>
            </div>

            {(appt.notes || appt.symptoms) && (
              <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2">
                <span className="font-medium">Notes:</span>{" "}
                {appt.notes || appt.symptoms}
              </p>
            )}

            {user.role === "DOCTOR" &&
              (appt.patientMedicalHistory || appt.patientAllergies) && (
                <div className="text-xs bg-indigo-50 rounded-lg p-2 space-y-1">
                  {appt.patientMedicalHistory && (
                    <p className="text-indigo-700">
                      <span className="font-medium">Medical History:</span>{" "}
                      {appt.patientMedicalHistory}
                    </p>
                  )}
                  {appt.patientAllergies && (
                    <p className="text-red-600">
                      <span className="font-medium">⚠ Allergies:</span>{" "}
                      {appt.patientAllergies}
                    </p>
                  )}
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Doctor actions */}
              {user.role === "DOCTOR" && appt.status === "PENDING" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(appt.id, "CONFIRMED")}
                    className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg">
                    ✓ Confirm
                  </button>
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg">
                    ✕ Reject
                  </button>
                </>
              )}
              {user.role === "DOCTOR" && appt.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(appt.id, "COMPLETED")}
                    className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg">
                    ✓ Complete
                  </button>
                  <Link
                    to={`/doctor/prescription/${appt.id}`}
                    className="text-xs bg-purple-500 text-white px-3 py-1.5 rounded-lg">
                    📝 Prescribe
                  </Link>
                </>
              )}

              {/* Patient actions */}
              {user.role === "PATIENT" &&
                (appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg">
                    Cancel
                  </button>
                )}

              {/* Rate button for completed appointments (patient only) */}
              {user.role === "PATIENT" &&
                appt.status === "COMPLETED" &&
                !reviewedAppts[appt.id] && (
                  <button
                    onClick={() => setShowRateModal(appt.id)}
                    className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
                    ⭐ Rate
                  </button>
                )}

              {/* Reschedule button for pending/confirmed */}
              {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                <button
                  onClick={() => {
                    setShowRescheduleModal(appt.id);
                    setRescheduleForm({
                      date: "",
                      time: "",
                      durationMinutes: appt.durationMinutes || 30,
                    });
                  }}
                  className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-3 py-1.5 rounded-lg">
                  🔄 Reschedule
                </button>
              )}

              {/* Shared actions for active appointments */}
              {(appt.status === "CONFIRMED" || appt.status === "PENDING") && (
                <>
                  <Link
                    to={`/chat/${appt.id}`}
                    className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
                    💬 Chat
                  </Link>
                  {appt.type === "ONLINE" && appt.status === "CONFIRMED" && (
                    <Link
                      to={`/video/${appt.id}`}
                      className="text-xs bg-secondary text-white px-3 py-1.5 rounded-lg">
                      📹 Join Call
                    </Link>
                  )}
                </>
              )}

              {/* View Video Notes for completed online appointments */}
              {appt.type === "ONLINE" && (
                <button
                  onClick={async () => {
                    if (expandedNotes[appt.id] !== undefined) {
                      setExpandedNotes((prev) => {
                        const n = { ...prev };
                        delete n[appt.id];
                        return n;
                      });
                    } else {
                      try {
                        const res = await videoApi.getNote(appt.id);
                        setExpandedNotes((prev) => ({
                          ...prev,
                          [appt.id]: res.data?.content || "No notes recorded.",
                        }));
                      } catch {
                        setExpandedNotes((prev) => ({
                          ...prev,
                          [appt.id]: "No notes recorded.",
                        }));
                      }
                    }
                  }}
                  className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg">
                  {expandedNotes[appt.id] !== undefined
                    ? "🔼 Hide Notes"
                    : "📋 Call Notes"}
                </button>
              )}
            </div>

            {/* Expanded video notes */}
            {expandedNotes[appt.id] !== undefined && (
              <div className="bg-indigo-50 rounded-lg p-3 text-xs text-slate-700 border border-indigo-100">
                <p className="font-medium text-indigo-700 mb-1">
                  📋 Video Call Notes:
                </p>
                <p className="whitespace-pre-wrap">{expandedNotes[appt.id]}</p>
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Rate Your Visit
            </h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRateForm({ ...rateForm, rating: star })}
                  className={`text-3xl ${star <= rateForm.rating ? "text-amber-400" : "text-slate-200"}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="input-field text-sm min-h-[80px]"
              placeholder="Leave a comment (optional)..."
              value={rateForm.comment}
              onChange={(e) =>
                setRateForm({ ...rateForm, comment: e.target.value })
              }
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRateModal(null);
                  setRateForm({ rating: 5, comment: "" });
                }}
                className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={handleRate}
                className="btn-primary flex-1 text-sm">
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Reschedule Appointment
            </h3>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                New Date
              </label>
              <input
                type="date"
                className="input-field text-sm"
                min={new Date().toISOString().split("T")[0]}
                value={rescheduleForm.date}
                onChange={(e) =>
                  setRescheduleForm({ ...rescheduleForm, date: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                New Time
              </label>
              <input
                type="time"
                className="input-field text-sm"
                value={rescheduleForm.time}
                onChange={(e) =>
                  setRescheduleForm({ ...rescheduleForm, time: e.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setRescheduleForm({
                        ...rescheduleForm,
                        durationMinutes: d,
                      })
                    }
                    className={`py-2 px-2 rounded-lg text-sm border ${rescheduleForm.durationMinutes === d ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-600"}`}>
                    {d} min
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRescheduleModal(null)}
                className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                className="btn-primary flex-1 text-sm">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
