import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/admin';

export default function DilsharaPaymentOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch stats, transactions, and analytics in parallel
      const [statsRes, transRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE}/payments/stats`, { headers }),
        fetch(`${API_BASE}/payments/transactions?status=${filterStatus}`, { headers }),
        fetch(`${API_BASE}/payments/analytics`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const transData = await transRes.json();
      const analyticsData = await analyticsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (transData.success) setTransactions(transData.data);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/payments/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedTransaction(data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch transaction details:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount) => {
    return `LKR ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Simple bar chart component for daily revenue
  const RevenueChart = () => {
    if (!analytics?.daily_revenue || analytics.daily_revenue.length === 0) return null;

    const maxRevenue = Math.max(...analytics.daily_revenue.map(d => parseFloat(d.revenue)));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Revenue (Last 7 Days)</h3>
        <div className="flex items-end space-x-2 h-48">
          {analytics.daily_revenue.map((day, idx) => {
            const height = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="text-xs mb-1">{formatCurrency(day.revenue)}</div>
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${height}%`, minHeight: '4px' }}
                ></div>
                <div className="text-xs mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Status breakdown pie chart (simplified as bars)
  const StatusChart = () => {
    if (!analytics?.status_breakdown) return null;

    const total = analytics.status_breakdown.reduce((sum, s) => sum + parseInt(s.count), 0);

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Payments by Status</h3>
        <div className="space-y-3">
          {analytics.status_breakdown.map((status, idx) => {
            const percentage = total > 0 ? (parseInt(status.count) / total) * 100 : 0;
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{status.status}</span>
                  <span>{status.count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getStatusColor(status.status).split(' ')[0]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Overview</h1>
          <p className="text-gray-600 mt-1">Monitor all transactions and payment analytics</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_revenue)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Today's Revenue</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.today_revenue)}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending_count}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-2xl font-bold text-red-600">{stats.failed_count}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Refunded</div>
            <div className="text-2xl font-bold text-gray-600">{stats.refunded_count}</div>
          </div>
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <StatusChart />
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Transactions</h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Filter by Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(transaction.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{transaction.patient_name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{transaction.patient_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{transaction.doctor_name || 'N/A'}</div>
                      <div className="text-gray-500 text-xs">{transaction.doctor_specialty}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.payment_method || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetails(transaction.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Transaction Details</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Transaction ID</label>
                  <div className="font-mono text-sm">{selectedTransaction.id}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Amount</label>
                  <div className="text-lg font-bold">{formatCurrency(selectedTransaction.amount)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Currency</label>
                  <div>{selectedTransaction.currency}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Payment Method</label>
                  <div>{selectedTransaction.payment_method || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Payment Gateway</label>
                  <div>{selectedTransaction.payment_gateway}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Patient</label>
                  <div className="font-medium">{selectedTransaction.patient_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{selectedTransaction.patient_email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Doctor</label>
                  <div className="font-medium">{selectedTransaction.doctor_name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{selectedTransaction.doctor_specialty}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Created At</label>
                  <div>{formatDate(selectedTransaction.created_at)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Updated At</label>
                  <div>{formatDate(selectedTransaction.updated_at)}</div>
                </div>
                {selectedTransaction.gateway_transaction_id && (
                  <div>
                    <label className="text-sm text-gray-600">Gateway Transaction ID</label>
                    <div className="font-mono text-sm">{selectedTransaction.gateway_transaction_id}</div>
                  </div>
                )}
                {selectedTransaction.refund_reason && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Refund Reason</label>
                    <div className="text-red-600">{selectedTransaction.refund_reason}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
