import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { reportApi } from "../../services/api";

const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadType, setUploadType] = useState("LAB_REPORT");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 10MB");
      e.target.value = "";
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Only PDF, JPEG, PNG, DOC, and DOCX files are allowed");
      e.target.value = "";
      return;
    }
    setUploadFile(file);
  };

  const isDoctor = user.role === "DOCTOR";

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = isDoctor
          ? await reportApi.getByDoctor(user.userId)
          : await reportApi.getByPatient(user.userId);
        setReports(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [user.userId]);

  const handleTranslate = async (id, lang) => {
    try {
      const res = await reportApi.translate(id, lang);
      setReports((prev) => prev.map((r) => (r.id === id ? res.data : r)));
    } catch (e) {
      console.error(e);
      alert("Translation is not available yet.");
    }
  };

  const handleDownload = async (report) => {
    try {
      const res = await reportApi.download(report.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.fileName || "report");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to download report");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      const res = await reportApi.upload(
        user.userId,
        uploadFile,
        uploadTitle,
        uploadType,
      );
      setReports((prev) => [res.data, ...prev]);
      setShowUpload(false);
      setUploadTitle("");
      setUploadFile(null);
      setUploadType("LAB_REPORT");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-4 pb-20 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isDoctor ? "Patient Reports" : "My reports"}
          </h1>
          <p className="text-sm text-slate-500">
            {isDoctor
              ? "View reports from your patients."
              : "View and translate your uploaded reports."}
          </p>
        </div>
        {!isDoctor && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary text-sm px-3 py-1.5">
            {showUpload ? "Cancel" : "+ Upload"}
          </button>
        )}
      </header>

      {!isDoctor && showUpload && (
        <form onSubmit={handleUpload} className="card space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Report title *
            </label>
            <input
              className="input-field"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Type</label>
            <select
              className="input-field"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}>
              <option value="LAB_REPORT">Lab Report</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="IMAGING">Imaging</option>
              <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">File *</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileChange}
              required
              className="text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary w-full text-sm">
            {uploading ? "Uploading…" : "Upload report"}
          </button>
        </form>
      )}

      <main className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading reports…</p>}
        {!loading && reports.length === 0 && (
          <p className="text-sm text-slate-500">No reports uploaded.</p>
        )}
        {reports.map((r) => (
          <div key={r.id} className="card space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{r.title}</p>
                <p className="text-xs text-slate-500">{r.type}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(r)}
                  className="text-xs text-primary font-medium">
                  Download
                </button>
                <button
                  onClick={() => handleTranslate(r.id, "hi")}
                  className="text-xs text-primary font-medium">
                  Translate to Hindi
                </button>
              </div>
            </div>
            {r.translatedText && (
              <div className="mt-2 p-2 rounded-lg bg-slate-50 text-xs text-slate-700 max-h-40 overflow-y-auto">
                {r.translatedText}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default ReportsPage;
