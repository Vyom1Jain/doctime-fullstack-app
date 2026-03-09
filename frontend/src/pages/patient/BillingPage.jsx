import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  CreditCard,
  Receipt,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Status config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PAID: {
    label: 'Paid',
    classes: 'bg-green-50 text-green-600 border-green-100',
    icon: CheckCircle,
  },
  PENDING: {
    label: 'Pending',
    classes: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: Clock,
  },
  OVERDUE: {
    label: 'Overdue',
    classes: 'bg-red-50 text-red-600 border-red-100',
    icon: XCircle,
  },
};

function statusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount ?? 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium max-w-sm ${
        isSuccess ? 'bg-secondary' : 'bg-red-500'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      )}
      {toast.message}
    </div>
  );
}

// ─── Summary Skeleton ─────────────────────────────────────────────────────
function SummarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Bill Row Skeleton ────────────────────────────────────────────────────
function BillSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-36" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-200 rounded-full w-16 shrink-0" />
      <div className="h-6 bg-gray-200 rounded w-16 shrink-0 hidden sm:block" />
      <div className="h-8 bg-gray-200 rounded-lg w-20 shrink-0" />
    </div>
  );
}

// ─── Bill Row ─────────────────────────────────────────────────────────────
function BillRow({ bill, onPay, paying }) {
  const { label, classes, icon: StatusIcon } = statusConfig(bill.status);
  const isPending = bill.status === 'PENDING' || bill.status === 'OVERDUE';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">
          {bill.service ?? 'Medical Service'}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">
          Dr. {bill.doctorName ?? '—'} · {formatDate(bill.date)}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border self-start sm:self-auto shrink-0 ${classes}`}
      >
        <StatusIcon className="w-3 h-3" aria-hidden="true" />
        {label}
      </span>

      {/* Amount */}
      <span className="font-semibold text-gray-800 shrink-0 hidden sm:block">
        {formatCurrency(bill.amount)}
      </span>

      {/* Amount mobile */}
      <span className="font-semibold text-gray-800 shrink-0 sm:hidden text-sm">
        {formatCurrency(bill.amount)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isPending && (
          <button
            onClick={() => onPay(bill)}
            disabled={paying === bill.id}
            className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label={`Pay ${formatCurrency(bill.amount)} for ${bill.service ?? 'this bill'}`}
          >
            {paying === bill.id && <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />}
            Pay Now
          </button>
        )}
        <button
          onClick={() => alert('Invoice download coming soon.')}
          className="p-2 text-gray-400 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
          aria-label="Download invoice"
          title="Download invoice"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/billing');
      setBills(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
    } catch {
      setError('Failed to load billing data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const handlePay = async (bill) => {
    setPayingId(bill.id);
    try {
      // Placeholder payment — update status optimistically, then sync
      await axios.patch(`/api/billing/${bill.id}/pay`);
      setBills((prev) =>
        prev.map((b) => (b.id === bill.id ? { ...b, status: 'PAID' } : b))
      );
      showToast(`Payment of ${formatCurrency(bill.amount)} successful!`, 'success');
    } catch {
      showToast('Payment failed. Please try again.', 'error');
    } finally {
      setPayingId(null);
    }
  };

  // Derived summary stats
  const total = bills.reduce((s, b) => s + (b.amount ?? 0), 0);
  const paid = bills.filter((b) => b.status === 'PAID').reduce((s, b) => s + (b.amount ?? 0), 0);
  const pending = bills.filter((b) => b.status !== 'PAID').reduce((s, b) => s + (b.amount ?? 0), 0);

  const paidBills = bills.filter((b) => b.status === 'PAID');
  const unpaidBills = bills.filter((b) => b.status !== 'PAID');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Page header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Billing &amp; Payments
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manage your invoices and payment history.
              </p>
            </div>

            {/* ── Summary cards ── */}
            {loading ? (
              <SummarySkeleton />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Billed</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Paid</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(paid)}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <DollarSign className="w-5 h-5 text-amber-500" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Outstanding</p>
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(pending)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Error ── */}
            {error && (
              <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                <p className="text-sm text-red-600 flex-1">{error}</p>
                <button
                  onClick={fetchBills}
                  className="text-xs font-medium text-red-600 hover:text-red-700 underline shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* ── Pending / Overdue Bills ── */}
            {!loading && !error && (
              <section aria-labelledby="pending-bills-heading">
                <h2 id="pending-bills-heading" className="text-lg font-semibold text-gray-800 mb-3">
                  Outstanding Bills
                </h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {loading ? (
                    <>{[1, 2].map((i) => <BillSkeleton key={i} />)}</>
                  ) : unpaidBills.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-gray-600 font-medium">All caught up!</p>
                      <p className="text-gray-400 text-sm mt-1">You have no outstanding payments.</p>
                    </div>
                  ) : (
                    unpaidBills.map((bill) => (
                      <BillRow
                        key={bill.id}
                        bill={bill}
                        onPay={handlePay}
                        paying={payingId}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            {/* ── Payment History ── */}
            {!loading && !error && (
              <section aria-labelledby="payment-history-heading">
                <h2 id="payment-history-heading" className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  Payment History
                </h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {loading ? (
                    <>{[1, 2, 3].map((i) => <BillSkeleton key={i} />)}</>
                  ) : paidBills.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-gray-500 font-medium">No payment history yet</p>
                    </div>
                  ) : (
                    paidBills.map((bill) => (
                      <BillRow
                        key={bill.id}
                        bill={bill}
                        onPay={handlePay}
                        paying={payingId}
                      />
                    ))
                  )}
                </div>
              </section>
            )}

            {/* Loading skeleton for bills */}
            {loading && (
              <section>
                <div className="h-6 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {[1, 2, 3, 4].map((i) => <BillSkeleton key={i} />)}
                </div>
              </section>
            )}

          </div>
        </main>
      </div>

      <BottomNav />
      <Toast toast={toast} />
    </div>
  );
}
