import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/admin';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function DilsharaDoctorAvailability() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, [filterStatus]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/doctors/active-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAvailability = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedDoctor(data.doctor);
      setAvailability({
        slots: data.availability,
        exceptions: data.exceptions,
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    }
  };

  const handleSuspendDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to suspend this doctor?')) return;

    const reason = prompt('Enter reason for suspension (optional):');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/doctors/${doctorId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Doctor suspended successfully');
        fetchDoctors();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to suspend doctor:', err);
      alert('Failed to suspend doctor');
    }
  };

  const handleReactivateDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to reactivate this doctor?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/doctors/${doctorId}/reactivate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert('Doctor reactivated successfully');
        fetchDoctors();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to reactivate doctor:', err);
      alert('Failed to reactivate doctor');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;
    const matchesSearch = search === '' || 
      doctor.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Availability & Accounts</h1>
        <p className="text-gray-600 mt-1">Manage doctor schedules and account status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Total Doctors</div>
          <div className="text-2xl font-bold text-blue-600">{doctors.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Active Today</div>
          <div className="text-2xl font-bold text-green-600">
            {doctors.filter(d => d.is_available_today).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Online</div>
          <div className="text-2xl font-bold text-emerald-600">
            {doctors.filter(d => d.status === 'active').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Suspended</div>
          <div className="text-2xl font-bold text-red-600">
            {doctors.filter(d => d.status === 'suspended').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2"
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hospital</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today's Slots</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading doctors...
                  </td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No doctors found
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                          {doctor.profile_photo_url ? (
                            <img src={doctor.profile_photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            doctor.full_name?.charAt(0) || '?'
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doctor.full_name}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{doctor.specialty}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{doctor.hospital || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doctor.status)}`}>
                        {doctor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {doctor.is_available_today ? (
                        <span className="text-green-600 font-medium">✓ Available</span>
                      ) : (
                        <span className="text-gray-400">No slots</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleViewAvailability(doctor.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Schedule
                      </button>
                      {doctor.status === 'suspended' ? (
                        <button
                          onClick={() => handleReactivateDoctor(doctor.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendDoctor(doctor.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Availability Modal */}
      {showModal && selectedDoctor && availability && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {selectedDoctor.full_name} - Availability Schedule
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDoctor.specialty} | Status: {selectedDoctor.verification_status}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Weekly Schedule */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Weekly Schedule</h3>
                {availability.slots.length === 0 ? (
                  <p className="text-gray-500">No availability slots configured</p>
                ) : (
                  <div className="space-y-3">
                    {availability.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900 w-32">
                            {DAY_NAMES[slot.day_of_week]}
                          </span>
                          <span className="text-sm text-gray-600">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {slot.slot_duration_minutes} min slots
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slot.consultation_type === 'online' ? 'bg-blue-100 text-blue-800' :
                            slot.consultation_type === 'physical' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {slot.consultation_type}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            slot.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Exception Dates */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Exception Dates (Days Off)</h3>
                {availability.exceptions.length === 0 ? (
                  <p className="text-gray-500">No exception dates</p>
                ) : (
                  <div className="space-y-2">
                    {availability.exceptions.map((exception, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <span className="font-medium text-gray-900">
                          {new Date(exception.exception_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600">
                          {exception.reason || 'No reason provided'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
