import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DushaniAppointmentCard from '../components/dushani-AppointmentCard';
import DushaniRescheduleModal from '../components/dushani-RescheduleModal';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = {
  primary: '#184E77',
  secondary: '#34A0A4',
  success: '#76C893',
  light: '#F1FAEE',
  accent: '#FFE5EC',
};

const STATUS_CONFIG = {
  PENDING_PAYMENT: { bg: '#FFE5EC', color: '#92400E', label: 'Pending Payment' },
  CONFIRMED: { bg: '#F1FAEE', color: '#184E77', label: 'Confirmed' },
  COMPLETED: { bg: '#E0F2FE', color: '#0C4A6E', label: 'Completed' },
  CANCELLED: { bg: '#F3F4F6', color: '#374151', label: 'Cancelled' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

const DushaniMyAppointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [appointmentType, setAppointmentType] = useState('ALL');
  const [rescheduleModal, setRescheduleModal] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchAppointments();
  }, []);

  // Refresh appointments if coming from booking page
  useEffect(() => {
    if (location.state?.refresh) {
      fetchAppointments();
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/patient/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data || []);
      } else {
        setError(data.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        fetchAppointments();
      } else {
        setError(data.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleReschedule = async (appointmentId, newScheduledAt) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_scheduled_at: newScheduledAt }),
      });
      const data = await response.json();
      if (data.success) {
        setRescheduleModal(null);
        fetchAppointments();
      } else {
        setError(data.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = activeFilter === 'ALL' || appt.status === activeFilter;
    // Treat 'online' and 'video' as the same type for filtering
    const matchesType =
      appointmentType === 'ALL' || 
      appt.consultation_type === appointmentType ||
      (appointmentType === 'video' && appt.consultation_type === 'online');
    return matchesStatus && matchesType;
  });

  const stats = {
    today: appointments.filter(
      (a) => 
        new Date(a.scheduled_at).toDateString() === new Date().toDateString() &&
        a.status !== 'CANCELLED' // Exclude cancelled appointments
    ).length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    video: appointments.filter((a) => 
      (a.consultation_type === 'video' || a.consultation_type === 'online') &&
      a.status !== 'CANCELLED' // Exclude cancelled appointments
    ).length,
    physical: appointments.filter(
      (a) => a.consultation_type === 'physical' && a.status !== 'CANCELLED' // Exclude cancelled appointments
    ).length,
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-[#34A0A4]/20 font-sans p-4 sm:p-6 md:p-8"
    >
      {/* Header */}
      <div className="mb-6 md:mb-7">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {user && (
              <h1 className="m-0 text-2xl md:text-3xl font-bold text-[#184E77]">
                {greeting()}, {user.name?.split(' ')[0]} 👋
              </h1>
            )}
            <p className="m-0 mt-1 text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            {!user && (
              <h1 className="m-0 text-2xl md:text-3xl font-bold text-[#184E77] mt-2">
                My Appointments
              </h1>
            )}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/book-appointment')}
              className="bg-white border-2 border-[#34A0A4] rounded-lg px-4 py-2 text-[#184E77] text-xs md:text-sm font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              + Book New
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

      {/* Error */}
      {error && (
        <div
          className="bg-[#FFE5EC] border border-[#FFE5EC] text-red-800 rounded-lg px-4 py-3 mb-5 text-sm"
        >
          {error}
        </div>
      )}

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
                {status === 'ALL' ? 'All' : STATUS_CONFIG[status]?.label || status}
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
          {filteredAppointments.map((appt) => (
            <DushaniAppointmentCard
              key={appt.id}
              appointment={appt}
              onCancel={handleCancel}
              onReschedule={() => setRescheduleModal(appt)}
              userRole="patient"
            />
          ))}
        </div>
      )}

      {rescheduleModal && (
        <DushaniRescheduleModal
          appointment={rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          onReschedule={handleReschedule}
        />
      )}
    </div>
  );
};

export default DushaniMyAppointments;
