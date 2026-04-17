import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SharedLayout from './components/SharedLayout';
import DushaniBookAppointment from './pages/dushani-BookAppointment';
import DushaniMyAppointments from './pages/dushani-MyAppointments';
import DushaniPaymentCheckout from './pages/dushani-PaymentCheckout';
import DushaniPaymentSuccess from './pages/dushani-PaymentSuccess';
import DushaniPaymentCancel from './pages/dushani-PaymentCancel';
import DushaniPaymentHistory from './pages/dushani-PaymentHistory';
import DushaniDoctorAppointments from './pages/dushani-DoctorAppointments';
import Login from './pages/amasha-Login';
import Register from './pages/amasha-Register';
import KaveeshaDoctorRegister from './pages/kaveesha-DoctorRegister';
import KaveeshaDoctorDashboard from './pages/kaveesha-DoctorDashboard';
import RegisterDetails from './pages/amasha-patientRegister';
import PatientDashboard from './pages/amasha-patientDashboard';
import PatientProfile from './pages/amasha-patientProfile';
import MedicalReports from './pages/amasha-medicalReportsPage';
import Prescription from './pages/amasha-prescriptionPage';
import DilsharaAdminRoute               from './components/dilshara-AdminRoute';
import DilsharaAdminDashboard           from './pages/dilshara-AdminDashboard';
import DilsharaDoctorVerificationList   from './pages/dilshara-DoctorVerificationList';
import DilsharaDoctorVerificationDetail from './pages/dilshara-DoctorVerificationDetail';
import DilsharaAdminUsers               from './pages/dilshara-AdminUsers';
import Home from './pages/Home';
import {
  DilsharaAdminPayments,
  DilsharaAdminAvailability,
} from './pages/dilshara-AdminPlaceholders';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            {/* nav intentionally left empty — SharedLayout provides the header */}
          </div>
        </nav>

        <Routes>

          {/* ── Home (has its own built-in header/footer) ────────────── */}
          <Route path="/" element={<Home />} />

          {/* ── Auth pages — NO shared layout ────────────────────────── */}
          <Route path="/login"            element={<Login />} />
          <Route path="/register"         element={<Register />} />
          <Route path="/register/patient" element={<RegisterDetails />} />

          {/* ── Doctor pages — NO shared layout ──────────────────────── */}
          <Route path="/doctor-register"    element={<KaveeshaDoctorRegister />} />
          <Route path="/doctor-dashboard"   element={<KaveeshaDoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DushaniDoctorAppointments />} />

          {/* ── Admin pages — NO shared layout ───────────────────────── */}
          <Route path="/admin"              element={<DilsharaAdminRoute><DilsharaAdminDashboard /></DilsharaAdminRoute>} />
          <Route path="/admin/doctors"      element={<DilsharaAdminRoute><DilsharaDoctorVerificationList /></DilsharaAdminRoute>} />
          <Route path="/admin/doctors/:id"  element={<DilsharaAdminRoute><DilsharaDoctorVerificationDetail /></DilsharaAdminRoute>} />
          <Route path="/admin/users"        element={<DilsharaAdminRoute><DilsharaAdminUsers /></DilsharaAdminRoute>} />
          <Route path="/admin/payments"     element={<DilsharaAdminRoute><DilsharaAdminPayments /></DilsharaAdminRoute>} />
          <Route path="/admin/availability" element={<DilsharaAdminRoute><DilsharaAdminAvailability /></DilsharaAdminRoute>} />

          {/* ── Appointment & Payment pages — WITH shared layout ──────── */}
          <Route path="/appointments" element={
            <SharedLayout>
              <DushaniMyAppointments />
            </SharedLayout>
          } />
          <Route path="/appointments/book" element={
            <SharedLayout>
              <DushaniBookAppointment />
            </SharedLayout>
          } />
          <Route path="/payment/checkout/:appointmentId" element={
            <SharedLayout>
              <DushaniPaymentCheckout />
            </SharedLayout>
          } />
          <Route path="/payment/success" element={
            <SharedLayout>
              <DushaniPaymentSuccess />
            </SharedLayout>
          } />
          <Route path="/payment/cancel" element={
            <SharedLayout>
              <DushaniPaymentCancel />
            </SharedLayout>
          } />
          <Route path="/payments" element={
            <SharedLayout>
              <DushaniPaymentHistory />
            </SharedLayout>
          } />
          <Route path="/payments/:paymentId" element={
            <SharedLayout>
              <DushaniPaymentHistory />
            </SharedLayout>
          } />

          {/* ── Patient pages — WITH shared layout ───────────────────── */}
          <Route path="/patient-dashboard" element={
            <SharedLayout>
              <PatientLayout>
                <PatientDashboard />
              </PatientLayout>
            </SharedLayout>
          } />
          <Route path="/patient-profile" element={
            <SharedLayout>
              <PatientLayout>
                <PatientProfile />
              </PatientLayout>
            </SharedLayout>
          } />
          <Route path="/patient-reports" element={
            <SharedLayout>
              <PatientLayout>
                <MedicalReports />
              </PatientLayout>
            </SharedLayout>
          } />

           <Route path="/patient-prescription" element={
            <SharedLayout>
              <PatientLayout>
                <Prescription />
              </PatientLayout>
            </SharedLayout>
          } />

        </Routes>
      </div>
    </Router>
  );
}

function PatientLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F1FAEE]">
      {children}
    </div>
  );
}

export default App;