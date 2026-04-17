import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PaymentCheckout = () => {
  const { appointmentId: urlAppointmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  
  // Get appointment ID from URL or localStorage
  const appointmentId = urlAppointmentId || localStorage.getItem('pendingAppointmentId');
  
  // Prevent duplicate API calls in React Strict Mode
  const hasInitiatedPayment = useRef(false);

  useEffect(() => {
    if (appointmentId && !hasInitiatedPayment.current) {
      hasInitiatedPayment.current = true;
      initiatePayment();
    } else if (!appointmentId) {
      setError('No appointment found. Please book an appointment first.');
      setLoading(false);
    }
  }, [appointmentId]);

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to continue');
        navigate('/login');
        return;
      }

      // Fetch appointment details first
      const appointmentResponse = await fetch(`/api/appointments/${appointmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!appointmentResponse.ok) {
        throw new Error('Failed to fetch appointment details');
      }

      const appointmentResult = await appointmentResponse.json();
      const appointment = appointmentResult.data;
      setAppointmentData(appointment);

      // Calculate amount from appointment data or fallback to localStorage
      const amount = appointment.consultation_fee || parseFloat(localStorage.getItem('pendingAppointmentAmount')) || 1500.00;

      // Initiate payment
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_id: appointmentId,
          amount: amount,
          payment_method: 'card',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate payment');
      }

      const result = await response.json();
      setPaymentData(result.data);
    } catch (err) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = () => {
    if (!paymentData?.payhere_config) return;

    // Create form for PayHere checkout
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentData.payhere_config.url;
    form.style.display = 'none';

    const fields = {
      merchant_id: paymentData.payhere_config.merchant_id,
      return_url: paymentData.payhere_config.return_url,
      cancel_url: paymentData.payhere_config.cancel_url,
      notify_url: paymentData.payhere_config.notify_url,
      order_id: paymentData.payhere_config.order_id,
      amount: paymentData.payhere_config.amount,
      currency: paymentData.payhere_config.currency,
      hash: paymentData.payhere_config.hash,
      first_name: appointmentData?.patient_name?.split(' ')[0] || 'Patient',
      last_name: appointmentData?.patient_name?.split(' ')[1] || 'User',
      email: appointmentData?.patient_email || 'patient@medicare.lk',
      phone: appointmentData?.patient_phone || '+94771234567',
      address: 'Colombo',
      city: 'Colombo',
      country: 'Sri Lanka',
      items: 'Doctor Appointment Consultation'
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-6" style={{borderColor: '#184E77'}}></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Payment...</h2>
          <p className="text-gray-600">Please wait while we prepare your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 max-w-md w-full">
          <div className="mb-4" style={{color: '#FFE5EC'}}>
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Error</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            style={{backgroundColor: '#184E77'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#34A0A4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#184E77'}
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{color: '#184E77'}}>Secure Payment</h1>
          <p className="text-gray-600">Complete your appointment booking</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Appointment Details Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6" style={{background: 'linear-gradient(90deg, #184E77 0%, #34A0A4 100%)'}}>
              <h2 className="text-xl md:text-2xl font-bold text-white">Appointment Details</h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {appointmentData && (
                <>
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Doctor</p>
                      <p className="font-semibold text-gray-800">{appointmentData.doctor_name}</p>
                      <p className="text-sm" style={{color: '#34A0A4'}}>{appointmentData.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-semibold text-gray-800">
                        {(() => {
                          const datePart = appointmentData.scheduled_at.split('T')[0];
                          const [year, month, day] = datePart.split('-').map(Number);
                          const date = new Date(year, month - 1, day);
                          return date.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          });
                        })()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(() => {
                          const timeMatch = appointmentData.scheduled_at.match(/T(\d{2}:\d{2})/);
                          if (timeMatch) {
                            const [hours, minutes] = timeMatch[1].split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          }
                          return '';
                        })()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">Consultation Type</p>
                      <p className="font-semibold text-gray-800 capitalize">{appointmentData.consultation_type}</p>
                    </div>
                  </div>

                  {appointmentData.consultation_fee && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Consultation Fee</p>
                        <p className="font-bold text-lg" style={{color: '#76C893'}}>LKR {appointmentData.consultation_fee}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6" style={{background: 'linear-gradient(90deg, #76C893 0%, #34A0A4 100%)'}}>
              <h2 className="text-xl md:text-2xl font-bold text-white">Payment Summary</h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-gray-800">
                    LKR {(appointmentData?.consultation_fee || parseFloat(localStorage.getItem('pendingAppointmentAmount') || 1500)).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <span className="text-2xl font-bold" style={{color: '#76C893'}}>
                      LKR {(appointmentData?.consultation_fee || parseFloat(localStorage.getItem('pendingAppointmentAmount') || 1500)).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Badges */}
              <div className="rounded-lg p-4 mt-4" style={{backgroundColor: '#F1FAEE'}}>
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" style={{color: '#184E77'}} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold" style={{color: '#184E77'}}>Secure Payment</span>
                </div>
                <p className="text-xs" style={{color: '#34A0A4'}}>
                  Your payment is secured by PayHere payment gateway with 256-bit SSL encryption
                </p>
              </div>

              {/* Payment Methods */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Accepted Payment Methods:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">Visa</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">MasterCard</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">AMEX</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={handleSubmitPayment}
                className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg mt-6"
                style={{background: 'linear-gradient(90deg, #184E77 0%, #34A0A4 100%)'}}
                onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #34A0A4 0%, #76C893 100%)'}
                onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #184E77 0%, #34A0A4 100%)'}
              >
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Proceed to Pay LKR {(appointmentData?.consultation_fee || parseFloat(localStorage.getItem('pendingAppointmentAmount') || 1500)).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                </span>
              </button>

              <button
                onClick={() => navigate('/appointments')}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-colors mt-3"
                style={{backgroundColor: '#FFE5EC', color: '#184E77'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F1FAEE'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFE5EC'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By proceeding, you agree to our{' '}
            <a href="#" className="hover:underline" style={{color: '#34A0A4'}}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="hover:underline" style={{color: '#34A0A4'}}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCheckout;
