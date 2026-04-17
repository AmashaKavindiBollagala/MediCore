import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DushaniBookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchParams, setSearchParams] = useState({ specialty: '' });

  const [formData, setFormData] = useState({
    doctor_id: '',
    scheduled_at: '',
    consultation_type: 'video',
    symptoms: '',
    specialty: '',
    patient_name: '',
    patient_age: '',
  });

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
        if (data.data.length > 0) setStep(2);
        else setError('No doctors found for that specialty.');
      } else {
        setError(data.error || 'Failed to search doctors');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorAvailability = async (doctorId, dateStr) => {
    if (!dateStr) return;
    setLoading(true);
    try {
      const selectedDate = dateStr.split('T')[0];
      const response = await fetch(
        `${API_BASE}/appointments/doctors/${doctorId}/availability?date=${selectedDate}`
      );
      const data = await response.json();
      if (data.success) setAvailability(data.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData((prev) => ({ ...prev, doctor_id: doctor.id }));
    setStep(3); // Go to date/time selection
  };

  const handleDateSelect = async (dateStr) => {
    setSelectedDate(dateStr);
    setLoading(true);
    
    try {
      // Fetch availability for selected date
      const response = await fetch(
        `${API_BASE}/appointments/doctors/${formData.doctor_id}/availability?date=${dateStr}`
      );
      const data = await response.json();
      if (data.success) {
        setAvailability(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time, consultationType) => {
    setSelectedTime(time);
    // Combine date and time
    const scheduledAt = `${selectedDate}T${time}`;
    
    // Use the consultation type from the availability slot
    const finalConsultationType = consultationType === 'both' ? 'video' : (consultationType || 'video');
    
    setFormData((prev) => ({ 
      ...prev, 
      scheduled_at: scheduledAt,
      consultation_type: finalConsultationType // Auto-set from availability slot
    }));
    setStep(4); // Go to booking form
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Calculate consultation fee based on the consultation type from availability slot
      let consultationFee = 0;
      if (formData.consultation_type === 'video' || formData.consultation_type === 'online') {
        consultationFee = selectedDoctor?.consultation_fee_online || 0;
      } else if (formData.consultation_type === 'physical') {
        consultationFee = selectedDoctor?.consultation_fee_physical || selectedDoctor?.consultation_fee_online || 0;
      }
      
      console.log('Booking with consultation type:', formData.consultation_type);
      console.log('Calculated fee:', consultationFee);
      console.log('Full formData being sent:', formData);
      
      const response = await fetch(`${API_BASE}/appointments/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          consultation_fee: consultationFee,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store appointment ID and amount for payment
        localStorage.setItem('pendingAppointmentId', data.data.id);
        // Use the calculated consultation fee
        const amount = consultationFee || 1000;
        localStorage.setItem('pendingAppointmentAmount', amount.toString());
        
        alert('Appointment booked successfully! Redirecting to your appointments...');
        // Navigate to patient's appointments page with refresh flag
        navigate('/appointments', { state: { refresh: true, newAppointmentId: data.data.id } });
      } else {
        setError(data.error || 'Failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1FAEE] to-[#34A0A4]/20 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#184E77] m-0">
                Book Appointment
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 && 'Search for a doctor by specialty'}
                {step === 2 && 'Select a doctor from the search results'}
                {step === 3 && 'Select a date and available time slot'}
                {step === 4 && 'Complete your appointment details'}
              </p>
            </div>
            <button
              onClick={() => navigate('/appointments')}
              className="bg-white border-2 border-[#34A0A4] rounded-lg px-4 py-2 text-[#184E77] text-xs md:text-sm font-semibold cursor-pointer hover:bg-gray-50 transition"
            >
              ← Back to Appointments
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl p-4 md:p-6 mb-6 border-2 border-teal-200/50">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 ${
                      step > s
                        ? 'bg-[#76C893] text-white'
                        : step === s
                        ? 'bg-[#184E77] text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step > s ? '✓' : s}
                  </div>
                  <p
                    className={`text-xs mt-2 font-semibold hidden sm:block ${
                      step >= s ? 'text-[#184E77]' : 'text-gray-400'
                    }`}
                  >
                    {s === 1 && 'Search'}
                    {s === 2 && 'Select'}
                    {s === 3 && 'Time'}
                    {s === 4 && 'Book'}
                  </p>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 md:mx-4 rounded transition-all duration-300 ${
                      step > s ? 'bg-[#76C893]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border-2 border-red-200 text-red-800 rounded-lg px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Search */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 border-2 border-teal-200/50">
            <h2 className="text-xl font-bold text-[#184E77] mb-4">Search for a Doctor</h2>
            <form onSubmit={searchDoctors}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#184E77] mb-2">
                  Specialty
                </label>
                <input
                  type="text"
                  value={searchParams.specialty}
                  onChange={(e) => setSearchParams({ specialty: e.target.value })}
                  placeholder="e.g., Cardiology, Dermatology, Pediatrics"
                  className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#184E77] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#124170] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Search Doctors'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Select Doctor */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 border-2 border-teal-200/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#184E77]">Select a Doctor</h2>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-[#34A0A4] font-semibold hover:underline"
              >
                ← Back to Search
              </button>
            </div>
            <div className="grid gap-3">
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="border-2 border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#34A0A4] hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#184E77] to-[#34A0A4] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {doctor.full_name?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#184E77] text-base md:text-lg group-hover:text-[#34A0A4] transition-colors">
                        Dr. {doctor.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                      {doctor.years_of_experience && (
                        <p className="text-xs text-gray-400 mt-1">
                          {doctor.years_of_experience} years experience
                        </p>
                      )}
                      {doctor.consultation_fee_online && (
                        <p className="text-xs text-[#76C893] font-semibold mt-1">
                          LKR {doctor.consultation_fee_online} (Video)
                        </p>
                      )}
                    </div>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-gray-300 group-hover:text-[#34A0A4] transition-colors flex-shrink-0 mt-2"
                    >
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date and Time */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 border-2 border-teal-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#184E77]">Select Date & Time</h2>
                {selectedDoctor && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dr. {selectedDoctor.full_name} - {selectedDoctor.specialty}
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-[#34A0A4] font-semibold hover:underline"
              >
                ← Change Doctor
              </button>
            </div>

            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#184E77] mb-2">
                Select Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Time Slots */}
            {loading ? (
              <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 mx-auto text-[#34A0A4]" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-500 mt-2">Loading available time slots...</p>
              </div>
            ) : availability.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-[#184E77] mb-3">
                  Available Time Slots for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availability.map((slot, i) => {
                    // Calculate fee based on slot's consultation type
                    let slotFee = 0;
                    let slotType = slot.consultation_type || 'video';
                    
                    if (slotType === 'both') {
                      slotType = 'video'; // Default to video for 'both'
                    }
                    
                    if (slotType === 'video' || slotType === 'online') {
                      slotFee = selectedDoctor?.consultation_fee_online || 0;
                    } else if (slotType === 'physical') {
                      slotFee = selectedDoctor?.consultation_fee_physical || selectedDoctor?.consultation_fee_online || 0;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleTimeSelect(slot.start_time, slot.consultation_type)}
                        className="bg-white border-2 border-[#34A0A4] text-[#184E77] rounded-lg px-4 py-3 text-sm font-semibold hover:bg-[#34A0A4] hover:text-white transition-all duration-200"
                      >
                        <div className="text-base">{slot.start_time}</div>
                        <div className="text-xs mt-1" style={{ opacity: 0.9 }}>
                          {slotType === 'video' || slotType === 'online' ? '🎥 Online' : '🏥 Physical'}
                        </div>
                        <div className="text-xs mt-1 font-bold" style={{ opacity: 0.95 }}>
                          LKR {slotFee}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No available time slots for this date</p>
                <p className="text-xs text-gray-400 mt-1">Please select another date</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Step 4: Book Appointment Form */}
        {step === 4 && (
          <div className="bg-white rounded-2xl p-5 md:p-8 border-2 border-teal-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#184E77]">Complete Booking</h2>
                {selectedDoctor && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dr. {selectedDoctor.full_name} | {new Date(formData.scheduled_at).toLocaleString()}
                  </p>
                )}
              </div>
              <button
                onClick={() => setStep(3)}
                className="text-sm text-[#34A0A4] font-semibold hover:underline"
              >
                ← Change Time
              </button>
            </div>

            {/* Doctor Info Card */}
            {selectedDoctor && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#184E77] to-[#34A0A4] rounded-xl text-white">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                    {selectedDoctor.full_name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">Dr. {selectedDoctor.full_name}</h3>
                    <p className="text-sm text-white/90 mt-1">{selectedDoctor.specialty}</p>
                    {selectedDoctor.years_of_experience && (
                      <p className="text-xs text-white/80 mt-1">
                        {selectedDoctor.years_of_experience} years experience
                      </p>
                    )}
                    {selectedDoctor.consultation_fee_online && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <p className="text-xs text-white/80">Consultation Fee ({formData.consultation_type === 'video' || formData.consultation_type === 'online' ? 'Online' : 'Physical'})</p>
                        <p className="text-lg font-bold">
                          LKR {formData.consultation_type === 'video' || formData.consultation_type === 'online' 
                            ? selectedDoctor.consultation_fee_online 
                            : selectedDoctor.consultation_fee_physical || selectedDoctor.consultation_fee_online}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Patient Information */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#184E77] mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#184E77] mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={formData.patient_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, patient_name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#184E77] mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={formData.patient_age}
                      onChange={(e) => setFormData((prev) => ({ ...prev, patient_age: e.target.value }))}
                      placeholder="Enter your age"
                      className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors"
                      min="1"
                      max="150"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-[#184E77] mb-3">Appointment Details</h3>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#184E77] mb-2">
                    Consultation Type *
                  </label>
                  <select
                    value={formData.consultation_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        consultation_type: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors bg-white"
                  >
                    <option value="video">🎥 Video Consultation (Online)</option>
                    <option value="physical">🏥 Physical Visit (In-Person)</option>
                  </select>
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    ℹ️ Auto-selected based on doctor's availability
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#184E77] mb-2">
                    Symptoms / Reason for Visit
                  </label>
                  <textarea
                    value={formData.symptoms}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, symptoms: e.target.value }))
                    }
                    placeholder="Describe your symptoms or reason for the appointment..."
                    rows={4}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <h3 className="text-sm font-bold text-[#184E77] mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doctor:</span>
                    <span className="font-semibold text-[#184E77]">Dr. {selectedDoctor?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialty:</span>
                    <span className="font-semibold text-[#184E77]">{selectedDoctor?.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-semibold text-[#184E77]">{new Date(formData.scheduled_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consultation Type:</span>
                    <span className="font-semibold text-[#184E77]">
                      {formData.consultation_type === 'video' || formData.consultation_type === 'online' 
                        ? '🎥 Video Consultation' 
                        : '🏥 Physical Visit'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="text-gray-700 font-semibold">Consultation Fee:</span>
                    <span className="font-bold text-lg text-[#76C893]">
                      LKR {formData.consultation_type === 'video' || formData.consultation_type === 'online'
                        ? selectedDoctor?.consultation_fee_online 
                        : selectedDoctor?.consultation_fee_physical || selectedDoctor?.consultation_fee_online}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#76C893] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5FB87A] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Booking...
                    </span>
                  ) : (
                    '✓ Confirm Booking'
                  )}
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