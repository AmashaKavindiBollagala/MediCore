import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DushaniRescheduleModal = ({ appointment, onClose, onReschedule }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availability, setAvailability] = useState([]);

  useEffect(() => {
    if (selectedDate) fetchAvailability();
  }, [selectedDate]);

  const fetchAvailability = async () => {
    const res = await fetch(
      `${API_BASE}/appointments/doctors/${appointment.doctor_id}/availability?date=${selectedDate}`
    );
    const data = await res.json();
    if (data.success) setAvailability(data.data);
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedTime) return;
    onReschedule(appointment.id, `${selectedDate}T${selectedTime}:00`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 md:p-6 shadow-2xl animate-in fade-in zoom-in duration-200">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-[#184E77]">Reschedule Appointment</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <label className="block mb-2">
          <span className="text-sm font-semibold text-[#184E77] mb-1 block">Select Date:</span>
          <input
            type="date"
            className="w-full border-2 border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#34A0A4] transition-colors"
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </label>

        {selectedDate && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-[#184E77] mb-3">Available Time Slots:</p>
            {availability.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No available slots for this date</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {availability.map((slot, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedTime(slot.start_time)}
                    className={`p-2.5 rounded-lg border-2 text-xs md:text-sm font-semibold transition-all duration-200 ${
                      selectedTime === slot.start_time
                        ? 'bg-[#184E77] text-white border-[#184E77] shadow-md'
                        : 'border-slate-200 text-[#184E77] hover:border-[#34A0A4] hover:bg-blue-50'
                    }`}
                  >
                    {slot.start_time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleReschedule} 
            disabled={!selectedDate || !selectedTime}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
              selectedDate && selectedTime
                ? 'bg-[#184E77] text-white hover:bg-[#124170] shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default DushaniRescheduleModal;