import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DushaniAppointmentCard from '../components/dushani-AppointmentCard';
import DushaniRescheduleModal from '../components/dushani-RescheduleModal';

// FIX: use env variable so this works in Docker (not hardcoded localhost)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DushaniMyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [userRole, setUserRole] = useState('patient');
  const [rescheduleModal, setRescheduleModal] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role || 'patient');
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, []);

  // Re-fetch whenever filter or userRole changes
  useEffect(() => {
    fetchAppointments();
  }, [filter, userRole]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const endpoint =
        userRole === 'doctor'
          ? '/appointments/doctor/my-appointments'
          : '/appointments/patient/my-appointments';

      const url = filter
        ? `${API_BASE}${endpoint}?status=${filter}`
        : `${API_BASE}${endpoint}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setAppointments(data.data);
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
    let reason = '';

    if (userRole === 'doctor') {
      reason = prompt('Enter reason for cancellation (will be shown to patient):') || '';
      if (reason === null) return; // user pressed Cancel on prompt
    } else {
      if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          userRole === 'doctor'
            ? 'Appointment cancelled. Refund will be processed.'
            : 'Appointment cancelled successfully'
        );
        fetchAppointments();
      } else {
        setError(data.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleRescheduleClick = (appointment) => {
    setRescheduleModal(appointment);
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
        alert('Appointment rescheduled successfully');
        setRescheduleModal(null);
        fetchAppointments();
      } else {
        setError(data.error || 'Failed to reschedule appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const filters = [
    { label: 'All', value: '' },
    { label: 'Pending Payment', value: 'PENDING_PAYMENT' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {userRole === 'doctor' ? 'My Patient Appointments' : 'My Appointments'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {userRole === 'doctor'
                ? 'Manage your upcoming consultations'
                : 'Manage your appointments'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {filters.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  filter === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">
              {filter ? 'No appointments match the selected filter.' : 'You have no appointments yet.'}
            </p>
          </div>
        )}

        {!loading && appointments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {appointments.map((appointment) => (
              <DushaniAppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancel}
                onReschedule={handleRescheduleClick}
                userRole={userRole}
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
    </div>
  );
};

export default DushaniMyAppointments;
