import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { doctorApi } from "../../services/api";

const SPECIALTIES = [
  "GENERAL_PRACTITIONER",
  "CARDIOLOGIST",
  "DERMATOLOGIST",
  "NEUROLOGIST",
  "ORTHOPEDIST",
  "PEDIATRICIAN",
  "PSYCHIATRIST",
  "GYNECOLOGIST",
  "OPHTHALMOLOGIST",
  "ENT",
  "DENTIST",
  "ONCOLOGIST",
  "RADIOLOGIST",
  "OTHER",
];

const formatSpecialty = (s) =>
  s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultSchedule = () =>
  DAYS.reduce((acc, day) => {
    acc[day] = { enabled: false, start: "09:00", end: "17:00" };
    return acc;
  }, {});

const parseSchedule = (availability) => {
  if (!availability) return defaultSchedule();
  try {
    const parsed = JSON.parse(availability);
    const schedule = defaultSchedule();
    for (const day of DAYS) {
      if (parsed[day]) schedule[day] = { ...schedule[day], ...parsed[day] };
    }
    return schedule;
  } catch {
    return defaultSchedule();
  }
};

const DoctorProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [form, setForm] = useState({
    specialty: "GENERAL_PRACTITIONER",
    gender: "",
    experienceYears: 0,
    qualification: "",
    registrationNumber: "",
    bio: "",
    consultationFee: 0,
    languages: "",
    availableForConsultation: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await doctorApi.getById(user.userId);
        const doc = res.data;
        setProfile(doc);
        setSchedule(parseSchedule(doc.availability));
        setForm({
          specialty: doc.specialty || "GENERAL_PRACTITIONER",
          gender: doc.gender || "",
          experienceYears: doc.experienceYears || 0,
          qualification:
            doc.qualification === "To be updated"
              ? ""
              : doc.qualification || "",
          registrationNumber: doc.registrationNumber || "",
          bio: doc.bio || "",
          consultationFee: doc.consultationFee || 0,
          languages: doc.languages?.join(", ") || "",
          availableForConsultation: doc.availableForConsultation ?? true,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        specialty: form.specialty,
        gender: form.gender || null,
        experienceYears: Number(form.experienceYears) || 0,
        qualification: form.qualification || null,
        registrationNumber: form.registrationNumber || null,
        bio: form.bio || null,
        consultationFee: Number(form.consultationFee) || 0,
        languages: form.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        availableForConsultation: form.availableForConsultation,
        availability: JSON.stringify(schedule),
      };
      const res = await doctorApi.update(user.userId, data);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Profile save error:", e);
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Failed to save profile";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading profile…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Edit Profile</h1>
        <p className="text-sm text-slate-500">
          Complete your profile to start receiving patients
        </p>
      </header>

      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Professional Details
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Specialty *
          </label>
          <select
            className="input-field text-sm"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {formatSpecialty(s)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Experience (years) *
            </label>
            <input
              type="number"
              className="input-field text-sm"
              min="0"
              value={form.experienceYears}
              onChange={(e) =>
                setForm({ ...form, experienceYears: e.target.value })
              }
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Consultation Fee (₹) *
            </label>
            <input
              type="number"
              className="input-field text-sm"
              min="0"
              value={form.consultationFee}
              onChange={(e) =>
                setForm({ ...form, consultationFee: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Qualification *
          </label>
          <input
            className="input-field text-sm"
            placeholder="e.g. MBBS, MD (Medicine)"
            value={form.qualification}
            onChange={(e) =>
              setForm({ ...form, qualification: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Registration Number
          </label>
          <input
            className="input-field text-sm"
            placeholder="Medical council registration number"
            value={form.registrationNumber}
            onChange={(e) =>
              setForm({ ...form, registrationNumber: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Gender</label>
          <select
            className="input-field text-sm"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          About
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Bio</label>
          <textarea
            className="input-field text-sm min-h-[100px]"
            placeholder="Write a brief bio about yourself, your expertise, and approach to patient care..."
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">
            Languages (comma separated)
          </label>
          <input
            className="input-field text-sm"
            placeholder="e.g. English, Hindi, Tamil"
            value={form.languages}
            onChange={(e) => setForm({ ...form, languages: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              Available for consultation
            </p>
            <p className="text-xs text-slate-400">
              Toggle off to stop receiving new bookings
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                availableForConsultation: !form.availableForConsultation,
              })
            }
            className={`relative w-11 h-6 rounded-full transition-colors ${form.availableForConsultation ? "bg-green-500" : "bg-slate-300"}`}>
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.availableForConsultation ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          Weekly Schedule
        </h2>
        <p className="text-xs text-slate-500">
          Set the days and hours you are available for consultations
        </p>

        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSchedule((prev) => ({
                    ...prev,
                    [day]: { ...prev[day], enabled: !prev[day].enabled },
                  }))
                }
                className={`w-24 text-left text-sm font-medium px-2 py-1.5 rounded-lg transition-colors ${
                  schedule[day].enabled
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                {day.slice(0, 3)}
              </button>
              {schedule[day].enabled && (
                <div className="flex items-center gap-2 text-sm">
                  <input
                    type="time"
                    className="input-field text-sm w-28"
                    value={schedule[day].start}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], start: e.target.value },
                      }))
                    }
                  />
                  <span className="text-slate-400">to</span>
                  <input
                    type="time"
                    className="input-field text-sm w-28"
                    value={schedule[day].end}
                    onChange={(e) =>
                      setSchedule((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], end: e.target.value },
                      }))
                    }
                  />
                </div>
              )}
              {!schedule[day].enabled && (
                <span className="text-xs text-slate-400 italic">
                  Unavailable
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full">
        {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Profile"}
      </button>
    </div>
  );
};

export default DoctorProfilePage;
