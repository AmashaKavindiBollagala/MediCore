import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
      <div className="max-w-2xl w-full">
        {/* Cancel Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 text-center" style={{background: 'linear-gradient(90deg, #FFE5EC 0%, #34A0A4 100%)'}}>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6">
              <svg className="w-16 h-16" style={{color: '#FFE5EC'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-orange-100 text-lg">Your payment was not completed</p>
          </div>

          {/* Content */}
          <div className="p-6 md:p-10 space-y-6">
            {/* Message */}
            <div className="text-center">
              <p className="text-gray-700 text-lg mb-2">
                Your appointment booking is still pending.
              </p>
              <p className="text-gray-600">
                You can retry the payment or book a different appointment.
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-lg p-4" style={{backgroundColor: '#FFE5EC', borderLeft: '4px solid #FFE5EC'}}>
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{color: '#FFE5EC'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{color: '#184E77'}}>What happened?</p>
                  <p className="text-sm" style={{color: '#34A0A4'}}>
                    The payment process was cancelled or interrupted. No charges were made to your account. 
                    Your appointment is reserved for a limited time.
                  </p>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="rounded-lg p-6" style={{backgroundColor: '#F1FAEE'}}>
              <h3 className="font-bold mb-3 flex items-center" style={{color: '#184E77'}}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need Help?
              </h3>
              <ul className="space-y-2 text-sm" style={{color: '#34A0A4'}}>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Check your internet connection and try again
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ensure your payment details are correct
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contact your bank if the issue persists
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => navigate('/appointments')}
                className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center space-x-2"
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
                onClick={() => navigate('/appointments/book')}
                className="w-full bg-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg border-2 flex items-center justify-center space-x-2"
                style={{borderColor: '#184E77', color: '#184E77'}}
                onMouseEnter={(e) => {e.target.style.backgroundColor = '#F1FAEE'; e.target.style.borderColor = '#34A0A4'; e.target.style.color = '#34A0A4';}}
                onMouseLeave={(e) => {e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#184E77'; e.target.style.color = '#184E77';}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Book New Appointment</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full font-semibold py-3 px-6 rounded-lg transition-colors"
                style={{backgroundColor: '#FFE5EC', color: '#184E77'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F1FAEE'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#FFE5EC'}
              >
                Back to Home
              </button>
            </div>

            {/* Contact Support */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Still having issues?</p>
              <a
                href="mailto:support@medicare.com"
                className="hover:underline font-semibold text-sm inline-flex items-center"
                style={{color: '#34A0A4'}}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
