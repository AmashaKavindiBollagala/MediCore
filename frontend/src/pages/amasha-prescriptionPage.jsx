import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PATIENT_API = import.meta.env.VITE_PATIENT_API_URL || 'http://localhost:3001';

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',       path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/profile',       label: 'My Profile',      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/appointments',  label: 'Appointments',    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/reports',       label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/prescriptions', label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

/* ─── Sidebar (shared with dashboard) ─────────────────────────── */
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
      <div className="p-4 border-t border-white/10">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}

/* ─── Status badge ─────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = {
    active:   { bg: '#DDF4E7', color: '#124170', label: 'Active' },
    expired:  { bg: '#FFE8E8', color: '#C0392B', label: 'Expired' },
    pending:  { bg: '#FFF3CD', color: '#856404', label: 'Pending' },
    completed:{ bg: '#E8F4FD', color: '#1A5276', label: 'Completed' },
  };
  const s = cfg[status?.toLowerCase()] || cfg.active;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

/* ─── Prescription detail modal ────────────────────────────────── */
function PrescriptionModal({ prescription: p, onClose }) {
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(18,65,112,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        style={{ border: '1px solid #DDF4E7' }}
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#DDF4E7' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#124170' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
                Prescription Details
              </h3>
              <p className="text-xs" style={{ color: '#26667F' }}>
                Issued {new Date(p.issued_date || p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ color: '#26667F' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4">
          {/* Doctor & date info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: '#F8FFFE', border: '1px solid #DDF4E7' }}>
              <p className="text-xs mb-1 font-medium" style={{ color: '#26667F' }}>Prescribed by</p>
              <p className="text-sm font-semibold" style={{ color: '#124170' }}>
                {p.doctor_name ? `Dr. ${p.doctor_name}` : 'N/A'}
              </p>
            </div>
            <div className="rounded-xl p-4" style={{ background: '#F8FFFE', border: '1px solid #DDF4E7' }}>
              <p className="text-xs mb-1 font-medium" style={{ color: '#26667F' }}>Expiry date</p>
              <p className="text-sm font-semibold" style={{ color: '#124170' }}>
                {p.expiry_date
                  ? new Date(p.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Diagnosis */}
          {p.diagnosis && (
            <div className="rounded-xl p-4" style={{ background: '#F8FFFE', border: '1px solid #DDF4E7' }}>
              <p className="text-xs mb-1 font-medium" style={{ color: '#26667F' }}>Diagnosis</p>
              <p className="text-sm" style={{ color: '#124170' }}>{p.diagnosis}</p>
            </div>
          )}

          {/* Medications */}
          {p.medications && p.medications.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#26667F' }}>Medications</p>
              <div className="space-y-2">
                {p.medications.map((med, i) => (
                  <div key={i} className="flex items-start justify-between rounded-xl p-3"
                    style={{ background: '#F1FAEE', border: '1px solid #DDF4E7' }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#124170' }}>{med.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#26667F' }}>{med.dosage} · {med.frequency}</p>
                    </div>
                    {med.duration && (
                      <span className="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0"
                        style={{ background: '#DDF4E7', color: '#124170' }}>{med.duration}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {p.notes && (
            <div className="rounded-xl p-4" style={{ background: '#FFF9EC', border: '1px solid #FFE8A3' }}>
              <p className="text-xs mb-1 font-medium" style={{ color: '#856404' }}>Doctor's notes</p>
              <p className="text-sm" style={{ color: '#5C4B00' }}>{p.notes}</p>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 pb-6">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ background: '#124170', fontFamily: "'DM Sans', sans-serif" }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Prescription card ─────────────────────────────────────────── */
function PrescriptionCard({ prescription: p, onClick }) {
  const medCount = p.medications?.length || 0;

  return (
    <div
      onClick={() => onClick(p)}
      className="bg-white rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md group"
      style={{ border: '1px solid #DDF4E7' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: '#F1FAEE' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                stroke="#124170" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#124170' }}>
              {p.doctor_name ? `Dr. ${p.doctor_name}` : `Prescription #${p.id}`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#26667F' }}>
              {new Date(p.issued_date || p.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
          </div>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {p.diagnosis && (
        <p className="text-xs mb-3 line-clamp-1" style={{ color: '#26667F' }}>
          <span className="font-medium">Diagnosis: </span>{p.diagnosis}
        </p>
      )}

      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F1FAEE' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#DDF4E7' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3" stroke="#124170" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="#124170" strokeWidth="1.8"/>
            </svg>
          </div>
          <span className="text-xs" style={{ color: '#26667F' }}>
            {medCount} medication{medCount !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
          style={{ color: '#34A0A4' }}>
          View details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default function PrescriptionsPage() {
  const navigate = useNavigate();
  const [user, setUser]                     = useState(null);
  const [prescriptions, setPrescriptions]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selected, setSelected]             = useState(null);
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));

    const token = localStorage.getItem('token');
    fetch(`${PATIENT_API}/api/patients/prescriptions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch');
        return r.json();
      })
      .then(data => { setPrescriptions(data); setLoading(false); })
      .catch(() => { setError('Unable to load prescriptions.'); setLoading(false); });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  /* filter & search */
  const filtered = prescriptions.filter(p => {
    const matchesStatus = filterStatus === 'all' || p.status?.toLowerCase() === filterStatus;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.doctor_name?.toLowerCase().includes(q) ||
      p.diagnosis?.toLowerCase().includes(q) ||
      p.medications?.some(m => m.name?.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all:       prescriptions.length,
    active:    prescriptions.filter(p => p.status?.toLowerCase() === 'active').length,
    expired:   prescriptions.filter(p => p.status?.toLowerCase() === 'expired').length,
    completed: prescriptions.filter(p => p.status?.toLowerCase() === 'completed').length,
  };

  return (
    <div className="flex min-h-screen" style={{ background: '#F1FAEE' }}>
      <Sidebar user={user} onLogout={handleLogout} />

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
              Prescriptions
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#26667F', fontFamily: "'DM Sans', sans-serif" }}>
              View and manage all your prescriptions in one place.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {['all', 'active', 'expired', 'completed'].map(tab => (
            <button key={tab}
              onClick={() => setFilterStatus(tab)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={{
                background: filterStatus === tab ? '#124170' : 'white',
                color: filterStatus === tab ? 'white' : '#26667F',
                border: '1px solid',
                borderColor: filterStatus === tab ? '#124170' : '#DDF4E7',
              }}>
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({statusCounts[tab] ?? 0})</span>
            </button>
          ))}

          {/* Search */}
          <div className="ml-auto relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="#26667F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Search prescriptions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{
                background: 'white',
                border: '1px solid #DDF4E7',
                color: '#124170',
                width: '220px',
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid #DDF4E7' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl" style={{ background: '#F1FAEE' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded" style={{ background: '#F1FAEE', width: '60%' }} />
                    <div className="h-2 rounded" style={{ background: '#F1FAEE', width: '40%' }} />
                  </div>
                </div>
                <div className="h-2 rounded mb-2" style={{ background: '#F1FAEE' }} />
                <div className="h-2 rounded" style={{ background: '#F1FAEE', width: '70%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center" style={{ border: '1px solid #DDF4E7' }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#FFE8E8' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#C0392B' }}>{error}</p>
            <button onClick={() => window.location.reload()}
              className="mt-3 text-sm font-semibold" style={{ color: '#124170' }}>
              Try again →
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #DDF4E7' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#F1FAEE' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  stroke="#76C893" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
              {search || filterStatus !== 'all' ? 'No results found' : 'No prescriptions yet'}
            </p>
            <p className="text-sm" style={{ color: '#26667F' }}>
              {search || filterStatus !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Your prescriptions from doctors will appear here.'}
            </p>
            {(search || filterStatus !== 'all') && (
              <button onClick={() => { setSearch(''); setFilterStatus('all'); }}
                className="mt-3 text-sm font-semibold" style={{ color: '#34A0A4' }}>
                Clear filters →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <PrescriptionCard key={p.id} prescription={p} onClick={setSelected} />
            ))}
          </div>
        )}
      </main>

      {/* Detail modal */}
      <PrescriptionModal prescription={selected} onClose={() => setSelected(null)} />
    </div>
  );
}