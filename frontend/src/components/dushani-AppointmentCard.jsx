import React from 'react';

const STATUS_CONFIG = {
  PENDING_PAYMENT: { bg: 'bg-yellow-100', color: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pending Payment' },
  CONFIRMED: { bg: 'bg-green-100', color: 'text-green-800', dot: 'bg-green-500', label: 'Confirmed' },
  COMPLETED: { bg: 'bg-blue-100', color: 'text-blue-800', dot: 'bg-blue-500', label: 'Completed' },
  CANCELLED: { bg: 'bg-gray-100', color: 'text-gray-700', dot: 'bg-gray-400', label: 'Cancelled' },
  REJECTED: { bg: 'bg-red-100', color: 'text-red-800', dot: 'bg-red-500', label: 'Rejected' },
};

const DushaniAppointmentCard = ({ appointment, onCancel, onReschedule, userRole }) => {
  const statusConfig = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.PENDING_PAYMENT;
  const date = new Date(appointment.scheduled_at);
  const isVideo = appointment.consultation_type === 'video';

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
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
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            {appointment.status === 'CONFIRMED' && (
              <>
                <button
                  onClick={() => onReschedule(appointment)}
                  className="bg-[#184E77] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#124170] transition-colors"
                >
                  📅 Reschedule
                </button>
                <button
                  onClick={() => onCancel(appointment.id)}
                  className="bg-red-100 text-red-800 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                >
                  ✕ Cancel
                </button>
              </>
            )}

            {appointment.status !== 'CONFIRMED' && appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
              <button
                onClick={() => onCancel(appointment.id)}
                className="bg-red-100 text-red-800 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
              >
                ✕ Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DushaniAppointmentCard;