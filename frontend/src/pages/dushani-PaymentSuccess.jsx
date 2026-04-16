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
      const orderId = searchParams.get('order_id');
      const token = localStorage.getItem('token');

      if (!orderId) {
        setError('No payment information found');
        return;
      }

      // Fetch payment details
      const response = await fetch(`/api/payments/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment details');
      }

      const result = await response.json();
      setPaymentDetails(result.data);
    } catch (err) {
      console.error('Payment verification error:', err);
      setError(err.message || 'Failed to verify payment');
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="p-8 md:p-12 text-center" style={{background: 'linear-gradient(90deg, #76C893 0%, #34A0A4 100%)'}}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 animate-bounce">
              <svg className="w-16 h-16" style={{color: '#76C893'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-green-100 text-lg">Your appointment has been confirmed</p>
          </div>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b" style={{backgroundColor: '#F1FAEE', borderColor: '#34A0A4'}}>
              <h2 className="text-xl font-bold" style={{color: '#184E77'}}>Payment Details</h2>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-800">{paymentDetails.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="font-bold text-2xl" style={{color: '#76C893'}}>LKR {paymentDetails.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize">{paymentDetails.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Gateway</p>
                  <p className="font-semibold text-gray-800 capitalize">{paymentDetails.payment_gateway}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date & Time</p>
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
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{backgroundColor: '#F1FAEE', color: '#76C893'}}>
                    {paymentDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        {paymentDetails && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b" style={{backgroundColor: '#184E77', borderColor: '#34A0A4'}}>
              <h2 className="text-xl font-bold text-white">Appointment Confirmed</h2>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-semibold text-gray-800">{paymentDetails.doctor_name}</p>
                  <p className="text-sm" style={{color: '#34A0A4'}}>{paymentDetails.specialty}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#34A0A4'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Appointment Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(paymentDetails.scheduled_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(paymentDetails.scheduled_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/appointments')}
            className="text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
            style={{background: 'linear-gradient(90deg, #184E77 0%, #34A0A4 100%)'}}
            onMouseEnter={(e) => e.target.style.background = 'linear-gradient(90deg, #34A0A4 0%, #76C893 100%)'}
            onMouseLeave={(e) => e.target.style.background = 'linear-gradient(90deg, #184E77 0%, #34A0A4 100%)'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>View My Appointments</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="bg-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg border-2 flex items-center justify-center space-x-2"
            style={{borderColor: '#184E77', color: '#184E77'}}
            onMouseEnter={(e) => {e.target.style.backgroundColor = '#F1FAEE'; e.target.style.borderColor = '#34A0A4'; e.target.style.color = '#34A0A4';}}
            onMouseLeave={(e) => {e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#184E77'; e.target.style.color = '#184E77';}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 border-l-4 p-4 rounded-lg" style={{backgroundColor: '#F1FAEE', borderColor: '#184E77'}}>
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 flex-shrink-0" style={{color: '#184E77'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold mb-1" style={{color: '#184E77'}}>What's Next?</p>
              <p className="text-sm" style={{color: '#34A0A4'}}>
                A confirmation email has been sent to your email address. You'll receive a reminder before your appointment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
