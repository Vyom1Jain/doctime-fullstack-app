import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
}

export const appointmentApi = {
  getByPatient: (id) => api.get(`/appointments/patient/${id}`),
  getByDoctor: (id) => api.get(`/appointments/doctor/${id}`),
  getById: (id) => api.get(`/appointments/${id}`),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status?status=${status}`),
  cancel: (id) => api.delete(`/appointments/${id}`),
}

export const doctorApi = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getBySpecialty: (s) => api.get(`/doctors/specialty/${s}`),
  search: (maxFee) => api.get(`/doctors/search?maxFee=${maxFee}`),
  getPatients: (doctorId) => api.get(`/doctors/${doctorId}/patients`),
}

export const chatApi = {
  getMessages: (appointmentId) => api.get(`/chat/${appointmentId}/messages`),
}

export const reportApi = {
  getByPatient: (patientId) => api.get(`/reports/patient/${patientId}`),
  translate: (reportId, language) => api.post(`/reports/${reportId}/translate?language=${language}`),
}

export const billingApi = {
  getPatientBilling: (patientId) => api.get(`/billing/patient/${patientId}`),
  getDoctorBilling: (doctorId) => api.get(`/billing/doctor/${doctorId}`),
}

export const donationApi = {
  getActive: () => api.get('/donations/active'),
}

export const videoApi = {
  getToken: (data) => api.post('/video/token', data),
  getNote: (appointmentId) => api.get(`/video/notes/${appointmentId}`),
  saveNote: (appointmentId, content) => api.post(`/video/notes/${appointmentId}`, { content }),
}

export const prescriptionApi = {
  create: (appointmentId, data) => api.post(`/prescriptions/appointment/${appointmentId}`, data),
}

export default api
