import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Heart,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  CreditCard,
  Smartphone,
  Building,
  Clock,
  Gift,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

function progressPercent(raised, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
  { value: 'UPI', label: 'UPI', icon: Smartphone },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building },
];

// ─── Preset donation amounts ──────────────────────────────────────────────────
const PRESET_AMOUNTS = [10, 25, 50, 100];

// ─── Toast ────────────────────────────────────────────────────────────────────
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

// ─── Skeletons ────────────────────────────────────────────────────────────────
function CampaignSkeleton() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="flex justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/4" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0" />
      </div>
      <div className="h-2 bg-gray-200 rounded-full" />
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-24" />
        <div className="h-3 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
  );
}

function DonationHistorySkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-4 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 bg-gray-200 rounded w-36" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-16 shrink-0" />
    </div>
  );
}

// ─── Donation Modal ───────────────────────────────────────────────────────────
function DonationModal({ campaign, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const finalAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);

  const validate = () => {
    const errs = {};
    if (!amount) {
      errs.amount = 'Please select or enter an amount.';
    } else if (amount === 'custom') {
      if (!customAmount || isNaN(parseFloat(customAmount))) {
        errs.amount = 'Please enter a valid amount.';
      } else if (parseFloat(customAmount) < 1) {
        errs.amount = 'Minimum donation is $1.';
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await axios.post('/api/donations', {
        campaignId: campaign.id,
        amount: finalAmount,
        paymentMethod,
      });
      onSuccess(finalAmount);
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Donation failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="donation-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 id="donation-modal-title" className="text-lg font-bold text-gray-900">
              Make a Donation
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{campaign.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Amount selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Select Amount
            </p>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(String(preset)); setCustomAmount(''); }}
                  className={`py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                    amount === String(preset)
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-gray-200 text-gray-600 hover:border-primary-200'
                  }`}
                  aria-pressed={amount === String(preset)}
                >
                  ${preset}
                </button>
              ))}
            </div>
            {/* Custom amount */}
            <button
              type="button"
              onClick={() => setAmount('custom')}
              className={`w-full py-2 rounded-xl border-2 text-sm font-medium transition-all mb-2 ${
                amount === 'custom'
                  ? 'border-primary bg-primary-50 text-primary'
                  : 'border-gray-200 text-gray-600 hover:border-primary-200'
              }`}
              aria-pressed={amount === 'custom'}
            >
              Custom Amount
            </button>
            {amount === 'custom' && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  $
                </span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  className={`input-field pl-8 ${errors.amount ? 'border-red-400' : ''}`}
                  aria-label="Custom donation amount"
                  autoFocus
                />
              </div>
            )}
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Payment Method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === value
                      ? 'border-primary bg-primary-50'
                      : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="sr-only"
                  />
                  <Icon
                    className={`w-5 h-5 shrink-0 ${paymentMethod === value ? 'text-primary' : 'text-gray-400'}`}
                    aria-hidden="true"
                  />
                  <span className={`text-sm font-medium ${paymentMethod === value ? 'text-primary' : 'text-gray-700'}`}>
                    {label}
                  </span>
                  {paymentMethod === value && (
                    <CheckCircle className="w-4 h-4 text-primary ml-auto" aria-hidden="true" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Total */}
          {finalAmount > 0 && !isNaN(finalAmount) && (
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
              <span className="text-sm text-gray-600">Total Donation</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(finalAmount)}</span>
            </div>
          )}

          {/* Submit error */}
          {errors.submit && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1 py-2.5 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Processing…' : 'Donate Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Campaign Card ─────────────────────────────────────────────────────────
function CampaignCard({ campaign, onDonate }) {
  const pct = progressPercent(campaign.raisedAmount, campaign.goalAmount);

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
          <Heart className="w-6 h-6 text-rose-500" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.title}</h3>
          {campaign.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{campaign.description}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium text-gray-800">
            {formatCurrency(campaign.raisedAmount)} raised
          </span>
          <span className="text-gray-500">Goal: {formatCurrency(campaign.goalAmount)}</span>
        </div>
        <div
          className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}% of goal raised`}
        >
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-semibold text-rose-500">{pct}% funded</span>
          {campaign.endDate && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              Ends {formatDate(campaign.endDate)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDonate(campaign)}
        className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
      >
        <Heart className="w-4 h-4" aria-hidden="true" />
        Donate Now
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonationsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [campaignsError, setCampaignsError] = useState(null);
  const [donationsError, setDonationsError] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const fetchCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    setCampaignsError(null);
    try {
      const res = await axios.get('/api/donations/campaigns');
      setCampaigns(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
    } catch {
      setCampaignsError('Failed to load campaigns. Please try again.');
    } finally {
      setLoadingCampaigns(false);
    }
  }, []);

  const fetchMyDonations = useCallback(async () => {
    setLoadingDonations(true);
    setDonationsError(null);
    try {
      const res = await axios.get('/api/donations/my');
      setMyDonations(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
    } catch {
      setDonationsError('Failed to load your donation history.');
    } finally {
      setLoadingDonations(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchMyDonations();
  }, [fetchCampaigns, fetchMyDonations]);

  const handleDonationSuccess = (amount) => {
    setActiveCampaign(null);
    showToast(`Thank you! Your donation of ${formatCurrency(amount)} has been received. 💚`, 'success');
    fetchCampaigns();
    fetchMyDonations();
  };

  const totalDonated = myDonations.reduce((s, d) => s + (d.amount ?? 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* ── Page header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Medical Donations
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Support healthcare for those who need it most.
              </p>
            </div>

            {/* ── How you can help ── */}
            <section className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Heart className="w-7 h-7 text-rose-500" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">How You Can Help</h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    Your donations help provide life-saving medical care, medicines, and treatments
                    to underserved communities. Every contribution, big or small, makes a real difference.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { icon: Target, label: 'Fund Treatments', desc: 'Cover medical procedures' },
                      { icon: Gift, label: 'Medical Supplies', desc: 'Equipment and medicines' },
                      { icon: TrendingUp, label: 'Long-term Care', desc: 'Support ongoing therapy' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                        <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-rose-500" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Active campaigns ── */}
            <section aria-labelledby="campaigns-heading">
              <h2 id="campaigns-heading" className="text-xl font-bold text-gray-900 mb-4">
                Active Campaigns
              </h2>

              {campaignsError && (
                <div className="card flex items-center gap-3 border border-red-100 bg-red-50 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-600 flex-1">{campaignsError}</p>
                  <button
                    onClick={fetchCampaigns}
                    className="text-xs font-medium text-red-600 hover:text-red-700 underline shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loadingCampaigns ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <CampaignSkeleton key={i} />)}
                </div>
              ) : campaigns.length === 0 ? (
                <div className="card text-center py-14">
                  <Heart className="w-14 h-14 text-gray-200 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-gray-600 font-medium">No active campaigns right now</p>
                  <p className="text-gray-400 text-sm mt-1">Check back soon for new campaigns.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {campaigns.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onDonate={setActiveCampaign}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── My donation history ── */}
            <section aria-labelledby="history-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="history-heading" className="text-xl font-bold text-gray-900">
                  My Donations
                </h2>
                {totalDonated > 0 && (
                  <div className="flex items-center gap-1.5 bg-secondary-50 text-secondary px-3 py-1.5 rounded-full">
                    <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span className="text-sm font-semibold">
                      Total: {formatCurrency(totalDonated)}
                    </span>
                  </div>
                )}
              </div>

              {donationsError && (
                <div className="card flex items-center gap-3 border border-red-100 bg-red-50 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-600 flex-1">{donationsError}</p>
                  <button
                    onClick={fetchMyDonations}
                    className="text-xs font-medium text-red-600 hover:text-red-700 underline shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loadingDonations ? (
                  <>{[1, 2, 3].map((i) => <DonationHistorySkeleton key={i} />)}</>
                ) : myDonations.length === 0 ? (
                  <div className="text-center py-14">
                    <Gift className="w-14 h-14 text-gray-200 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-600 font-medium">You haven't donated yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Choose a campaign above and make your first donation.
                    </p>
                  </div>
                ) : (
                  myDonations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4 text-rose-500" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {donation.campaignTitle ?? donation.campaign ?? 'Donation'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(donation.date ?? donation.createdAt)}
                          {donation.paymentMethod && (
                            <span className="ml-2 text-gray-300">·</span>
                          )}
                          {donation.paymentMethod && (
                            <span className="ml-1">
                              {PAYMENT_METHODS.find((m) => m.value === donation.paymentMethod)?.label ?? donation.paymentMethod}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-800 shrink-0">
                        {formatCurrency(donation.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>
        </main>
      </div>

      <BottomNav />

      {activeCampaign && (
        <DonationModal
          campaign={activeCampaign}
          onClose={() => setActiveCampaign(null)}
          onSuccess={handleDonationSuccess}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}
