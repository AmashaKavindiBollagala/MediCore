import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const navItems = [
  { to: '/patient-dashboard',      label: 'Dashboard',       path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/patient-profile',        label: 'My Profile',      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/appointments',   label: 'Appointments',    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/patient-reports',        label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/patient-prescription',  label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

function Sidebar({ user, onLogout }) {
  const loc = window.location.pathname;
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #124170 0%, #1a5a8a 100%)' }}>
      {/* Brand */}
      {/* <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#67C090' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>MediCore</span>
        </div>
      </div> */}

      {/* User pill */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(103,192,144,0.15)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: '#26667F' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div>
              <p className="text-white font-medium text-sm truncate max-w-[120px]">{user?.name || 'Patient'}</p>
              <p className="text-xs capitalize" style={{ color: '#67C090' }}>Patient</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, path }) => {
          const isActive = loc === to;
          return (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: isActive ? '#26667F' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="currentColor" d={path} />
              </svg>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      {/* <div className="p-4 border-t border-white/10">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div> */}
    </aside>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 flex items-center gap-4" style={{ border: '1px solid #DDF4E7' }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="white" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>{value}</p>
        <p className="text-sm" style={{ color: '#26667F' }}>{label}</p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [user, setUser]               = useState(null);
  const [reports, setReports]         = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${API_URL}/api/patients/reports`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setReports)
      .catch(() => setReports([]));
    fetch(`${API_URL}/api/patients/prescriptions`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setPrescriptions)
      .catch(() => setPrescriptions([]));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#F1FAEE' }}>
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#26667F', fontFamily: "'DM Sans', sans-serif" }}>
            Here's your health summary for today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Medical Reports" value={reports.length} color="#124170"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          <StatCard label="Prescriptions" value={prescriptions.length} color="#34A0A4"
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <StatCard label="Appointments" value="0" color="#76C893"
            icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #DDF4E7' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
            Quick actions
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              { to: '/patient-profile',      label: 'Update profile',    bg: '#124170' },
              { to: '/patient-reports',      label: 'Upload report',     bg: '#34A0A4' },
              { to: '/appointments/book',    label: 'Book appointment',  bg: '#76C893' },
            ].map(({ to, label, bg }) => (
              <Link key={to} to={to}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
                style={{ background: bg, fontFamily: "'DM Sans', sans-serif" }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Recent reports */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDF4E7' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
              Recent medical reports
            </h2>
            <Link to="/patient-reports" className="text-sm font-medium" style={{ color: '#34A0A4' }}>View all →</Link>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#F1FAEE' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#76C893" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="text-sm" style={{ color: '#26667F' }}>No reports uploaded yet.</p>
              <Link to="/patient-reports" className="text-sm font-semibold mt-1 inline-block" style={{ color: '#124170' }}>Upload your first report →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#F8FFFE', border: '1px solid #DDF4E7' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F1FAEE' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#124170" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#124170' }}>{r.file_name}</p>
                      <p className="text-xs" style={{ color: '#26667F' }}>{r.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs mb-1" style={{ color: '#26667F' }}>
                      {new Date(r.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#DDF4E7', color: '#124170' }}>
                      {r.file_name.split('.').pop().toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}