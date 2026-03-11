import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  signup: (data) => api.post("/auth/signup", data),
};

export const appointmentApi = {
  getByPatient: (id) => api.get(`/appointments/patient/${id}`),
  getByDoctor: (id) => api.get(`/appointments/doctor/${id}`),
  getById: (id) => api.get(`/appointments/${id}`),
  book: (data) => api.post("/appointments", data),
  updateStatus: (id, status) =>
    api.patch(`/appointments/${id}/status?status=${status}`),
  cancel: (id) => api.delete(`/appointments/${id}`),
  reschedule: (id, newDateTime, durationMinutes) =>
    api.patch(
      `/appointments/${id}/reschedule?newDateTime=${newDateTime}${durationMinutes ? `&durationMinutes=${durationMinutes}` : ""}`,
    ),
};

export const doctorApi = {
  getAll: () => api.get("/doctors"),
  getById: (id) => api.get(`/doctors/${id}`),
  getBySpecialty: (s) => api.get(`/doctors/specialty/${s}`),
  search: (params) => api.get("/doctors/search", { params }),
  getPatients: (doctorId) => api.get(`/doctors/${doctorId}/patients`),
  update: (id, data) => api.put(`/doctors/${id}`, data),
  getSpecialties: () => api.get("/doctors/specialties"),
};

export const patientApi = {
  getById: (id) => api.get(`/patients/${id}`),
  update: (id, data) => api.put(`/patients/${id}`, data),
};

export const chatApi = {
  getMessages: (appointmentId) => api.get(`/chat/${appointmentId}/messages`),
};

export const reportApi = {
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/reports/doctor/${doctorId}`),
  upload: (patientId, file, title, type = "LAB_REPORT") => {
    const formData = new FormData();
    formData.append("patientId", patientId);
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);
    return api.post("/reports/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  download: (reportId) =>
    api.get(`/reports/download/${reportId}`, { responseType: "blob" }),
  translate: (reportId, language) =>
    api.post(`/reports/${reportId}/translate?language=${language}`),
};

export const billingApi = {
  getPatientBilling: (patientId) => api.get(`/billing/patient/${patientId}`),
  getDoctorBilling: (doctorId) => api.get(`/billing/doctor/${doctorId}`),
  getDoctorBillingByRange: (doctorId, from, to) =>
    api.get(`/billing/doctor/${doctorId}/range`, { params: { from, to } }),
};

export const donationApi = {
  getActive: () => api.get("/donations/active"),
  create: (patientId, data) =>
    api.post(`/donations?patientId=${patientId}`, data),
  contribute: (id, amount) =>
    api.patch(`/donations/${id}/contribute`, { amount }),
  getPending: () => api.get("/donations/pending"),
  verify: (id) => api.patch(`/donations/${id}/verify`),
};

export const videoApi = {
  getToken: (data) => api.post("/video/token", data),
  getNote: (appointmentId) => api.get(`/video/notes/${appointmentId}`),
  saveNote: (appointmentId, content) =>
    api.post(`/video/notes/${appointmentId}`, { content }),
};

export const prescriptionApi = {
  create: (appointmentId, data) =>
    api.post(`/prescriptions/appointment/${appointmentId}`, data),
  getByPatient: (patientId) => api.get(`/prescriptions/patient/${patientId}`),
  getByDoctor: (doctorId) => api.get(`/prescriptions/doctor/${doctorId}`),
};

export const reviewApi = {
  create: (data) => api.post("/reviews", data),
  getByDoctor: (doctorId) => api.get(`/reviews/doctor/${doctorId}`),
  hasReviewed: (appointmentId) => api.get(`/reviews/check/${appointmentId}`),
};

export const statsApi = {
  getSummary: () => api.get("/stats/summary"),
};

export default api;
