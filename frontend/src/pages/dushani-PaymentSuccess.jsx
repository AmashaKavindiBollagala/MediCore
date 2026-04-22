import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Get appointment_id from localStorage (stored before PayHere redirect)
      let appointmentId = localStorage.getItem('pendingPaymentAppointmentId');
      
      // Fallback: Also check URL parameter
      if (!appointmentId) {
        const orderIdFromUrl = searchParams.get('order_id');
        if (orderIdFromUrl) {
          console.log('Found order_id in URL:', orderIdFromUrl);
          appointmentId = orderIdFromUrl.startsWith('ORDER_') 
            ? orderIdFromUrl.replace('ORDER_', '') 
            : orderIdFromUrl;
        }
      }
      
      if (!appointmentId) {
        setError('No payment information found. Please try booking again.');
        return;
      }

      console.log('Processing payment for appointment_id:', appointmentId);

      // Step 1: Complete the payment immediately
      console.log('Step 1: Completing payment...');
      try {
        await completePayment(appointmentId, token);
        console.log('✅ Payment completed');
      } catch (err) {
        // If completion fails, it might already be completed - continue anyway
        console.log('Payment completion note:', err.message);
      }

      // Step 2: Fetch payment details
      console.log('Step 2: Fetching payment details...');
      const orderId = `ORDER_${appointmentId}`;
      const response = await fetch(`/api/payments/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Payment fetch failed:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch payment details');
      }

      const result = await response.json();
      console.log('Payment details fetched:', result);
      console.log('Doctor name from API:', result.data?.doctor_name);
      console.log('Doctor specialty from API:', result.data?.doctor_specialty);
      
      if (result.data) {
        setPaymentDetails(result.data);
        console.log('✅ Payment details loaded');
        console.log('Payment details state:', result.data);
      } else {
        throw new Error('No payment data found');
      }
      
      // Clear the stored appointment_id after successful verification
      localStorage.removeItem('pendingPaymentAppointmentId');
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  // Auto-complete pending payment
  const completePayment = async (appointmentId, token) => {
    try {
      console.log('Completing payment for appointment:', appointmentId);
      
      const response = await fetch('/api/payments/complete-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_id: appointmentId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to complete payment:', errorData);
        throw new Error(errorData.error || 'Failed to complete payment');
      }

      const result = await response.json();
      console.log('✅ Payment completed successfully:', result);
      return result;
      
    } catch (err) {
      console.error('Complete payment error:', err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-6" style={{borderColor: '#76C893'}}></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
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
          <h2 className="text-xl font-bold text-gray-800 text-center mb-4">Verification Failed</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate('/appointments')}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            style={{backgroundColor: '#184E77'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#34A0A4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#184E77'}
          >
            View Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
      <div className="max-w-4xl mx-auto">
        {/* Success Header with Animation */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:scale-105 transition-all duration-300">
          <div className="p-10 md:p-16 text-center relative" style={{background: 'linear-gradient(135deg, #76C893 0%, #34A0A4 50%, #184E77 100%)'}}>
            {/* Animated Background Circles */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Success Icon with Animation */}
            <div className="relative z-10 inline-flex items-center justify-center w-28 h-28 bg-white rounded-full mb-8 shadow-2xl animate-bounce">
              <svg className="w-20 h-20" style={{color: '#76C893'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Success Text */}
            <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">Payment Successful!</h1>
            <p className="relative z-10 text-green-100 text-xl font-medium">Your appointment has been confirmed</p>
            
            {/* Confetti Effect */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-ping"
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:shadow-3xl transition-all duration-300">
            <div className="px-8 py-6 border-b" style={{backgroundColor: '#F1FAEE', borderColor: '#34A0A4'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#184E77'}}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold" style={{color: '#184E77'}}>Payment Details</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2 font-medium">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-800 text-sm break-all">{paymentDetails.id}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                  <p className="text-sm text-green-600 mb-2 font-medium">Amount Paid</p>
                  <p className="font-bold text-3xl" style={{color: '#76C893'}}>LKR {paymentDetails.amount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-600 mb-2 font-medium">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize text-lg">{paymentDetails.payment_method}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                  <p className="text-sm text-purple-600 mb-2 font-medium">Payment Gateway</p>
                  <p className="font-semibold text-gray-800 capitalize text-lg">{paymentDetails.payment_gateway}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
                  <p className="text-sm text-orange-600 mb-2 font-medium">Date & Time</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(paymentDetails.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border border-teal-200">
                  <p className="text-sm text-teal-600 mb-2 font-medium">Status</p>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-bold" style={{backgroundColor: '#76C893', color: 'white'}}>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {paymentDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {paymentDetails && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 transform hover:shadow-3xl transition-all duration-300">
            <div className="px-8 py-6 border-b" style={{backgroundColor: '#184E77', borderColor: '#34A0A4'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: '#34A0A4'}}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Appointment Confirmed</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {/* Doctor Information Card */}
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-6 rounded-2xl border-2 border-teal-200">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#184E77'}}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1 font-medium">Your Doctor</p>
                      <p className="font-bold text-2xl text-gray-800 mb-1">{paymentDetails.doctor_name || 'Doctor'}</p>
                      <p className="text-base font-medium" style={{color: '#34A0A4'}}>{paymentDetails.specialty || 'General Medicine'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Date Card */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#34A0A4'}}>
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1 font-medium">Appointment Date & Time</p>
                      <p className="font-bold text-xl text-gray-800 mb-1">
                        {new Date(paymentDetails.scheduled_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-lg font-semibold" style={{color: '#184E77'}}>
                        {new Date(paymentDetails.scheduled_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/appointments')}
            className="text-white font-bold py-5 px-8 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center space-x-3"
            style={{background: 'linear-gradient(135deg, #184E77 0%, #34A0A4 100%)'}}
            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(135deg, #34A0A4 0%, #76C893 100%)'}
            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(135deg, #184E77 0%, #34A0A4 100%)'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-lg">View My Appointments</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-white font-bold py-5 px-8 rounded-2xl transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg border-3 flex items-center justify-center space-x-3"
            style={{borderColor: '#184E77', color: '#184E77', borderWidth: '3px'}}
            onMouseEnter={(e) => {e.target.style.backgroundColor = '#F1FAEE'; e.target.style.borderColor = '#34A0A4'; e.target.style.color = '#34A0A4';}}
            onMouseLeave={(e) => {e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#184E77'; e.target.style.color = '#184E77';}}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2 2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-lg">Back to Home</span>
          </button>
        </div>

        {/* Info Box - What's Next */}
        <div className="mt-8 border-l-6 p-6 rounded-2xl shadow-lg" style={{backgroundColor: '#F1FAEE', borderColor: '#184E77', borderWidth: '6px'}}>
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor: '#184E77'}}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold mb-2" style={{color: '#184E77'}}>What's Next?</p>
              <p className="text-base leading-relaxed" style={{color: '#34A0A4'}}>
                A confirmation email has been sent to your email address. You'll receive a reminder before your appointment. 
                Please arrive 10 minutes early for your consultation.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#76C893'}}></div>
                <p className="text-sm font-medium" style={{color: '#184E77'}}>Check your email for confirmation details</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#76C893'}}></div>
                <p className="text-sm font-medium" style={{color: '#184E77'}}>Add appointment to your calendar</p>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: '#76C893'}}></div>
                <p className="text-sm font-medium" style={{color: '#184E77'}}>Prepare any medical documents or questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
