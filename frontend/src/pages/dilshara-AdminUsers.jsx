import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/admin';

export default function DilsharaAdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role: filterRole,
        status: filterStatus,
        search: search,
      });
      const res = await fetch(`${API_BASE}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedUser(data);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const handleSuspendUser = async (userId) => {
    const reason = prompt('Enter reason for suspension (optional):');
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('User suspended successfully');
        fetchUsers();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to suspend user:', err);
      alert('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    if (!window.confirm('Are you sure you want to activate this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userId}/activate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert('User activated successfully');
        fetchUsers();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to activate user:', err);
      alert('Failed to activate user');
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Enter reason for ban (required):');
    if (!reason) return;

    if (!window.confirm('Are you sure you want to permanently ban this user? This action is severe.')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('User banned successfully');
        fetchUsers();
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Failed to ban user:', err);
      alert('Failed to ban user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'doctor': return 'bg-green-100 text-green-800';
      case 'patient': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower) ||
      user.status?.toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">View and manage all registered users</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Users</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Suspended</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.suspended}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Banned</div>
            <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="doctor">Doctors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status || 'active')}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(user.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(user.last_login)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleViewDetails(user.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                      {(user.status === 'active' || !user.status) && (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-yellow-600 hover:text-yellow-800 font-medium"
                        >
                          Suspend
                        </button>
                      )}
                      {user.status === 'suspended' && (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          Activate
                        </button>
                      )}
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Details</h2>
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
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="font-medium">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Role</label>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status || 'active')}`}>
                      {selectedUser.status || 'active'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Joined Date</label>
                  <div>{formatDateTime(selectedUser.created_at)}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Last Login</label>
                  <div>{formatDateTime(selectedUser.last_login)}</div>
                </div>
                {selectedUser.suspension_reason && (
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">Suspension Reason</label>
                    <div className="text-red-600">{selectedUser.suspension_reason}</div>
                  </div>
                )}
                {selectedUser.role === 'doctor' && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Specialty</label>
                      <div>{selectedUser.doctor_specialty || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Hospital</label>
                      <div>{selectedUser.doctor_hospital || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Verification Status</label>
                      <div>{selectedUser.doctor_verification_status || 'N/A'}</div>
                    </div>
                  </>
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
