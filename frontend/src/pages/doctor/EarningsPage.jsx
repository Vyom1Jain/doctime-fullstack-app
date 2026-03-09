import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  AlertCircle,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Filter options ───────────────────────────────────────────────────────────
const FILTERS = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'All Time', value: 'all' },
];

// ─── Skeletons ────────────────────────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-7 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center gap-3 px-6 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-16 shrink-0" />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function filterTransactions(transactions, filter) {
  const now = new Date();
  return transactions.filter((tx) => {
    const d = new Date(tx.date ?? tx.createdAt);
    if (isNaN(d)) return filter === 'all';
    switch (filter) {
      case 'week': {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        return d >= start;
      }
      case 'month':
        return (
          d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        );
      case '3months': {
        const cutoff = new Date(now);
        cutoff.setMonth(now.getMonth() - 3);
        return d >= cutoff;
      }
      default:
        return true;
    }
  });
}

function buildChartData(transactions) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: d.toLocaleDateString(undefined, { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      total: 0,
    };
  });

  transactions.forEach((tx) => {
    const d = new Date(tx.date ?? tx.createdAt);
    if (isNaN(d)) return;
    const entry = months.find(
      (m) => m.month === d.getMonth() && m.year === d.getFullYear(),
    );
    if (entry) entry.total += tx.amount ?? 0;
  });

  return months;
}

const STATUS_CLASSES = {
  COMPLETED: 'bg-green-50 text-green-600',
  PENDING: 'bg-amber-50 text-amber-600',
  CANCELLED: 'bg-red-50 text-red-500',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function EarningsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('month');

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/doctor/earnings');
      const data = res.data;
      setTransactions(Array.isArray(data) ? data : (data.transactions ?? []));
    } catch {
      setError('Failed to load earnings data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const filtered = useMemo(
    () => filterTransactions(transactions, activeFilter),
    [transactions, activeFilter],
  );
  const chartData = useMemo(() => buildChartData(transactions), [transactions]);
  const maxChart = useMemo(
    () => Math.max(...chartData.map((d) => d.total), 1),
    [chartData],
  );

  const totalEarned = useMemo(
    () => transactions.reduce((s, tx) => s + (tx.amount ?? 0), 0),
    [transactions],
  );
  const monthEarned = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((tx) => {
        const d = new Date(tx.date ?? tx.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, tx) => s + (tx.amount ?? 0), 0);
  }, [transactions]);
  const pendingAmount = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status === 'PENDING')
        .reduce((s, tx) => s + (tx.amount ?? 0), 0),
    [transactions],
  );
  const completedCount = useMemo(
    () => transactions.filter((tx) => tx.status === 'COMPLETED').length,
    [transactions],
  );

  const handleExport = () => {
    const headers = ['Patient', 'Date', 'Type', 'Amount', 'Status'];
    const rows = filtered.map((tx) => [
      tx.patientName ?? '—',
      tx.date ?? tx.createdAt ?? '—',
      tx.type ?? '—',
      (tx.amount ?? 0).toFixed(2),
      tx.status ?? '—',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-${activeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      label: 'Total Earned',
      value: `$${totalEarned.toFixed(2)}`,
      icon: DollarSign,
      bg: 'bg-blue-50',
      fg: 'text-blue-600',
    },
    {
      label: 'This Month',
      value: `$${monthEarned.toFixed(2)}`,
      icon: TrendingUp,
      bg: 'bg-emerald-50',
      fg: 'text-emerald-600',
    },
    {
      label: 'Pending',
      value: `$${pendingAmount.toFixed(2)}`,
      icon: Clock,
      bg: 'bg-amber-50',
      fg: 'text-amber-600',
    },
    {
      label: 'Completed',
      value: completedCount,
      icon: CheckCircle2,
      bg: 'bg-purple-50',
      fg: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Earnings</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Track your consultation revenue.
                </p>
              </div>
              <button
                onClick={handleExport}
                disabled={loading || filtered.length === 0}
                className="flex items-center gap-2 btn-outline py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Export transactions as CSV"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Export CSV
              </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
                : statCards.map(({ label, value, icon: Icon, bg, fg }) => (
                    <div key={label} className="card">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                        >
                          <Icon className={`w-5 h-5 ${fg}`} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
                            {label}
                          </p>
                          <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>

            {/* ── Earnings bar chart (last 6 months) ── */}
            {!loading && transactions.length > 0 && (
              <div className="card">
                <h2 className="text-base font-semibold text-gray-800 mb-5">
                  Earnings Overview — Last 6 Months
                </h2>
                <div
                  className="flex items-end gap-2 h-36"
                  role="img"
                  aria-label="Bar chart of monthly earnings"
                >
                  {chartData.map(({ label, total }) => {
                    const heightPct = total > 0 ? Math.max((total / maxChart) * 100, 5) : 0;
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500 font-medium h-4 text-center">
                          {total > 0
                            ? `$${total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}`
                            : ''}
                        </span>
                        <div className="w-full flex-1 flex items-end">
                          <div
                            className="w-full rounded-t-md bg-primary transition-all duration-500"
                            style={{ height: `${heightPct}%` }}
                            title={`${label}: $${total.toFixed(2)}`}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Filter tabs ── */}
            <div className="flex items-center gap-2 flex-wrap">
              {FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActiveFilter(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeFilter === value
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                  aria-pressed={activeFilter === value}
                >
                  {label}
                </button>
              ))}
              <span className="text-xs text-gray-400 ml-auto">
                {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* ── Transactions ── */}
            {loading ? (
              <div className="card p-0 overflow-hidden divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TransactionSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchEarnings}
                  className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 underline"
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-14">
                <CalendarDays
                  className="w-14 h-14 text-gray-200 mx-auto mb-3"
                  aria-hidden="true"
                />
                <p className="text-gray-600 font-medium">No transactions found</p>
                <p className="text-gray-400 text-sm mt-1">
                  No earnings recorded for the selected period.
                </p>
              </div>
            ) : (
              <div className="card p-0 overflow-hidden">
                {/* Table header — desktop only */}
                <div className="hidden sm:grid grid-cols-[1fr_140px_120px_100px_100px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Patient</span>
                  <span>Date</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>

                <ul className="divide-y divide-gray-100" role="list">
                  {filtered.map((tx, i) => {
                    const txDate = tx.date ?? tx.createdAt;
                    const formattedDate = txDate
                      ? new Date(txDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—';
                    const statusClass =
                      STATUS_CLASSES[tx.status] ?? 'bg-gray-100 text-gray-500';

                    return (
                      <li
                        key={tx.id ?? i}
                        className="px-6 py-4 flex items-center gap-3 sm:grid sm:grid-cols-[1fr_140px_120px_100px_100px]"
                      >
                        {/* Patient */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {(tx.patientName ?? 'P').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {tx.patientName ?? '—'}
                            </p>
                            <p className="text-xs text-gray-400 sm:hidden">{formattedDate}</p>
                          </div>
                        </div>

                        {/* Date */}
                        <span className="hidden sm:block text-sm text-gray-500 shrink-0">
                          {formattedDate}
                        </span>

                        {/* Type */}
                        <span className="hidden sm:block text-sm text-gray-500 shrink-0 capitalize">
                          {(tx.type ?? 'Consultation').toLowerCase()}
                        </span>

                        {/* Amount */}
                        <span className="text-sm font-semibold text-gray-900 shrink-0 ml-auto sm:ml-0">
                          ${(tx.amount ?? 0).toFixed(2)}
                        </span>

                        {/* Status */}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusClass}`}
                        >
                          {tx.status ?? 'PENDING'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
