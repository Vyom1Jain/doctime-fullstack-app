import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const SignupPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useTranslation();
  const [role, setRole] = useState(state?.role || "PATIENT");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const user = await signup({ ...data, role });
      if (user.role === "PATIENT") {
        navigate("/patient/dashboard");
      } else {
        navigate("/doctor/dashboard");
      }
    } catch (e) {
      const msg =
        e.response?.data?.error ||
        e.response?.data?.message ||
        "Signup failed. Please try again.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Brand header */}
      <div className="bg-gradient-to-br from-primary to-blue-600 text-white px-6 pt-10 pb-8 text-center rounded-b-[2rem]">
        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-2">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold">Create Account</h1>
        <p className="text-blue-100 text-xs mt-0.5">{t("auth.chooseRole")}</p>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-5 -mt-4 pb-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5 animate-fade-in-up">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("PATIENT")}
              className={`border-2 rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all ${role === "PATIENT" ? "border-primary bg-blue-50 text-primary shadow-sm" : "border-slate-200 text-slate-500"}`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "PATIENT" ? "bg-primary/10" : "bg-slate-100"}`}>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${role === "PATIENT" ? "fill-primary" : "fill-slate-400"}`}>
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t("auth.patient")}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("DOCTOR")}
              className={`border-2 rounded-xl py-3 px-2 flex flex-col items-center gap-1.5 transition-all ${role === "DOCTOR" ? "border-primary bg-blue-50 text-primary shadow-sm" : "border-slate-200 text-slate-500"}`}>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${role === "DOCTOR" ? "bg-primary/10" : "bg-slate-100"}`}>
                <svg
                  viewBox="0 0 24 24"
                  className={`w-5 h-5 ${role === "DOCTOR" ? "fill-primary" : "fill-slate-400"}`}>
                  <path d="M19 8h-2v3h-3v2h3v3h2v-3h3v-2h-3V8zM4 8c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4S4 5.79 4 8zm6 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM2 18v2h12v-2c0-2.66-4-4-6-4s-6 1.34-6 4z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t("auth.doctor")}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                className="input-field"
                placeholder="Full name"
                {...register("name", { required: true })}
              />
              {errors.name && (
                <p className="text-xs text-red-500">Name is required</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {t("auth.email")}
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register("email", { required: true })}
              />
              {errors.email && (
                <p className="text-xs text-red-500">Email is required</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Phone
              </label>
              <input
                className="input-field"
                placeholder="10-digit number"
                {...register("phone", {
                  required: "Phone is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Must be 10 digits",
                  },
                })}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {t("auth.password")}
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Min 6 characters"
                {...register("password", { required: true, minLength: 6 })}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold">
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSubmitting ? "Creating account…" : t("auth.signup")}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold">
              {t("auth.login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
