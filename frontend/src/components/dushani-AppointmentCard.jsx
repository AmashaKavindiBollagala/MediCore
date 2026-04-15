import React from 'react';
import { useNavigate } from 'react-router-dom';

const DushaniAppointmentCard = ({ appointment, onCancel, onReschedule, userRole }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status) => {
    const colors = {
      PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isActive =
    appointment.status === 'PENDING_PAYMENT' || appointment.status === 'CONFIRMED';

  const handlePayNow = () => {
    navigate(`/payment/checkout/${appointment.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            {userRole === 'doctor'
              ? `Patient: ${appointment.patient_name}`
              : `Dr. ${appointment.doctor_name}`}
          </h3>
          <p className="text-sm text-gray-600">{appointment.specialty}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)} self-start`}
        >
          {appointment.status.replace('_', ' ')}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDate(appointment.scheduled_at)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="capitalize">{appointment.consultation_type || 'video'} Consultation</span>
        </div>

        {appointment.symptoms && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
          </div>
        )}

        {userRole === 'doctor' && appointment.patient_phone && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{appointment.patient_phone}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {isActive && (
        <div className="space-y-2">
          {userRole === 'patient' && appointment.status === 'PENDING_PAYMENT' && (
            <button
              onClick={handlePayNow}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-md text-sm flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Pay Now
            </button>
          )}
          {userRole === 'patient' && (
            <button
              onClick={() => onReschedule(appointment)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
            >
              Reschedule Appointment
            </button>
          )}
          <button
            onClick={() => onCancel(appointment.id)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
          >
            {userRole === 'doctor'
              ? 'Cancel Appointment (Refund Will Be Processed)'
              : 'Cancel Appointment'}
          </button>
        </div>
      )}

      {/* Cancellation info */}
      {appointment.status === 'CANCELLED' && appointment.cancelled_by && (
        <div className="mt-2 text-xs text-gray-600">
          Cancelled by:{' '}
          <span className="font-semibold capitalize">{appointment.cancelled_by}</span>
          {appointment.cancellation_reason && (
            <div className="mt-1 text-gray-500">Reason: {appointment.cancellation_reason}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DushaniAppointmentCard;
