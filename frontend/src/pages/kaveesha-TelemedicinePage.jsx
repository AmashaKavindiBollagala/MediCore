// kaveesha-TelemedicinePage.jsx
// Modern telemedicine dashboard for patients
// Shows confirmed appointments separated by video/physical type
// Video appointments split into Upcoming and Past

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:3007';
const MAIN_API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const navItems = [
  { to: '/patient-dashboard',      label: 'Dashboard',       path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/patient-profile',        label: 'My Profile',      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/appointments',   label: 'Appointments',    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/telemedicine',           label: 'My Consultations', path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { to: '/patient-reports',        label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/patient-prescription',  label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

function Sidebar({ user, onLogout }) {
  const loc = window.location.pathname;
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #124170 0%, #1a5a8a 100%)' }}>
      {/* User pill */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(103,192,144,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: '#26667F' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-white font-medium text-sm truncate max-w-[120px]">{user?.name || 'Patient'}</p>
              <p className="text-xs capitalize" style={{ color: '#67C090' }}>Patient</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, path }) => {
          const isActive = loc === to;
          return (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? '#26667F' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="currentColor" d={path} />
              </svg>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const COLORS = {
  primary: '#184E77',
  secondary: '#34A0A4',
  success: '#76C893',
  accent: '#52B788',
  light: '#F1FAEE',
  white: '#FFFFFF',
};

const DushaniTelemedicinePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('video'); // 'video' or 'physical'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchConfirmedAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchConfirmedAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${MAIN_API}/appointments/patient/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Filter both CONFIRMED and COMPLETED appointments
        const relevant = (data.data || []).filter(appt => 
          appt.status === 'CONFIRMED' || appt.status === 'COMPLETED'
        );
        setAppointments(relevant);
      } else {
        setError(data.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/telemedicine/appointment/${appointmentId}`);
  };

  // Separate video and physical appointments
  const videoAppointments = appointments.filter(
    appt => appt.consultation_type === 'video' || appt.consultation_type === 'online'
  );

  const physicalAppointments = appointments.filter(
    appt => appt.consultation_type === 'physical'
  );

  // Split video appointments into upcoming and completed
  const now = new Date();
  const upcomingVideo = videoAppointments.filter(appt => 
    appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) >= now
  );
  const completedVideo = videoAppointments.filter(appt => 
    appt.status === 'COMPLETED' || (appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) < now)
  );

  // Sort by date
  const sortByDate = (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at);
  upcomingVideo.sort(sortByDate);
  completedVideo.sort(sortByDate).reverse(); // Most recent first for completed

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const timeMatch = dateTimeStr.match(/T(\d{2}:\d{2})/);
    if (timeMatch) {
      const [hours, minutes] = timeMatch[1].split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return dateTimeStr;
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDateObject = (dateTimeStr) => {
    if (!dateTimeStr) return new Date();
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-[#34A0A4]/10 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#34A0A4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-[#184E77]">Loading your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#F1FAEE' }}>
      <Sidebar user={user} onLogout={handleLogout} />
      
      <div className="flex-1 min-h-screen bg-gradient-to-br from-[#F1FAEE] to-[#E0F7FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#184E77] to-[#34A0A4] text-white px-6 py-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                🎥 My Consultations
              </h1>
              <p className="text-white/80 text-sm">
                Manage your video and physical appointments
              </p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl text-sm font-semibold transition backdrop-blur-sm"
            >
              ← All Appointments
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold">{videoAppointments.length}</p>
              <p className="text-white/70 text-xs mt-1">Video Calls</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold">{physicalAppointments.length}</p>
              <p className="text-white/70 text-xs mt-1">Physical Visits</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-bold">{upcomingVideo.length}</p>
              <p className="text-white/70 text-xs mt-1">Upcoming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl px-5 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="bg-white rounded-2xl p-2 mb-8 shadow-md inline-flex">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-[#34A0A4] to-[#52B788] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎥 Video Consultations
          </button>
          <button
            onClick={() => setActiveTab('physical')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'physical'
                ? 'bg-gradient-to-r from-[#184E77] to-[#34A0A4] text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏥 Physical Visits
          </button>
        </div>

        {/* Video Consultations Tab */}
        {activeTab === 'video' && (
          <div className="space-y-8">
            {/* Upcoming Video Appointments */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#34A0A4] to-[#52B788]" />
                <h2 className="text-2xl font-bold text-[#184E77]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Upcoming Video Calls
                </h2>
                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">
                  {upcomingVideo.length}
                </span>
              </div>

              {upcomingVideo.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                  <div className="text-6xl mb-4">📅</div>
                  <p className="text-lg font-semibold text-[#184E77] mb-2">No upcoming video calls</p>
                  <p className="text-sm text-gray-500">
                    Book a video appointment to get started
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {upcomingVideo.map((appt) => {
                    const date = getDateObject(appt.scheduled_at);
                    return (
                      <div
                        key={appt.id}
                        className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-teal-100"
                      >
                        <div className="flex items-start gap-5">
                          {/* Date Box */}
                          <div className="bg-gradient-to-br from-[#34A0A4] to-[#52B788] text-white rounded-xl p-4 text-center shadow-lg">
                            <p className="text-3xl font-bold">{date.getDate()}</p>
                            <p className="text-xs uppercase mt-1">{date.toLocaleString('default', { month: 'short' })}</p>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#184E77] mb-2">
                              Dr. {appt.doctor_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>🕒 {formatTime(appt.scheduled_at)}</span>
                              <span>📅 {formatDate(appt.scheduled_at)}</span>
                            </div>
                            {appt.symptoms && (
                              <p className="text-sm text-gray-600 mb-3">
                                <span className="font-semibold">Symptoms:</span> {appt.symptoms}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-4">
                              <button
                                onClick={() => handleJoinVideoCall(appt.id)}
                                className="bg-gradient-to-r from-[#34A0A4] to-[#52B788] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2"
                              >
                                🎥 Join Video Call
                              </button>
                              <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                                ✅ Confirmed
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Completed Video Appointments */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#059669] to-[#10B981]" />
                <h2 className="text-2xl font-bold text-[#184E77]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Completed Video Calls
                </h2>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  {completedVideo.length}
                </span>
              </div>

              {completedVideo.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                  <div className="text-6xl mb-4">✓</div>
                  <p className="text-lg font-semibold text-[#184E77] mb-2">No completed video calls</p>
                  <p className="text-sm text-gray-500">
                    Your completed consultation history will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedVideo.map((appt) => {
                    const date = getDateObject(appt.scheduled_at);
                    return (
                      <div
                        key={appt.id}
                        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border-2 border-green-200"
                      >
                        <div className="flex items-start gap-5">
                          <div className="bg-gradient-to-br from-[#059669] to-[#10B981] text-white rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold">{date.getDate()}</p>
                            <p className="text-xs uppercase mt-1">{date.toLocaleString('default', { month: 'short' })}</p>
                          </div>

                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-green-900 mb-2">
                              Dr. {appt.doctor_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-green-700 mb-3">
                              <span>🕒 {formatTime(appt.scheduled_at)}</span>
                              <span>📅 {formatDate(appt.scheduled_at)}</span>
                            </div>
                            {appt.symptoms && (
                              <p className="text-sm text-green-700 mb-3">
                                <span className="font-semibold">Symptoms:</span> {appt.symptoms}
                              </p>
                            )}
                            <span className="bg-green-200 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                              ✓ Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Physical Visits Tab */}
        {activeTab === 'physical' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[#34A0A4] to-[#76C893]" />
              <h2 className="text-2xl font-bold text-[#184E77]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Physical Appointments
              </h2>
              <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold">
                {physicalAppointments.length}
              </span>
            </div>

            {physicalAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-lg font-semibold text-[#184E77] mb-2">No physical appointments</p>
                <p className="text-sm text-gray-500">
                  Book an in-person visit with a doctor
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {physicalAppointments.sort(sortByDate).map((appt) => {
                  const date = getDateObject(appt.scheduled_at);
                  const isPast = new Date(appt.scheduled_at) < now;
                  return (
                    <div
                      key={appt.id}
                      className={`bg-white rounded-2xl p-6 shadow-md border-2 transition-all ${
                        isPast ? 'border-gray-200 opacity-75' : 'border-teal-200 hover:shadow-xl'
                      }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className={`bg-gradient-to-br text-white rounded-xl p-4 text-center shadow-lg ${
                          isPast ? 'from-gray-400 to-gray-500' : 'from-[#34A0A4] to-[#76C893]'
                        }`}>
                          <p className="text-3xl font-bold">{date.getDate()}</p>
                          <p className="text-xs uppercase mt-1">{date.toLocaleString('default', { month: 'short' })}</p>
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#184E77] mb-2">
                            Dr. {appt.doctor_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span>🕒 {formatTime(appt.scheduled_at)}</span>
                            <span>📅 {formatDate(appt.scheduled_at)}</span>
                          </div>
                          {appt.symptoms && (
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-semibold">Symptoms:</span> {appt.symptoms}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-4">
                            <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                              🏥 In-Person Visit
                            </span>
                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                              ✅ Confirmed
                            </span>
                            {isPast && (
                              <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold">
                                ✓ Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DushaniTelemedicinePage;
