import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { prescriptionApi } from "../../services/api";

const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await prescriptionApi.getByPatient(user.userId);
        setPrescriptions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user.userId]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">My Prescriptions</h1>
        <p className="text-sm text-slate-500">
          Prescriptions from your consultations.
        </p>
      </header>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {!loading && prescriptions.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-sm text-slate-500">No prescriptions yet.</p>
        </div>
      )}

      {prescriptions.map((rx) => (
        <div key={rx.id} className="card space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm text-slate-900">
                {rx.diagnosis}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Dr. {rx.doctor?.user?.name || rx.doctor?.name || "Doctor"}
              </p>
            </div>
            <p className="text-[10px] text-slate-400">
              {rx.createdAt &&
                new Date(rx.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
            </p>
          </div>

          {rx.medicines && rx.medicines.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-700">Medicines</p>
              {rx.medicines.map((med, idx) => (
                <div
                  key={med.id || idx}
                  className="bg-slate-50 rounded-lg p-2 text-xs space-y-0.5">
                  <p className="font-medium text-slate-900">{med.name}</p>
                  <p className="text-slate-500">
                    {med.dosage} · {med.frequency} · {med.duration}
                  </p>
                  {med.instructions && (
                    <p className="text-slate-400 italic">{med.instructions}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {rx.generalAdvice && (
            <div>
              <p className="text-xs font-medium text-slate-700">Advice</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {rx.generalAdvice}
              </p>
            </div>
          )}

          {rx.nextVisit && (
            <p className="text-xs text-slate-500">
              <span className="font-medium">Next visit:</span> {rx.nextVisit}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PrescriptionsPage;
