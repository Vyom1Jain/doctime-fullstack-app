import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { doctorApi, appointmentApi } from "../../services/api";
import {
  SPECIALTY_DATA,
  SPECIALTIES,
  SpecialtyIcon,
  formatSpecialty,
} from "../../constants/specialtyData";

const FindDoctor = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState(
    searchParams.get("specialty") || "",
  );
  const [maxFee, setMaxFee] = useState("");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    type: "ONLINE",
    durationMinutes: 30,
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSpecialty) params.specialty = selectedSpecialty;
      if (maxFee) params.maxFee = Number(maxFee);
      if (searchName.trim()) params.name = searchName.trim();

      const res =
        Object.keys(params).length > 0
          ? await doctorApi.search(params)
          : await doctorApi.getAll();
      setDoctors(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, maxFee]);

  useEffect(() => {
    const timer = setTimeout(() => fetchDoctors(), 400);
    return () => clearTimeout(timer);
  }, [searchName]);

  const handleBook = async () => {
    if (!bookingData.date || !bookingData.time)
      return alert("Please select date and time");
    setBookingLoading(true);
    try {
      const dateTime = `${bookingData.date}T${bookingData.time}:00`;
      await appointmentApi.book({
        patientId: user.userId,
        doctorId: bookingDoctor.id,
        appointmentDateTime: dateTime,
        type: bookingData.type,
        durationMinutes: Number(bookingData.durationMinutes),
        notes: bookingData.notes,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingDoctor(null);
        setBookingSuccess(false);
        setBookingData({
          date: "",
          time: "",
          type: "ONLINE",
          durationMinutes: 30,
          notes: "",
        });
      }, 2000);
    } catch (e) {
      alert(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to book appointment",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-4 space-y-4">
      <header className="px-4">
        <h1 className="text-xl font-bold text-slate-900">
          {t("appointments.find")}
        </h1>
        <p className="text-sm text-slate-500">
          Search by name, specialty or fee range
        </p>
      </header>

      {/* Specialty Quick Filter — Horizontal scroll */}
      <section className="px-4">
        <div className="flex gap-2 overflow-x-auto scroll-hidden pb-1">
          <button
            onClick={() => setSelectedSpecialty("")}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              !selectedSpecialty
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-600"
            }`}>
            All
          </button>
          {SPECIALTIES.filter((s) => s !== "OTHER").map((key) => {
            const sp = SPECIALTY_DATA[key];
            return (
              <button
                key={key}
                onClick={() =>
                  setSelectedSpecialty(selectedSpecialty === key ? "" : key)
                }
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  selectedSpecialty === key
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}>
                <span className="text-sm">{sp.icon}</span>
                {sp.shortLabel}
              </button>
            );
          })}
        </div>
      </section>

      {/* Search & Fee Filter */}
      <div className="px-4 space-y-2">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 fill-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            className="input-field pl-9 text-sm"
            placeholder="Search doctor by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <input
          className="input-field text-sm"
          type="number"
          placeholder="Max consultation fee ₹"
          value={maxFee}
          onChange={(e) => setMaxFee(e.target.value)}
        />
      </div>

      {/* Doctor List */}
      <main className="px-4 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-28 rounded-xl" />
            ))}
          </div>
        )}
        {!loading && doctors.length === 0 && (
          <div className="card-compact text-center py-8">
            <p className="text-sm text-slate-500">
              No doctors found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchName("");
                setSelectedSpecialty("");
                setMaxFee("");
              }}
              className="text-xs text-primary mt-2 font-medium">
              Clear filters
            </button>
          </div>
        )}
        {doctors.map((doc) => {
          const sp = SPECIALTY_DATA[doc.specialty] || SPECIALTY_DATA.OTHER;
          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden animate-fade-in-up">
              <div className="flex gap-3 p-4">
                {/* Avatar with specialty color */}
                <div className="flex-shrink-0">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${sp.color}, ${sp.color}CC)`,
                    }}>
                    {doc.name?.[0] || "D"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Dr. {doc.name}
                      </p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: sp.color }}>
                        {sp.label}
                      </p>
                    </div>
                    {doc.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-green-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        ★ {doc.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span>{doc.experienceYears} yrs exp</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-slate-700">
                      ₹{doc.consultationFee}
                    </span>
                    {doc.totalReviews > 0 && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span>{doc.totalReviews} reviews</span>
                      </>
                    )}
                  </div>
                  {doc.qualification &&
                    doc.qualification !== "To be updated" && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {doc.qualification}
                      </p>
                    )}
                </div>
              </div>
              {/* Action bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${doc.availableForConsultation ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                  {doc.availableForConsultation ? (
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-dot" />
                      Available
                    </span>
                  ) : (
                    "Unavailable"
                  )}
                </span>
                {doc.availableForConsultation && (
                  <button
                    onClick={() => setBookingDoctor(doc)}
                    className="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full active:scale-95 transition-transform">
                    {t("appointments.book")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Booking Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 space-y-4">
            {bookingSuccess ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-4xl">✅</p>
                <p className="text-lg font-bold text-slate-900">
                  Appointment Booked!
                </p>
                <p className="text-sm text-slate-500">
                  You'll receive a confirmation soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">
                    {t("appointments.book")}
                  </h2>
                  <button
                    onClick={() => setBookingDoctor(null)}
                    className="text-slate-400 text-xl">
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{
                      backgroundColor: (
                        SPECIALTY_DATA[bookingDoctor.specialty] ||
                        SPECIALTY_DATA.OTHER
                      ).color,
                    }}>
                    {bookingDoctor.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Dr. {bookingDoctor.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatSpecialty(bookingDoctor.specialty)} • ₹
                      {bookingDoctor.consultationFee}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Date
                    </label>
                    <input
                      type="date"
                      className="input-field text-sm"
                      min={new Date().toISOString().split("T")[0]}
                      value={bookingData.date}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Time
                    </label>
                    <input
                      type="time"
                      className="input-field text-sm"
                      value={bookingData.time}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, time: e.target.value })
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
                            setBookingData({
                              ...bookingData,
                              durationMinutes: d,
                            })
                          }
                          className={`py-2 px-2 rounded-lg text-sm border ${bookingData.durationMinutes === d ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-600"}`}>
                          {d} min
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Consultation Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["ONLINE", "IN_PERSON"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setBookingData({ ...bookingData, type })
                          }
                          className={`py-2 px-3 rounded-lg text-sm border ${bookingData.type === type ? "border-primary bg-primary-50 text-primary font-medium" : "border-slate-200 text-slate-600"}`}>
                          {type === "ONLINE" ? "💻 Online" : "🏥 In Person"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">
                      Symptoms / Notes
                    </label>
                    <textarea
                      className="input-field text-sm min-h-[80px]"
                      placeholder="Describe your symptoms or reason for visit..."
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={bookingLoading}
                  className="btn-primary w-full">
                  {bookingLoading
                    ? "Booking..."
                    : `Confirm Booking • ₹${bookingDoctor.consultationFee}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FindDoctor;
