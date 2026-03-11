import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { doctorApi } from "../../services/api";

const MyPatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await doctorApi.getPatients(user.userId);
        setPatients(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user.userId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q),
    );
  }, [patients, search]);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const calcAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">My Patients</h1>
        <p className="text-sm text-slate-500">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} consulted
          with on Doctime.
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search by name, email, phone, city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Patient list */}
      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading patients…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-500">
            {search ? "No patients match your search." : "No patients yet."}
          </p>
        )}
        {filtered.map((p) => {
          const age = calcAge(p.dateOfBirth);
          const isExpanded = expandedId === p.id;
          return (
            <div
              key={p.id}
              className="card overflow-hidden transition-all duration-200">
              {/* Header row – always visible */}
              <button
                onClick={() => toggle(p.id)}
                className="flex w-full items-center gap-3 text-left text-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                  {p.name?.[0]?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {p.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[p.gender, age != null ? `${age} yrs` : null, p.bloodGroup]
                      .filter(Boolean)
                      .join(" • ") || "No details"}
                  </p>
                </div>
                <svg
                  className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="mt-3 border-t border-slate-100 pt-3 space-y-3 text-sm">
                  {/* Contact */}
                  <Section title="Contact">
                    <Detail label="Email" value={p.email} />
                    <Detail label="Phone" value={p.phone} />
                    <Detail
                      label="Address"
                      value={
                        [p.address, p.city, p.state, p.country, p.pincode]
                          .filter(Boolean)
                          .join(", ") || null
                      }
                    />
                  </Section>

                  {/* Vitals */}
                  <Section title="Vitals">
                    <Detail
                      label="DOB"
                      value={
                        p.dateOfBirth
                          ? new Date(p.dateOfBirth).toLocaleDateString()
                          : null
                      }
                    />
                    <Detail label="Blood Group" value={p.bloodGroup} />
                    <Detail
                      label="Height"
                      value={p.height ? `${p.height} cm` : null}
                    />
                    <Detail
                      label="Weight"
                      value={p.weight ? `${p.weight} kg` : null}
                    />
                  </Section>

                  {/* Medical */}
                  <Section title="Medical Info">
                    <Detail label="Medical History" value={p.medicalHistory} />
                    <Detail label="Allergies" value={p.allergies} />
                  </Section>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase text-slate-400">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

const Detail = ({ label, value }) =>
  value ? (
    <p className="text-slate-600">
      <span className="font-medium text-slate-700">{label}:</span> {value}
    </p>
  ) : null;

export default MyPatientsPage;
