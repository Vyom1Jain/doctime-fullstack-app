import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import RoleSelectionPage from './pages/RoleSelectionPage'
import PatientDashboard from './pages/patient/PatientDashboard'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import FindDoctor from './pages/patient/FindDoctor'
import AppointmentsPage from './pages/AppointmentsPage'
import ChatPage from './pages/ChatPage'
import VideoCallPage from './pages/VideoCallPage'
import BillingPage from './pages/patient/BillingPage'
import ReportsPage from './pages/patient/ReportsPage'
import DonationsPage from './pages/patient/DonationsPage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import MyPatientsPage from './pages/doctor/MyPatientsPage'
import PrescriptionPage from './pages/doctor/PrescriptionPage'
import EarningsPage from './pages/doctor/EarningsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Patient Routes */}
            <Route element={<ProtectedRoute roles={['PATIENT']} />}>
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/patient/find-doctor" element={<FindDoctor />} />
              <Route path="/patient/billing" element={<BillingPage />} />
              <Route path="/patient/reports" element={<ReportsPage />} />
              <Route path="/patient/donations" element={<DonationsPage />} />
            </Route>
            
            {/* Doctor Routes */}
            <Route element={<ProtectedRoute roles={['DOCTOR']} />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<MyPatientsPage />} />
              <Route path="/doctor/prescription/:appointmentId" element={<PrescriptionPage />} />
              <Route path="/doctor/earnings" element={<EarningsPage />} />
            </Route>
            
            {/* Shared Routes */}
            <Route element={<ProtectedRoute roles={['PATIENT', 'DOCTOR']} />}>
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/chat/:appointmentId" element={<ChatPage />} />
              <Route path="/video/:appointmentId" element={<VideoCallPage />} />
              <Route path="/profile" element={<ProfileSettingsPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
