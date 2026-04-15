import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#184E77',
  secondary: '#34A0A4',
  success: '#76C893',
  light: '#F1FAEE',
  accent: '#FFE5EC',
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>, route: '/doctor-dashboard' },
  { id: 'appointments', label: 'Appointments', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>, route: '/doctor-appointments' },
  { id: 'availability', label: 'Availability', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>, route: '/doctor-dashboard' },
  { id: 'prescriptions', label: 'Prescriptions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg>, route: '/doctor-dashboard' },
  { id: 'reports', label: 'Patient Reports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/></svg>, route: '/doctor-dashboard' },
  { id: 'profile', label: 'My Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg>, route: '/doctor-dashboard' },
];

const STATUS_CONFIG = {
  PENDING_PAYMENT: { bg: COLORS.accent, color: '#92400E', label: 'Pending Payment' },
  CONFIRMED: { bg: COLORS.light, color: COLORS.primary, label: 'Confirmed' },
  COMPLETED: { bg: '#E0F2FE', color: '#0C4A6E', label: 'Completed' },
  CANCELLED: { bg: '#F3F4F6', color: '#374151', label: 'Cancelled' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [appointmentType, setAppointmentType] = useState('ALL'); // ALL, video, physical
  const [doctor, setDoctor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDoctorProfile();
    fetchAppointments();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch('/api/doctors/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctor(data);
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments/doctor/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setAppointments(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const endpoint = action === 'complete' ? 'status' : action;
      const method = action === 'complete' ? 'PATCH' : 'PATCH';
      
      await fetch(`/api/appointments/${appointmentId}/${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'complete' ? 'COMPLETED' : undefined,
        }),
      });
      fetchAppointments();
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err);
    }
  };

  const getStatusColor = (status) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_PAYMENT;
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = activeFilter === 'ALL' || appt.status === activeFilter;
    const matchesType =
      appointmentType === 'ALL' || appt.consultation_type === appointmentType;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: appointments.length,
    today: appointments.filter(
      (a) => new Date(a.scheduled_at).toDateString() === new Date().toDateString()
    ).length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    video: appointments.filter((a) => a.consultation_type === 'video').length,
    physical: appointments.filter((a) => a.consultation_type === 'physical').length,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`${
          sidebarOpen ? 'w-56' : 'w-[68px]'
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-250 sticky top-0 h-screen flex-shrink-0 hidden md:flex`}
      >
        {/* Logo + Toggle */}
        <div
          className={`px-4 py-5 border-b border-slate-200 flex items-center gap-2.5 ${
            !sidebarOpen && 'px-3'
          }`}
        >
          <div
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#184E77] to-[#34A0A4] flex items-center justify-center text-white flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {sidebarOpen && <span className="font-bold text-base text-[#184E77]">MediCore</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto bg-transparent border-none cursor-pointer text-slate-400 p-1 flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              {sidebarOpen ? (
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3">
          {NAV_ITEMS.map(({ id, label, icon, route }) => {
            const active = id === 'appointments';
            return (
              <button
                key={id}
                onClick={() => navigate(route)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border-none cursor-pointer mb-1 text-sm text-left transition-all duration-150 ${
                  active
                    ? 'bg-blue-50 text-[#124170] font-semibold'
                    : 'bg-transparent text-gray-500 hover:bg-[#F1FAEE] hover:text-[#184E77]'
                }`}
              >
                <span className="flex-shrink-0">{icon}</span>
                {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
                {active && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#124170]" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg border-none cursor-pointer bg-transparent text-red-500 text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div
        className="flex-1 min-h-screen bg-gradient-to-br from-[#F1FAEE] to-[#34A0A4]/20 font-sans p-4 sm:p-6 md:p-8 overflow-auto"
      >
      {/* Header */}
      <div className="mb-6 md:mb-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="m-0 text-2xl md:text-3xl font-bold text-[#184E77]">
              My Appointments
            </h1>
            <p className="m-0 mt-1 text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/doctor-dashboard')}
              className="bg-white border-2 border-[#34A0A4] rounded-lg px-4 py-2 text-[#184E77] text-xs md:text-sm font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={fetchAppointments}
              className="bg-[#184E77] border-none rounded-lg px-4 py-2 text-white text-xs md:text-sm font-semibold cursor-pointer hover:bg-[#124170] transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-7"
      >
        {[
          { label: "Today's Appointments", value: stats.today, icon: '📅', color: COLORS.primary },
          { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: COLORS.secondary },
          { label: 'Completed', value: stats.completed, icon: '🎯', color: COLORS.success },
          { label: 'Video Calls', value: stats.video, icon: '🎥', color: '#8B5CF6' },
          { label: 'Physical Visits', value: stats.physical, icon: '🏥', color: '#F59E0B' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border-2 transition hover:shadow-md"
            style={{ borderColor: `${stat.color}30` }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-3"
              style={{ background: `${stat.color}15` }}
            >
              {stat.icon}
            </div>
            <p className="m-0 text-3xl font-bold text-[#184E77]">
              {stat.value}
            </p>
            <p className="m-0 mt-1 text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl p-5 mb-6 border-2"
        style={{ borderColor: `${COLORS.secondary}30` }}
      >
        <div className="mb-4">
          <p className="m-0 mb-2.5 text-sm font-semibold text-[#184E77]">
            Appointment Type:
          </p>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'video', 'physical'].map((type) => (
              <button
                key={type}
                onClick={() => setAppointmentType(type)}
                className="px-4 py-2 rounded-full border-none cursor-pointer text-xs md:text-sm font-semibold transition-all duration-200"
                style={{
                  background: appointmentType === type ? COLORS.primary : '#F3F4F6',
                  color: appointmentType === type ? 'white' : '#6B7280',
                }}
              >
                {type === 'ALL' ? '📋 All' : type === 'video' ? '🎥 Video' : '🏥 Physical'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="m-0 mb-2.5 text-sm font-semibold text-[#184E77]">
            Status Filter:
          </p>
          <div className="flex gap-2 flex-wrap">
            {['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className="px-4 py-2 rounded-full border-none cursor-pointer text-xs md:text-sm font-semibold transition-all duration-200"
                style={{
                  background: activeFilter === status ? COLORS.secondary : '#F3F4F6',
                  color: activeFilter === status ? 'white' : '#6B7280',
                }}
              >
                {status === 'ALL' ? 'All' : getStatusColor(status).label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div
          className="text-center py-16 px-5 bg-white rounded-2xl border-2"
          style={{ borderColor: `${COLORS.secondary}30` }}
        >
          <div
            className="w-12 h-12 border-4 rounded-full mx-auto mb-4 animate-spin"
            style={{
              borderColor: COLORS.light,
              borderTopColor: COLORS.primary,
            }}
          />
          <p className="text-gray-500 text-base">Loading appointments...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div
          className="text-center py-16 px-5 bg-white rounded-2xl border-2"
          style={{ borderColor: `${COLORS.secondary}30` }}
        >
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-500 text-base font-semibold">No appointments found</p>
          <p className="text-gray-400 text-sm mt-2">
            {activeFilter !== 'ALL' || appointmentType !== 'ALL'
              ? 'Try adjusting your filters'
              : 'You have no appointments yet'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appt) => {
            const statusConfig = getStatusColor(appt.status);
            const date = new Date(appt.scheduled_at);
            const isVideo = appt.consultation_type === 'video';

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl p-5 md:p-6 border-2 transition-all duration-200 hover:shadow-lg"
                style={{ borderColor: `${COLORS.secondary}30` }}
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Date Box */}
                  <div
                    className="w-full sm:w-20 text-center rounded-xl p-3 text-white flex-shrink-0 bg-gradient-to-br"
                    style={{
                      backgroundImage: isVideo
                        ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
                        : `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.success})`,
                    }}
                  >
                    <p className="m-0 text-3xl font-bold">
                      {date.getDate()}
                    </p>
                    <p className="m-0 mt-1 text-xs uppercase">
                      {date.toLocaleString('default', { month: 'short' })}
                    </p>
                    <p className="m-0 mt-0.5 text-[10px] opacity-90">
                      {date.toLocaleString('default', { weekday: 'short' })}
                    </p>
                  </div>

                  {/* Appointment Details */}
                  <div className="flex-1">
                    <div
                      className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3"
                    >
                      <div>
                        <h3 className="m-0 text-lg font-bold text-[#184E77]">
                          {appt.patient_name || 'Patient'}
                        </h3>
                        <p className="m-0 mt-1 text-sm text-gray-500">
                          {formatTime(appt.scheduled_at)} · {formatDate(appt.scheduled_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center flex-wrap">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: isVideo ? '#8B5CF620' : '#F59E0B20',
                            color: isVideo ? '#8B5CF6' : '#F59E0B',
                          }}
                        >
                          {isVideo ? '🎥 Video' : '🏥 Physical'}
                        </span>
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{
                            background: statusConfig.bg,
                            color: statusConfig.color,
                          }}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t"
                      style={{ borderColor: COLORS.light }}
                    >
                      {appt.symptoms && (
                        <div>
                          <p className="m-0 text-xs text-gray-400 mb-1">
                            Symptoms
                          </p>
                          <p className="m-0 text-sm text-[#184E77] font-medium">
                            {appt.symptoms}
                          </p>
                        </div>
                      )}
                      {appt.specialty && (
                        <div>
                          <p className="m-0 text-xs text-gray-400 mb-1">
                            Specialty
                          </p>
                          <p className="m-0 text-sm text-[#184E77] font-medium">
                            {appt.specialty}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {appt.status === 'CONFIRMED' && (
                      <div className="flex flex-wrap gap-2.5 mt-4">
                        <button
                          onClick={() => handleAppointmentAction(appt.id, 'complete')}
                          className="bg-[#76C893] text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[#5FB87A]"
                        >
                          ✓ Mark Complete
                        </button>
                        <button
                          onClick={() => handleAppointmentAction(appt.id, 'cancel')}
                          className="bg-[#FFE5EC] text-red-800 border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[#FFD0DB]"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}

                    {appt.status === 'PENDING_PAYMENT' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleAppointmentAction(appt.id, 'confirm')}
                          className="bg-[#184E77] text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-[#124170]"
                        >
                          ✓ Confirm Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
