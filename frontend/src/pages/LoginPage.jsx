import React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      if (user.role === "PATIENT") {
        navigate("/patient/dashboard");
      } else if (user.role === "DOCTOR") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/");
      }
    } catch (e) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Brand header */}
      <div className="bg-gradient-to-br from-primary to-blue-600 text-white px-6 pt-12 pb-10 text-center rounded-b-[2rem]">
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">DocTime</h1>
        <p className="text-blue-100 text-sm mt-1">{t("app.tagline")}</p>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-5 -mt-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5 animate-fade-in-up">
          <h2 className="text-lg font-bold text-slate-900 text-center">
            {t("auth.welcome")}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {t("auth.email")}
              </label>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <input
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">Email is required</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                {t("auth.password")}
              </label>
              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-slate-400 absolute left-3 top-1/2 -translate-y-1/2">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                </svg>
                <input
                  type="password"
                  className="input-field pl-10"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">Password is required</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold">
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSubmitting ? "Signing in…" : t("auth.login")}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-semibold">
              {t("auth.signup")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
