import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { billingApi } from "../../services/api";

const today = () => new Date().toISOString().split("T")[0];
const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
};

const EarningsPage = () => {
  const { user } = useAuth();
  const [allTx, setAllTx] = useState([]);
  const [filteredTx, setFilteredTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(monthStart());
  const [toDate, setToDate] = useState(today());
  const [view, setView] = useState("daily"); // daily | monthly

  // Initial load – all transactions
  useEffect(() => {
    (async () => {
      try {
        const res = await billingApi.getDoctorBilling(user.userId);
        setAllTx(res.data);
        setFilteredTx(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.userId]);

  // Apply date filter
  const applyFilter = useCallback(async () => {
    if (!fromDate || !toDate) return;
    try {
      setLoading(true);
      const res = await billingApi.getDoctorBillingByRange(
        user.userId,
        fromDate,
        toDate,
      );
      setFilteredTx(res.data);
    } catch (e) {
      console.error(e);
      // Fallback: client-side filter
      const f = new Date(fromDate).getTime();
      const t = new Date(toDate).getTime() + 86400000;
      setFilteredTx(
        allTx.filter((tx) => {
          const ts = new Date(tx.createdAt).getTime();
          return ts >= f && ts < t;
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, user.userId, allTx]);

  const clearFilter = () => {
    setFromDate(monthStart());
    setToDate(today());
    setFilteredTx(allTx);
  };

  // Totals
  const filteredTotal = useMemo(
    () => filteredTx.reduce((s, t) => s + Number(t.amount || 0), 0),
    [filteredTx],
  );
  const allTimeTotal = useMemo(
    () => allTx.reduce((s, t) => s + Number(t.amount || 0), 0),
    [allTx],
  );

  // Monthly breakdown
  const monthlyBreakdown = useMemo(() => {
    const map = {};
    filteredTx.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { month: key, total: 0, count: 0 };
      map[key].total += Number(tx.amount || 0);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.month.localeCompare(a.month));
  }, [filteredTx]);

  // Daily breakdown
  const dailyBreakdown = useMemo(() => {
    const map = {};
    filteredTx.forEach((tx) => {
      const key = new Date(tx.createdAt).toISOString().split("T")[0];
      if (!map[key]) map[key] = { date: key, total: 0, count: 0 };
      map[key].total += Number(tx.amount || 0);
      map[key].count += 1;
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredTx]);

  const formatMonth = (key) => {
    const [y, m] = key.split("-");
    return new Date(y, m - 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500">
          Track your consultation earnings over any period.
        </p>
      </header>

      {/* All-Time Card */}
      <section className="card space-y-1 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <p className="text-xs text-emerald-600 font-medium uppercase">
          All-Time Earnings
        </p>
        <p className="text-2xl font-bold text-emerald-700">
          ₹ {allTimeTotal.toFixed(2)}
        </p>
        <p className="text-xs text-emerald-500">
          {allTx.length} total transaction{allTx.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* Date Range Filter */}
      <section className="card space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Filter by Date Range
        </p>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-500">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              max={toDate}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-slate-500">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              min={fromDate}
              max={today()}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={applyFilter}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Apply Filter
          </button>
          <button
            onClick={clearFilter}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
            Reset
          </button>
        </div>
      </section>

      {/* Filtered Total */}
      <section className="card space-y-1">
        <p className="text-xs text-slate-500 font-medium uppercase">
          Filtered Earnings
        </p>
        <p className="text-2xl font-bold text-slate-900">
          ₹ {filteredTotal.toFixed(2)}
        </p>
        <p className="text-xs text-slate-500">
          {filteredTx.length} transaction{filteredTx.length !== 1 ? "s" : ""}{" "}
          from {new Date(fromDate).toLocaleDateString()} to{" "}
          {new Date(toDate).toLocaleDateString()}
        </p>
      </section>

      {/* View Toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden">
        <button
          onClick={() => setView("daily")}
          className={`flex-1 py-2 text-sm font-medium ${view === "daily" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>
          Daily
        </button>
        <button
          onClick={() => setView("monthly")}
          className={`flex-1 py-2 text-sm font-medium ${view === "monthly" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>
          Monthly
        </button>
      </div>

      {/* Breakdown Cards */}
      {view === "monthly" && (
        <section className="space-y-2">
          {monthlyBreakdown.length === 0 && !loading && (
            <p className="text-sm text-slate-500">
              No transactions in this period.
            </p>
          )}
          {monthlyBreakdown.map((m) => (
            <div
              key={m.month}
              className="card flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-slate-900">
                  {formatMonth(m.month)}
                </p>
                <p className="text-xs text-slate-500">
                  {m.count} transaction{m.count !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="font-bold text-emerald-600">
                ₹ {m.total.toFixed(2)}
              </p>
            </div>
          ))}
        </section>
      )}

      {view === "daily" && (
        <section className="space-y-2">
          {dailyBreakdown.length === 0 && !loading && (
            <p className="text-sm text-slate-500">
              No transactions in this period.
            </p>
          )}
          {dailyBreakdown.map((d) => (
            <div
              key={d.date}
              className="card flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-slate-900">
                  {new Date(d.date).toLocaleDateString("default", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-500">
                  {d.count} transaction{d.count !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="font-bold text-emerald-600">
                ₹ {d.total.toFixed(2)}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Transaction List */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-400">
          All Transactions
        </p>
        {loading && (
          <p className="text-sm text-slate-500">Loading transactions…</p>
        )}
        {!loading && filteredTx.length === 0 && (
          <p className="text-sm text-slate-500">No transactions found.</p>
        )}
        {filteredTx.map((tx) => (
          <div
            key={tx.id}
            className="card flex items-center justify-between text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900 truncate">
                {tx.patient?.user?.name || tx.description || "Consultation fee"}
              </p>
              <p className="text-xs text-slate-500">
                {tx.description || "Consultation"}
              </p>
              <p className="text-xs text-slate-400">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="font-semibold text-emerald-600">
                + ₹ {Number(tx.amount || 0).toFixed(2)}
              </p>
              <p
                className={`text-xs ${tx.status === "COMPLETED" ? "text-emerald-500" : tx.status === "PENDING" ? "text-amber-500" : "text-slate-400"}`}>
                {tx.status}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default EarningsPage;
