import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DushaniBookAppointment from './pages/dushani-BookAppointment';
import DushaniMyAppointments from './pages/dushani-MyAppointments';
import Login from './pages/amasha-Login';
import Register from './pages/amasha-Register';
import KaveeshaDoctorRegister from './pages/kaveesha-DoctorRegister';
import KaveeshaDoctorDashboard from './pages/kaveesha-DoctorDashboard';


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
                <Link to="/appointments" className="text-gray-700 hover:text-blue-600 font-medium">
                  My Appointments
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
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
          <Route path="/doctor-register" element={<KaveeshaDoctorRegister />} />
          <Route path="/doctor-dashboard" element={<KaveeshaDoctorDashboard />} />
         

        </Routes>
      </div>
    </Router>
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
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
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

        {/* Quick Access Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Login */}
            <Link to="/login" className="block p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-shadow border border-blue-200">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-semibold text-gray-800 mb-1">Login</h3>
              <p className="text-sm text-gray-600">Sign in to your account</p>
            </Link>

            {/* Patient Register */}
            <Link to="/register" className="block p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-shadow border border-green-200">
              <div className="text-3xl mb-3">👤</div>
              <h3 className="font-semibold text-gray-800 mb-1">Patient Register</h3>
              <p className="text-sm text-gray-600">Create patient account</p>
            </Link>

            {/* Doctor Register */}
            <Link to="/doctor-register" className="block p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-shadow border border-purple-200">
              <div className="text-3xl mb-3">👨‍⚕️</div>
              <h3 className="font-semibold text-gray-800 mb-1">Doctor Registration</h3>
              <p className="text-sm text-gray-600">Join as a doctor</p>
            </Link>

            {/* Doctor Dashboard */}
            <Link to="/doctor-dashboard" className="block p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:shadow-md transition-shadow border border-indigo-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-800 mb-1">Doctor Dashboard</h3>
              <p className="text-sm text-gray-600">Manage appointments & profile</p>
            </Link>

            {/* My Appointments */}
            <Link to="/appointments" className="block p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-shadow border border-orange-200">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold text-gray-800 mb-1">My Appointments</h3>
              <p className="text-sm text-gray-600">View your bookings</p>
            </Link>

            {/* Book Appointment */}
            <Link to="/appointments/book" className="block p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:shadow-md transition-shadow border border-teal-200">
              <div className="text-3xl mb-3">🏥</div>
              <h3 className="font-semibold text-gray-800 mb-1">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule a consultation</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
