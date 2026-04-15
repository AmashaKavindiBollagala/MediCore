import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [userRole, setUserRole] = useState('patient');

  useEffect(() => {
    fetchPayments();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'patient');
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to view payment history');
        navigate('/login');
        return;
      }

      const endpoint = userRole === 'doctor' 
        ? '/api/payments/doctor/my-earnings'
        : '/api/payments/patient/my-payments';

      const url = filter ? `${endpoint}?status=${filter}` : endpoint;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const result = await response.json();
      setPayments(result.data || []);
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'PENDING':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'FAILED':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'REFUNDED':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mx-auto mb-6" style={{borderColor: '#184E77'}}></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Payments...</h2>
          <p className="text-gray-600">Please wait</p>
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
            onClick={() => navigate('/')}
            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            style={{backgroundColor: '#184E77'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#34A0A4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#184E77'}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 px-4" style={{background: 'linear-gradient(135deg, #F1FAEE 0%, #34A0A4 100%)'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{color: '#184E77'}}>
            {userRole === 'doctor' ? 'My Earnings' : 'Payment History'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'doctor' ? 'Track your earnings from appointments' : 'View all your payment transactions'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 overflow-x-auto">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === ''
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
              style={filter === '' ? {backgroundColor: '#184E77'} : {backgroundColor: '#F1FAEE'}}
              onMouseEnter={(e) => {if (filter !== '') e.target.style.backgroundColor = '#FFE5EC';}}
              onMouseLeave={(e) => {if (filter !== '') e.target.style.backgroundColor = '#F1FAEE';}}
            >
              All
            </button>
            <button
              onClick={() => setFilter('SUCCESS')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'SUCCESS'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
              style={filter === 'SUCCESS' ? {backgroundColor: '#76C893'} : {backgroundColor: '#F1FAEE'}}
              onMouseEnter={(e) => {if (filter !== 'SUCCESS') e.target.style.backgroundColor = '#FFE5EC';}}
              onMouseLeave={(e) => {if (filter !== 'SUCCESS') e.target.style.backgroundColor = '#F1FAEE';}}
            >
              Successful
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'PENDING'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
              style={filter === 'PENDING' ? {backgroundColor: '#34A0A4'} : {backgroundColor: '#F1FAEE'}}
              onMouseEnter={(e) => {if (filter !== 'PENDING') e.target.style.backgroundColor = '#FFE5EC';}}
              onMouseLeave={(e) => {if (filter !== 'PENDING') e.target.style.backgroundColor = '#F1FAEE';}}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('REFUNDED')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'REFUNDED'
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
              style={filter === 'REFUNDED' ? {backgroundColor: '#184E77'} : {backgroundColor: '#F1FAEE'}}
              onMouseEnter={(e) => {if (filter !== 'REFUNDED') e.target.style.backgroundColor = '#FFE5EC';}}
              onMouseLeave={(e) => {if (filter !== 'REFUNDED') e.target.style.backgroundColor = '#F1FAEE';}}
            >
              Refunded
            </button>
          </div>
        </div>

        {/* Payment List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Payments Found</h3>
            <p className="text-gray-600 mb-6">
              {filter ? 'No payments match the selected filter' : 'You have no payment history yet'}
            </p>
            <button
              onClick={() => navigate('/appointments/book')}
              className="text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              style={{backgroundColor: '#184E77'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#34A0A4'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#184E77'}
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section - Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold" style={{color: '#184E77'}}>
                              LKR {payment.amount}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {getStatusIcon(payment.status)}
                              <span>{payment.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Transaction ID: {payment.id}
                          </p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {userRole === 'doctor' ? 'Patient' : 'Doctor'}
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            {userRole === 'doctor'
                              ? payment.patient_name
                              : payment.doctor_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Specialty</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {payment.specialty}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Date</p>
                          <p className="text-sm font-semibold text-gray-800">
                            {new Date(payment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                          <p className="text-sm font-semibold text-gray-800 capitalize">
                            {payment.payment_method}
                          </p>
                        </div>
                      </div>

                      {/* Appointment Date */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>
                            Appointment: {new Date(payment.scheduled_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex md:flex-col gap-2 md:border-l md:border-gray-200 md:pl-4">
                      <button
                        onClick={() => navigate(`/payments/${payment.id}`)}
                        className="flex-1 md:flex-none font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                        style={{backgroundColor: '#F1FAEE', color: '#184E77'}}
                        onMouseEnter={(e) => {e.target.style.backgroundColor = '#FFE5EC'; e.target.style.color = '#34A0A4';}}
                        onMouseLeave={(e) => {e.target.style.backgroundColor = '#F1FAEE'; e.target.style.color = '#184E77';}}
                      >
                        View Details
                      </button>
                      {payment.status === 'SUCCESS' && (
                        <button
                          className="flex-1 md:flex-none font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                          style={{backgroundColor: '#F1FAEE', color: '#34A0A4'}}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#FFE5EC'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#F1FAEE'}
                        >
                          Download Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg inline-flex items-center gap-2"
            style={{color: '#184E77'}}
            onMouseEnter={(e) => {e.target.style.backgroundColor = '#F1FAEE'; e.target.style.color = '#34A0A4';}}
            onMouseLeave={(e) => {e.target.style.backgroundColor = '#ffffff'; e.target.style.color = '#184E77';}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
