import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
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
import DilsharaAdminRoute               from './components/dilshara-AdminRoute';
import DilsharaAdminDashboard           from './pages/dilshara-AdminDashboard';
import DilsharaDoctorVerificationList   from './pages/dilshara-DoctorVerificationList';
import DilsharaDoctorVerificationDetail from './pages/dilshara-DoctorVerificationDetail';
import DilsharaAdminUsers               from './pages/dilshara-AdminUsers';
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
            {/* <div className="flex justify-between items-center py-4">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                MediCore
              </Link>
              <div className="hidden sm:flex gap-6">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link to="/appointments" className="text-gray-700 hover:text-blue-600 font-medium">
                  My Appointments
                </Link>
                <Link to="/payments" className="text-gray-700 hover:text-blue-600 font-medium">
                  Payment History
                </Link>
                <Link to="/appointments/book" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  Book Appointment
                </Link>
              </div>
              <button className="sm:hidden text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div> */}
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<DushaniMyAppointments />} />
          <Route path="/appointments/book" element={<DushaniBookAppointment />} />
          <Route path="/payment/checkout/:appointmentId" element={<DushaniPaymentCheckout />} />
          <Route path="/payment/success" element={<DushaniPaymentSuccess />} />
          <Route path="/payment/cancel" element={<DushaniPaymentCancel />} />
          <Route path="/payments" element={<DushaniPaymentHistory />} />
          <Route path="/payments/:paymentId" element={<DushaniPaymentHistory />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctor-register" element={<KaveeshaDoctorRegister />} />
          <Route path="/doctor-dashboard" element={<KaveeshaDoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DushaniDoctorAppointments />} />
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
            <Route path="/register/patient" element={<RegisterDetails />} />
          <Route path="/doctor-register" element={<KaveeshaDoctorRegister />} />
          <Route path="/doctor-dashboard" element={<KaveeshaDoctorDashboard />} />
          <Route path="/doctor-appointments" element={<DushaniDoctorAppointments />} />

          <Route
          path="/patient-dashboard"
          element={
            <PatientLayout>
              <PatientDashboard />
            </PatientLayout>
          }
        />

        <Route
          path="/patient-profile"
          element={
            <PatientLayout>
              <PatientProfile />
            </PatientLayout>
          }
        />

        <Route
          path="/patient-reports"
          element={
            <PatientLayout>
              <MedicalReports />
            </PatientLayout>
          }
        />

         
          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<DilsharaAdminRoute><DilsharaAdminDashboard /></DilsharaAdminRoute>} />
          <Route path="/admin/doctors" element={<DilsharaAdminRoute><DilsharaDoctorVerificationList /></DilsharaAdminRoute>} />
          <Route path="/admin/doctors/:id" element={<DilsharaAdminRoute><DilsharaDoctorVerificationDetail /></DilsharaAdminRoute>} />
          <Route path="/admin/users" element={<DilsharaAdminRoute><DilsharaAdminUsers /></DilsharaAdminRoute>} />
          <Route path="/admin/payments" element={<DilsharaAdminRoute><DilsharaAdminPayments /></DilsharaAdminRoute>} />
          <Route path="/admin/availability" element={<DilsharaAdminRoute><DilsharaAdminAvailability /></DilsharaAdminRoute>} />

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

function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
      <div className="text-center">
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
          Welcome to MediCore
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8">
          Book appointments with top doctors and manage your healthcare
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/appointments/book"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors text-base sm:text-lg"
          >
            Book an Appointment
          </Link>
          <Link
            to="/appointments"
            className="bg-white hover:bg-gray-100 text-blue-600 font-medium py-3 px-8 rounded-lg transition-colors text-base sm:text-lg border-2 border-blue-600"
          >
            View My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
