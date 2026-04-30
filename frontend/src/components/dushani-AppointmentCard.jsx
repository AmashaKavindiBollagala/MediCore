import React from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG = {
  PENDING_PAYMENT: { bg: 'bg-yellow-100', color: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pending Payment' },
  CONFIRMED: { bg: 'bg-green-100', color: 'text-green-800', dot: 'bg-green-500', label: 'Confirmed' },
  COMPLETED: { bg: 'bg-blue-100', color: 'text-blue-800', dot: 'bg-blue-500', label: 'Completed' },
  CANCELLED: { bg: 'bg-gray-100', color: 'text-gray-700', dot: 'bg-gray-400', label: 'Cancelled' },
  REJECTED: { bg: 'bg-red-100', color: 'text-red-800', dot: 'bg-red-500', label: 'Rejected' },
};

const DushaniAppointmentCard = ({ appointment, onCancel, onReschedule, userRole }) => {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING_PAYMENT;
  // Treat both 'video' and 'online' as video consultation
  const isVideo = appointment.consultation_type === 'video' || appointment.consultation_type === 'online';

  // Parse date and time directly from the string to avoid timezone conversion
  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    // Extract time directly from the string (format: "YYYY-MM-DDTHH:MM:SS")
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
    // Extract date directly from the string (format: "YYYY-MM-DDTHH:MM:SS")
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };
  
  // Get the date object for displaying the day number
  const getDateObject = (dateTimeStr) => {
    if (!dateTimeStr) return new Date();
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  
  const date = getDateObject(appointment.scheduled_at);

  const handlePayment = () => {
    // Store appointment details for payment
    localStorage.setItem('pendingAppointmentId', appointment.id);
    // Use the appointment's consultation fee
    const amount = appointment.consultation_fee || 1000;
    localStorage.setItem('pendingAppointmentAmount', amount.toString());
    
    // Navigate to payment checkout with appointment ID in URL
    navigate(`/payment/checkout/${appointment.id}`);
  };

  const handleJoinVideoCall = () => {
    // Navigate to video call page with appointment ID
    navigate(`/telemedicine/${appointment.id}`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border-2 border-teal-200/50 shadow-sm hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col md:flex-row gap-4 md:gap-5">

        {/* Date */}
        <div className={`w-full md:w-20 flex md:flex-col items-center justify-center rounded-xl text-white p-3 md:p-4 ${
          isVideo ? 'bg-gradient-to-br from-[#184E77] to-[#34A0A4]' : 'bg-gradient-to-br from-[#34A0A4] to-[#76C893]'
        }`}>
          <span className="text-3xl md:text-2xl font-bold">{date.getDate()}</span>
          <span className="text-xs uppercase ml-2 md:ml-0">{date.toLocaleString('default', { month: 'short' })}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-[#184E77] truncate">
                {userRole === 'doctor'
                  ? `Patient: ${appointment.patient_name}`
                  : `Dr. ${appointment.doctor_name}`}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatTime(appointment.scheduled_at)} · {formatDate(appointment.scheduled_at)}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                isVideo ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {isVideo ? '🎥 Video' : '🏥 Physical'}
              </span>

              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            {appointment.specialty && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Specialty</p>
                <p className="text-sm text-[#184E77] font-medium">{appointment.specialty}</p>
              </div>
            )}
            {appointment.symptoms && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Symptoms</p>
                <p className="text-sm text-[#184E77] font-medium">{appointment.symptoms}</p>
              </div>
            )}
            {/* Show patient info for both doctor and patient roles */}
            {appointment.patient_name && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Patient Name</p>
                <p className="text-sm text-[#184E77] font-medium">{appointment.patient_name}</p>
              </div>
            )}
            {appointment.patient_age && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Patient Age</p>
                <p className="text-sm text-[#184E77] font-medium">{appointment.patient_age} years</p>
              </div>
            )}
            {appointment.consultation_fee && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Consultation Fee</p>
                <p className="text-sm text-[#76C893] font-bold">LKR {appointment.consultation_fee}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            {/* Patient Actions */}
            {userRole === 'patient' && (
              <>
                {/* Refund notification for cancelled appointments */}
                {appointment.status === 'CANCELLED' && appointment.cancelled_by === 'doctor' && (
                  <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">💰</div>
                      <div className="flex-1">
                        <p className="font-bold text-blue-900 mb-1">Appointment Cancelled by Doctor</p>
                        <p className="text-sm text-blue-800">
                          This appointment has been cancelled by the doctor. A full refund of <strong>LKR {appointment.consultation_fee}</strong> has been processed to your payment method.
                        </p>
                        {appointment.refund_amount && (
                          <p className="text-sm text-blue-700 mt-2 font-semibold">
                            Refund Amount: LKR {appointment.refund_amount}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment button for PENDING_PAYMENT status */}
                {appointment.status === 'PENDING_PAYMENT' && (
                  <button
                    onClick={handlePayment}
                    className="bg-gradient-to-r from-[#76C893] to-[#34A0A4] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    💳 Pay Now
                  </button>
                )}

                {/* Reschedule for PENDING_PAYMENT and CONFIRMED */}
                {(appointment.status === 'PENDING_PAYMENT' || appointment.status === 'CONFIRMED') && (
                  <button
                    onClick={() => onReschedule(appointment)}
                    className="bg-[#184E77] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#124170] transition-colors"
                  >
                    📅 Reschedule
                  </button>
                )}

                {/* Cancel button - Available anytime except CANCELLED, COMPLETED, REJECTED */}
                {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && appointment.status !== 'REJECTED' && (
                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="bg-red-100 text-red-800 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    ✕ Cancel
                  </button>
                )}
              </>
            )}

            {/* Doctor Actions */}
            {userRole === 'doctor' && (
              <>
                {/* Join Video Call button for CONFIRMED video appointments */}
                {appointment.status === 'CONFIRMED' && isVideo && (
                  <button
                    onClick={handleJoinVideoCall}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    🎥 Join Video Call
                  </button>
                )}

                {/* Cancel button - Available anytime except CANCELLED, COMPLETED, REJECTED */}
                {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && appointment.status !== 'REJECTED' && (
                  <button
                    onClick={() => onCancel(appointment.id)}
                    className="bg-red-100 text-red-800 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                  >
                    ✕ Cancel Booking
                  </button>
                )}

                {/* Reschedule for CONFIRMED */}
                {appointment.status === 'CONFIRMED' && (
                  <button
                    onClick={() => onReschedule(appointment)}
                    className="bg-[#184E77] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#124170] transition-colors"
                  >
                    📅 Reschedule
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DushaniAppointmentCard;