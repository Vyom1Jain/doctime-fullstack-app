import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  FileText,
  Upload,
  Eye,
  Languages,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  File,
  Image as ImageIcon,
  FilePlus,
  Calendar,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';

// ─── Constants ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
];

const ACCEPTED_TYPES = '.pdf,.jpg,.jpeg,.png,.webp';
const MAX_FILE_SIZE_MB = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fileIcon(report) {
  const name = (report.fileName ?? report.name ?? '').toLowerCase();
  if (name.endsWith('.pdf')) return FileText;
  if (name.match(/\.(jpg|jpeg|png|webp|gif)$/)) return ImageIcon;
  return File;
}

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

// ─── Report Skeleton ─────────────────────────────────────────────────────────
function ReportSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="h-3 bg-gray-200 rounded w-28" />
      </div>
      <div className="flex gap-2 shrink-0">
        <div className="h-8 w-16 bg-gray-200 rounded-lg" />
        <div className="h-8 w-20 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────
function ViewModal({ report, onClose }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const fileUrl = report.fileUrl ?? report.url;
  const isPdf = (report.fileName ?? '').toLowerCase().endsWith('.pdf');

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="view-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 id="view-modal-title" className="text-lg font-bold text-gray-900 truncate">
              {report.title ?? report.name ?? 'Report'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{formatDate(report.date ?? report.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                title={report.title ?? 'Report'}
                className="w-full h-96 rounded-lg border border-gray-200"
              />
            ) : (
              <img
                src={fileUrl}
                alt={report.title ?? 'Report'}
                className="max-w-full rounded-lg mx-auto"
              />
            )
          ) : (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p className="text-sm">Preview not available</p>
            </div>
          )}

          {report.description && (
            <p className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">
              {report.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Translate Modal ──────────────────────────────────────────────────────────
function TranslateModal({ report, onClose }) {
  const [targetLang, setTargetLang] = useState('hi');
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(null);
  const [error, setError] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleTranslate = async () => {
    setTranslating(true);
    setError(null);
    setTranslated(null);
    try {
      const res = await axios.post(`/api/reports/${report.id}/translate`, {
        targetLanguage: targetLang,
      });
      setTranslated(res.data?.translatedText ?? res.data?.text ?? JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.message ?? 'Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="translate-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 id="translate-modal-title" className="text-lg font-bold text-gray-900">
              Translate Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-5">
          <p className="text-sm text-gray-500">
            Translating: <span className="font-medium text-gray-700">{report.title ?? report.name}</span>
          </p>

          {/* Language selector */}
          <div>
            <label htmlFor="translate-lang" className="block text-sm font-medium text-gray-700 mb-1.5">
              Target Language
            </label>
            <select
              id="translate-lang"
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                setTranslated(null);
                setError(null);
              }}
              className="input-field"
            >
              {LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTranslate}
            disabled={translating}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {translating && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {translating ? 'Translating…' : 'Translate'}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Translated output */}
          {translated && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                {LANGUAGES.find((l) => l.code === targetLang)?.label ?? targetLang}
              </p>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {translated}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Section ───────────────────────────────────────────────────────────
function UploadSection({ onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: `File must be under ${MAX_FILE_SIZE_MB} MB.` }));
      return;
    }
    setErrors((prev) => ({ ...prev, file: undefined }));
    setFile(f);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!file) errs.file = 'Please select a file.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());

    try {
      await axios.post('/api/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess();
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Upload failed. Please try again.';
      setErrors({ submit: msg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <section aria-labelledby="upload-heading" className="card">
      <h2 id="upload-heading" className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FilePlus className="w-5 h-5 text-primary" aria-hidden="true" />
        Upload Medical Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Title */}
        <div>
          <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-1.5">
            Report Title <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            id="report-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Blood Test Report – Jan 2025"
            className={`input-field ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
            aria-required="true"
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="text-xs text-red-500 mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="report-desc" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <textarea
            id="report-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any notes about this report…"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* File input */}
        <div>
          <label htmlFor="report-file" className="block text-sm font-medium text-gray-700 mb-1.5">
            File <span className="text-red-500" aria-hidden="true">*</span>
            <span className="text-gray-400 text-xs ml-1">(PDF or image, max {MAX_FILE_SIZE_MB} MB)</span>
          </label>

          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              errors.file
                ? 'border-red-300 bg-red-50'
                : file
                ? 'border-secondary bg-green-50'
                : 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary-50'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
            role="button"
            tabIndex={0}
            aria-label="Click to select file"
          >
            <input
              ref={fileInputRef}
              id="report-file"
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="sr-only"
              aria-required="true"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-400 hover:text-gray-600 ml-1"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-primary">Click to upload</span> or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to {MAX_FILE_SIZE_MB} MB</p>
              </>
            )}
          </div>
          {errors.file && (
            <p className="text-xs text-red-500 mt-1">{errors.file}</p>
          )}
        </div>

        {/* Submit error */}
        {errors.submit && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" aria-hidden="true" />
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" aria-hidden="true" />
              Upload Report
            </>
          )}
        </button>
      </form>
    </section>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewReport, setViewReport] = useState(null);
  const [translateReport, setTranslateReport] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/reports');
      setReports(Array.isArray(res.data) ? res.data : res.data?.content ?? []);
    } catch {
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleUploadSuccess = () => {
    showToast('Report uploaded successfully!', 'success');
    fetchReports();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* ── Page header ── */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Medical Reports</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Upload, view, and translate your medical reports.
              </p>
            </div>

            {/* ── Upload section ── */}
            <UploadSection onUploadSuccess={handleUploadSuccess} />

            {/* ── Reports list ── */}
            <section aria-labelledby="reports-list-heading">
              <h2 id="reports-list-heading" className="text-lg font-semibold text-gray-800 mb-3">
                Your Reports
              </h2>

              {/* Error */}
              {error && (
                <div className="card flex items-center gap-3 border border-red-100 bg-red-50">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-red-600 flex-1">{error}</p>
                  <button
                    onClick={fetchReports}
                    className="text-xs font-medium text-red-600 hover:text-red-700 underline shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                  <>{[1, 2, 3].map((i) => <ReportSkeleton key={i} />)}</>
                ) : reports.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-14 h-14 text-gray-200 mx-auto mb-4" aria-hidden="true" />
                    <p className="text-gray-600 font-medium">No reports yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Upload your first medical report above.
                    </p>
                  </div>
                ) : (
                  reports.map((report) => {
                    const ReportIcon = fileIcon(report);
                    return (
                      <div
                        key={report.id}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                          <ReportIcon className="w-5 h-5 text-primary" aria-hidden="true" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {report.title ?? report.name ?? 'Report'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" aria-hidden="true" />
                              {formatDate(report.date ?? report.createdAt)}
                            </span>
                            {report.doctorName && (
                              <span className="text-xs text-gray-400">
                                Dr. {report.doctorName}
                              </span>
                            )}
                            {report.type && (
                              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                {report.type}
                              </span>
                            )}
                          </div>
                          {report.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate">
                              {report.description}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setViewReport(report)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary bg-gray-100 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                            aria-label={`View report: ${report.title ?? report.name}`}
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            View
                          </button>
                          <button
                            onClick={() => setTranslateReport(report)}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-primary bg-gray-100 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                            aria-label={`Translate report: ${report.title ?? report.name}`}
                          >
                            <Languages className="w-3.5 h-3.5" aria-hidden="true" />
                            Translate
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>
        </main>
      </div>

      <BottomNav />

      {viewReport && (
        <ViewModal report={viewReport} onClose={() => setViewReport(null)} />
      )}
      {translateReport && (
        <TranslateModal report={translateReport} onClose={() => setTranslateReport(null)} />
      )}

      <Toast toast={toast} />
    </div>
  );
}
