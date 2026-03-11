import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSelect = (role) => {
    navigate("/signup", { state: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("app.name")}
          </h1>
          <p className="text-slate-500">{t("app.tagline")}</p>
        </div>
        <div className="bg-white shadow-md rounded-2xl p-6 space-y-4">
          <p className="text-center text-slate-600 text-sm font-medium uppercase tracking-wide">
            {t("auth.chooseRole")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => handleSelect("PATIENT")}
              className="border border-slate-200 rounded-xl px-4 py-6 flex flex-col items-center gap-2 hover:border-primary hover:shadow-sm transition-all">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                🧍
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                {t("auth.patient")}
              </span>
              <span className="text-xs text-slate-500 text-center">
                {t("auth.patientDesc")}
              </span>
            </button>
            <button
              onClick={() => handleSelect("DOCTOR")}
              className="border border-slate-200 rounded-xl px-4 py-6 flex flex-col items-center gap-2 hover:border-primary hover:shadow-sm transition-all">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary-50 text-secondary">
                🩺
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                {t("auth.doctor")}
              </span>
              <span className="text-xs text-slate-500 text-center">
                {t("auth.doctorDesc")}
              </span>
            </button>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full text-sm text-slate-500 hover:text-primary mt-2">
            {t("auth.login")} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
