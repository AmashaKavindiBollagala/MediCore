import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DushaniBookAppointment from './pages/dushani-BookAppointment';
import DushaniMyAppointments from './pages/dushani-MyAppointments';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
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
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointments" element={<DushaniMyAppointments />} />
          <Route path="/appointments/book" element={<DushaniBookAppointment />} />
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
