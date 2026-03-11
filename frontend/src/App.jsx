import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppShell from "./components/AppShell";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import FindDoctor from "./pages/patient/FindDoctor";
import AppointmentsPage from "./pages/AppointmentsPage";
import ChatPage from "./pages/ChatPage";
import VideoCallPage from "./pages/VideoCallPage";
import BillingPage from "./pages/patient/BillingPage";
import ReportsPage from "./pages/patient/ReportsPage";
import DonationsPage from "./pages/patient/DonationsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import MyPatientsPage from "./pages/doctor/MyPatientsPage";
import PrescriptionPage from "./pages/doctor/PrescriptionPage";
import EarningsPage from "./pages/doctor/EarningsPage";
import DoctorProfilePage from "./pages/doctor/DoctorProfilePage";
import PrescriptionsPage from "./pages/patient/PrescriptionsPage";
import HelpPage from "./pages/HelpPage";

const Shell = ({ children }) => <AppShell>{children}</AppShell>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RoleSelectionPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Patient */}
            <Route element={<ProtectedRoute roles={["PATIENT"]} />}>
              <Route
                path="/patient/dashboard"
                element={
                  <Shell>
                    <PatientDashboard />
                  </Shell>
                }
              />
              <Route
                path="/patient/find-doctor"
                element={
                  <Shell>
                    <FindDoctor />
                  </Shell>
                }
              />
              <Route
                path="/patient/billing"
                element={
                  <Shell>
                    <BillingPage />
                  </Shell>
                }
              />
              <Route
                path="/patient/reports"
                element={
                  <Shell>
                    <ReportsPage />
                  </Shell>
                }
              />
              <Route
                path="/patient/prescriptions"
                element={
                  <Shell>
                    <PrescriptionsPage />
                  </Shell>
                }
              />
            </Route>

            {/* Doctor */}
            <Route element={<ProtectedRoute roles={["DOCTOR"]} />}>
              <Route
                path="/doctor/dashboard"
                element={
                  <Shell>
                    <DoctorDashboard />
                  </Shell>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <Shell>
                    <MyPatientsPage />
                  </Shell>
                }
              />
              <Route
                path="/doctor/prescription/:appointmentId"
                element={
                  <Shell>
                    <PrescriptionPage />
                  </Shell>
                }
              />
              <Route
                path="/doctor/earnings"
                element={
                  <Shell>
                    <EarningsPage />
                  </Shell>
                }
              />
              <Route
                path="/doctor/edit-profile"
                element={
                  <Shell>
                    <DoctorProfilePage />
                  </Shell>
                }
              />
              <Route
                path="/doctor/reports"
                element={
                  <Shell>
                    <ReportsPage />
                  </Shell>
                }
              />
            </Route>

            {/* Shared */}
            <Route element={<ProtectedRoute roles={["PATIENT", "DOCTOR"]} />}>
              <Route
                path="/appointments"
                element={
                  <Shell>
                    <AppointmentsPage />
                  </Shell>
                }
              />
              <Route
                path="/chat/:appointmentId"
                element={
                  <Shell>
                    <ChatPage />
                  </Shell>
                }
              />
              <Route path="/video/:appointmentId" element={<VideoCallPage />} />
              <Route
                path="/donations"
                element={
                  <Shell>
                    <DonationsPage />
                  </Shell>
                }
              />
              <Route
                path="/profile"
                element={
                  <Shell>
                    <ProfileSettingsPage />
                  </Shell>
                }
              />
              <Route
                path="/help"
                element={
                  <Shell>
                    <HelpPage />
                  </Shell>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
