import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { billingApi } from "../../services/api";

const BillingPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await billingApi.getPatientBilling(user.userId);
        setTransactions(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, [user.userId]);

  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500">
          View your payments and consultation history.
        </p>
      </header>
      <section className="card space-y-1">
        <p className="text-xs text-slate-500 font-medium uppercase">
          Total spent
        </p>
        <p className="text-2xl font-bold text-slate-900">
          ₹ {total.toFixed(2)}
        </p>
      </section>
      <main className="space-y-3">
        {loading && (
          <p className="text-sm text-slate-500">Loading transactions…</p>
        )}
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-slate-500">No transactions yet.</p>
        )}
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="card flex items-center justify-between text-sm">
            <div>
              <p className="font-semibold text-slate-900">
                {tx.description || "Consultation payment"}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">
                ₹ {Number(tx.amount || 0).toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">{tx.status}</p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default BillingPage;
