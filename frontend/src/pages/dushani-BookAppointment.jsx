import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// FIX: use env variable so this works in Docker (not hardcoded localhost)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DushaniBookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useState({ specialty: '' });

  const [formData, setFormData] = useState({
    doctor_id: '',
    scheduled_at: '',
    consultation_type: 'video',
    symptoms: '',
    specialty: '',
  });

  // ── Search doctors by specialty ──────────────────────────────────────────
  const searchDoctors = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE}/appointments/doctors/search?specialty=${encodeURIComponent(searchParams.specialty)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await response.json();

      if (data.success) {
        setDoctors(data.data);
        setFormData((prev) => ({ ...prev, specialty: searchParams.specialty }));
        if (data.data.length > 0) {
          setStep(2);
        } else {
          setError('No doctors found for that specialty. Try a different search.');
        }
      } else {
        setError(data.error || 'Failed to search doctors');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Get doctor availability ──────────────────────────────────────────────
  const getDoctorAvailability = async (doctorId, dateStr) => {
    if (!dateStr) return;
    setLoading(true);

    try {
      const selectedDate = dateStr.split('T')[0];
      const response = await fetch(
        `${API_BASE}/appointments/doctors/${doctorId}/availability?date=${selectedDate}`
      );

      const data = await response.json();
      if (data.success) {
        setAvailability(data.data);
      }
    } catch (err) {
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle doctor selection ──────────────────────────────────────────────
  const handleDoctorSelect = (doctorId) => {
    setFormData((prev) => ({ ...prev, doctor_id: doctorId }));
    setStep(3);
  };

  // ── Submit booking ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Appointment created! Please proceed to payment.');
        navigate('/appointments');
      } else {
        setError(data.error || 'Failed to book appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Book an Appointment</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            {[1, 2, 3].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {s}
                </div>
                {i < 2 && (
                  <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Search Doctor */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Search for a Doctor</h2>
            <form onSubmit={searchDoctors}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <input
                  type="text"
                  value={searchParams.specialty}
                  onChange={(e) => setSearchParams({ specialty: e.target.value })}
                  placeholder="e.g., Cardiology, Dermatology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search Doctors'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Select Doctor */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor.id)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <h3 className="font-semibold text-lg">Dr. {doctor.full_name}</h3>
                  <p className="text-gray-600">{doctor.specialty}</p>
                  {doctor.verified && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Verified
                    </span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Search
            </button>
          </div>
        )}

        {/* Step 3: Appointment Details */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date and Time</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, scheduled_at: e.target.value }));
                    getDoctorAvailability(formData.doctor_id, e.target.value);
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {availability.length > 0 && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  ✓ Doctor is available on this day
                </div>
              )}

              {formData.scheduled_at && availability.length === 0 && !loading && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ⚠ No availability found for this day. Please choose another date.
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type</label>
                <select
                  value={formData.consultation_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, consultation_type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms / Reason for Visit
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData((prev) => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Describe your symptoms or reason for the appointment"
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DushaniBookAppointment;
