import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { doctorApi, patientApi } from "../services/api";

const ProfileSettingsPage = () => {
  const { user, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientForm, setPatientForm] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    height: "",
    weight: "",
    allergies: "",
  });

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user.role === "DOCTOR") {
          const res = await doctorApi.getById(user.userId);
          setProfile(res.data);
        } else {
          const res = await patientApi.getById(user.userId);
          const p = res.data;
          setProfile(p);
          setPatientForm({
            dateOfBirth: p.dateOfBirth || "",
            gender: p.gender || "",
            bloodGroup: p.bloodGroup || "",
            address: p.address || "",
            city: p.city || "",
            state: p.state || "",
            pincode: p.pincode || "",
            height: p.height || "",
            weight: p.weight || "",
            allergies: p.allergies || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const savePatientProfile = async () => {
    setSaving(true);
    try {
      const data = { ...patientForm };
      if (data.height) data.height = Number(data.height);
      if (data.weight) data.weight = Number(data.weight);
      if (!data.dateOfBirth) data.dateOfBirth = null;
      if (!data.gender) data.gender = null;
      if (!data.bloodGroup) data.bloodGroup = null;
      const res = await patientApi.update(user.userId, data);
      setProfile(res.data);
      setEditMode(false);
    } catch (e) {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      {/* Header */}
      <header className="flex items-center gap-3">
        <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center text-primary text-2xl">
          {user.name?.[0] || "U"}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {user.role === "DOCTOR" ? "Dr. " : ""}
            {user.name}
          </h1>
          <p className="text-sm text-slate-500">{user.email}</p>
          <p className="text-xs text-slate-400">{user.role}</p>
        </div>
      </header>

      {/* Doctor-specific link */}
      {user.role === "DOCTOR" && (
        <Link
          to="/doctor/edit-profile"
          className="card flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Professional Profile
            </p>
            <p className="text-xs text-slate-500">
              Specialty, fees, experience, bio
            </p>
          </div>
          <span className="text-slate-400">→</span>
        </Link>
      )}

      {/* Doctor info summary */}
      {user.role === "DOCTOR" && profile && (
        <section className="card space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Profile Summary
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Specialty:</span>{" "}
              <span className="text-slate-700">
                {profile.specialty?.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Experience:</span>{" "}
              <span className="text-slate-700">
                {profile.experienceYears} years
              </span>
            </div>
            <div>
              <span className="text-slate-400">Fee:</span>{" "}
              <span className="text-slate-700">₹{profile.consultationFee}</span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>{" "}
              <span
                className={
                  profile.availableForConsultation
                    ? "text-green-600"
                    : "text-red-500"
                }>
                {profile.availableForConsultation ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Patient profile edit */}
      {user.role === "PATIENT" && (
        <section className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Health Profile
            </h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="text-xs text-primary font-medium">
                {t("profile.edit")}
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : editMode ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="input-field text-sm"
                    value={patientForm.dateOfBirth}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Gender</label>
                  <select
                    className="input-field text-sm"
                    value={patientForm.gender}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, gender: e.target.value })
                    }>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Blood Group</label>
                  <select
                    className="input-field text-sm"
                    value={patientForm.bloodGroup}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        bloodGroup: e.target.value,
                      })
                    }>
                    <option value="">Select</option>
                    {[
                      "A_POSITIVE",
                      "A_NEGATIVE",
                      "B_POSITIVE",
                      "B_NEGATIVE",
                      "AB_POSITIVE",
                      "AB_NEGATIVE",
                      "O_POSITIVE",
                      "O_NEGATIVE",
                    ].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Pincode</label>
                  <input
                    className="input-field text-sm"
                    value={patientForm.pincode}
                    onChange={(e) =>
                      setPatientForm({
                        ...patientForm,
                        pincode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Height (cm)</label>
                  <input
                    type="number"
                    className="input-field text-sm"
                    value={patientForm.height}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, height: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">Weight (kg)</label>
                  <input
                    type="number"
                    className="input-field text-sm"
                    value={patientForm.weight}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, weight: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Address</label>
                <input
                  className="input-field text-sm"
                  value={patientForm.address}
                  onChange={(e) =>
                    setPatientForm({ ...patientForm, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">City</label>
                  <input
                    className="input-field text-sm"
                    value={patientForm.city}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-500">State</label>
                  <input
                    className="input-field text-sm"
                    value={patientForm.state}
                    onChange={(e) =>
                      setPatientForm({ ...patientForm, state: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Allergies</label>
                <input
                  className="input-field text-sm"
                  placeholder="e.g. Penicillin, Dust"
                  value={patientForm.allergies}
                  onChange={(e) =>
                    setPatientForm({
                      ...patientForm,
                      allergies: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={savePatientProfile}
                  disabled={saving}
                  className="btn-primary flex-1 text-sm">
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="btn-outline flex-1 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">DOB:</span>{" "}
                <span className="text-slate-700">
                  {profile?.dateOfBirth || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Gender:</span>{" "}
                <span className="text-slate-700">{profile?.gender || "—"}</span>
              </div>
              <div>
                <span className="text-slate-400">Blood:</span>{" "}
                <span className="text-slate-700">
                  {profile?.bloodGroup?.replace("_", " ") || "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Height:</span>{" "}
                <span className="text-slate-700">
                  {profile?.height ? `${profile.height} cm` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Weight:</span>{" "}
                <span className="text-slate-700">
                  {profile?.weight ? `${profile.weight} kg` : "—"}
                </span>
              </div>
              <div>
                <span className="text-slate-400">City:</span>{" "}
                <span className="text-slate-700">{profile?.city || "—"}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Language */}
      <section className="card space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          {t("profile.language")}
        </h2>
        <div className="flex gap-3 text-sm">
          <button
            onClick={() => changeLanguage("en")}
            className={`px-3 py-1 rounded-full border ${i18n.language === "en" ? "border-primary text-primary bg-primary-50" : "border-slate-200 text-slate-700"}`}>
            English
          </button>
          <button
            onClick={() => changeLanguage("hi")}
            className={`px-3 py-1 rounded-full border ${i18n.language === "hi" ? "border-primary text-primary bg-primary-50" : "border-slate-200 text-slate-700"}`}>
            हिंदी
          </button>
        </div>
      </section>

      {/* Logout */}
      <section className="card">
        <button
          onClick={logout}
          className="w-full text-sm text-red-600 font-semibold text-left">
          {t("profile.logout")}
        </button>
      </section>
    </div>
  );
};

export default ProfileSettingsPage;
