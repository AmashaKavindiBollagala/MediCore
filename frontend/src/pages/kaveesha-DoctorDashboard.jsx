import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KaveeshaDoctorAvailability from './kaveesha-DoctorAvailability';
import KaveeshaDoctorProfile from './kaveesha-doctorProfile';

const COLORS = {
  navy: '#184E77',
  teal: '#34A0A4',
  mint: '#76C893',
  cream: '#F1FAEE',
  blush: '#FFE5EC',
  navyLight: '#1B6CA8',
  tealLight: '#52B5BA',
  mintLight: '#A8DDB5',
  navyDark: '#0D3352',
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'appointments', label: 'Appointments', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'availability', label: 'Availability', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'prescriptions', label: 'Prescriptions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'reports', label: 'Patient Reports', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'profile', label: 'My Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

const STATUS_STYLES = {
  PENDING_PAYMENT: { bg: '#FFF3CD', color: '#7D5A00', border: '#F0C040', label: 'Pending' },
  CONFIRMED:       { bg: '#D8F3E8', color: '#0D5E35', border: '#76C893', label: 'Confirmed' },
  COMPLETED:       { bg: '#D6EAF8', color: '#0D3352', border: '#34A0A4', label: 'Completed' },
  CANCELLED:       { bg: '#FFE5EC', color: '#8B1A30', border: '#F5A0B5', label: 'Cancelled' },
  REJECTED:        { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: 'Rejected' },
};

const STAT_CONFIG = [
  { key: 'today',     label: "Today's Appointments", sub: 'Scheduled today',  color: COLORS.navy,  bg: '#EBF4FF', icon: '📅' },
  { key: 'confirmed', label: 'Confirmed',             sub: 'Upcoming',         color: COLORS.teal,  bg: '#E0F5F5', icon: '✅' },
  { key: 'completed', label: 'Completed',             sub: 'All time',         color: COLORS.mint,  bg: '#E8F8EE', icon: '🏁' },
  { key: 'pending',   label: 'Awaiting Approval',     sub: 'Need action',      color: '#C0703B',    bg: '#FFF0E6', icon: '⏳' },
];

const StatCard = ({ label, value, sub, color, bg }) => (
  <div style={{
    background: 'white',
    borderRadius: 20,
    padding: '24px 26px',
    border: `1.5px solid ${bg}`,
    flex: 1,
    minWidth: 150,
    boxShadow: '0 2px 12px rgba(24,78,119,0.07)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: -16, right: -16,
      width: 80, height: 80, borderRadius: '50%',
      background: bg, opacity: 0.7,
    }} />
    <div style={{
      width: 46, height: 46, borderRadius: 14,
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', marginBottom: 16, fontSize: 22,
    }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: color, opacity: 0.85 }} />
    </div>
    <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{value}</p>
    <p style={{ margin: '8px 0 4px', fontSize: 15, fontWeight: 600, color: COLORS.navy }}>{label}</p>
    {sub && <p style={{ margin: 0, fontSize: 12, color: color, fontWeight: 500 }}>{sub}</p>}
  </div>
);

export default function KaveeshaDoctorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => { fetchProfile(); }, []);

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'prescriptions') fetchPrescriptions();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching doctor profile...');
      console.log('Token:', token ? token.substring(0, 20) + '...' : 'No token');
      const res = await fetch('/api/doctors/me/profile', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log('Profile response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('✅ Profile data received:', data);
        console.log('Doctor name:', data.first_name, data.last_name);
        console.log('Doctor email:', data.email);
        setDoctor(data);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Profile fetch failed:', res.status, errorData);
      }
    } catch (err) {
      console.error('❌ Profile fetch error:', err.message);
      console.error('Full error:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch('/api/doctors/me/appointments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAppointments(await res.json());
    } catch { } finally { setLoadingAppts(false); }
  };

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const res = await fetch('/api/doctors/me/prescriptions', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPrescriptions(await res.json());
    } catch { } finally { setLoadingPrescriptions(false); }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/doctors/me/reports', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReports(await res.json());
    } catch { } finally { setLoadingReports(false); }
  };

  const handleAppointmentAction = async (id, action) => {
    try {
      await fetch(`/api/appointments/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      fetchAppointments();
    } catch { }
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initials = doctor
    ? `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase()
    : 'DR';

  const stats = {
    today: appointments.filter(a => new Date(a.scheduled_at).toDateString() === new Date().toDateString()).length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    pending: appointments.filter(a => a.status === 'PENDING_PAYMENT').length,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: COLORS.cream, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 260 : 78, minHeight: '100vh',
        background: COLORS.navy,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '4px 0 24px rgba(24,78,119,0.15)',
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '28px 22px 22px' : '28px 16px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: COLORS.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
              Medi<span style={{ color: COLORS.mint }}>Core</span>
            </span>
          )}
        </div>

        {/* Doctor info */}
        {sidebarOpen && doctor && (
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.mintLight }}>{doctor.specialty}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', width: 'fit-content' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: doctor.verification_status === 'approved' ? COLORS.mint : '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: doctor.verification_status === 'approved' ? COLORS.mintLight : '#FCD34D', fontWeight: 500 }}>
                {doctor.verification_status === 'approved' ? 'Verified Doctor' : 'Pending Verification'}
              </span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            const handleClick = id === 'appointments'
              ? () => navigate('/doctor-appointments')
              : () => setActiveTab(id);
            return (
              <button key={id} onClick={handleClick} style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: active ? COLORS.teal : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                marginBottom: 4, fontWeight: active ? 700 : 400,
                fontSize: 15, textAlign: 'left', transition: 'all 0.18s',
              }}>
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>{icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {active && sidebarOpen && (
                  <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: COLORS.mint }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'transparent', color: COLORS.blush, fontSize: 15, fontWeight: 500,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, padding: '32px 36px', overflow: 'auto', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(s => !s)} style={{
              background: 'white', border: `1.5px solid #E0EFF5`,
              borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: COLORS.navy,
              boxShadow: '0 2px 8px rgba(24,78,119,0.08)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: COLORS.navy }}>
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: COLORS.teal, fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notification bell */}
            <div style={{
              width: 42, height: 42, borderRadius: 12, background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #E0EFF5', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(24,78,119,0.08)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={COLORS.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 15, fontWeight: 700,
              border: `2px solid ${COLORS.mint}`,
              boxShadow: '0 2px 10px rgba(52,160,164,0.3)',
            }}>
              {initials}
            </div>
          </div>
        </div>

        {/* ── Overview ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 32, flexWrap: 'wrap' }}>
              {STAT_CONFIG.map(cfg => (
                <StatCard key={cfg.key} label={cfg.label} value={stats[cfg.key]} sub={cfg.sub} color={cfg.color} bg={cfg.bg} />
              ))}
            </div>

            {/* Welcome hero card */}
            <div style={{
              background: COLORS.navy,
              borderRadius: 24, padding: '34px 38px', color: 'white',
              marginBottom: 28, position: 'relative', overflow: 'hidden',
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200, borderRadius: '50%', background: 'rgba(52,160,164,0.15)' }} />
              <div style={{ position: 'absolute', right: 100, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(118,200,147,0.12)' }} />
              <div style={{ position: 'absolute', left: -20, bottom: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,229,236,0.07)' }} />

              {/* Decorative plus icons */}
              <div style={{ position: 'absolute', right: 48, top: 32, opacity: 0.2 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.mint }} />
                  <span style={{ fontSize: 13, color: COLORS.mintLight, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Doctor Portal</span>
                </div>
                <h2 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>
                  Welcome back, Dr. {doctor?.first_name || '—'} 👋
                </h2>
                <p style={{ margin: '0 0 24px', opacity: 0.75, fontSize: 16 }}>
                  {doctor?.specialty} · {doctor?.hospital}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => navigate('/doctor-appointments')} style={{
                    background: COLORS.teal, border: 'none',
                    borderRadius: 12, padding: '11px 22px', color: 'white',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(52,160,164,0.4)',
                  }}>
                    View Appointments →
                  </button>
                  <button onClick={() => setActiveTab('availability')} style={{
                    background: 'rgba(118,200,147,0.2)', border: `1.5px solid ${COLORS.mint}`,
                    borderRadius: 12, padding: '11px 22px', color: COLORS.mint,
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}>
                    Manage Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Recent appointments */}
            <div style={{
              background: 'white', borderRadius: 20,
              border: `1.5px solid #E0EFF5`, padding: '24px 28px',
              boxShadow: '0 2px 16px rgba(24,78,119,0.06)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: COLORS.navy }}>Recent Appointments</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: COLORS.teal }}>Latest patient bookings</p>
                </div>
                <button onClick={() => setActiveTab('appointments')} style={{
                  background: COLORS.cream, border: `1.5px solid ${COLORS.mint}`,
                  borderRadius: 10, padding: '8px 16px', color: COLORS.navy,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>
                  View all →
                </button>
              </div>
              {appointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ color: COLORS.teal, fontSize: 15, margin: 0 }}>No appointments yet. Share your profile to start receiving bookings.</p>
                </div>
              ) : (
                appointments.slice(0, 4).map(appt => (
                  <AppointmentRow key={appt.id} appt={appt} onAction={handleAppointmentAction} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Appointments tab ── */}
        {activeTab === 'appointments' && (
          <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E0EFF5', padding: '28px', boxShadow: '0 2px 16px rgba(24,78,119,0.06)' }}>
            <AppointmentsPanel appointments={appointments} loading={loadingAppts} onAction={handleAppointmentAction} onRefresh={fetchAppointments} />
          </div>
        )}

        {/* ── Availability tab ── */}
        {activeTab === 'availability' && <KaveeshaDoctorAvailability token={token} />}

        {/* ── Prescriptions tab ── */}
        {activeTab === 'prescriptions' && (
          <PrescriptionsPanel prescriptions={prescriptions} loading={loadingPrescriptions} onRefresh={fetchPrescriptions} token={token} />
        )}

        {/* ── Reports tab ── */}
        {activeTab === 'reports' && (
          <ReportsPanel reports={reports} loading={loadingReports} onRefresh={fetchReports} />
        )}

        {/* ── Profile tab ── */}
        {activeTab === 'profile' && (
          <KaveeshaDoctorProfile doctor={doctor} onRefresh={fetchProfile} token={token} />
        )}
      </main>
    </div>
  );
}

// ── AppointmentRow ─────────────────────────────────────────────────────────────
function AppointmentRow({ appt, onAction }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.PENDING_PAYMENT;
  const date = new Date(appt.scheduled_at);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '16px 0', borderBottom: `1px solid ${COLORS.cream}`,
    }}>
      {/* Date badge */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: COLORS.cream, border: `1.5px solid #C8E6C9`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: COLORS.navy }}>{date.getDate()}</span>
        <span style={{ fontSize: 10, color: COLORS.teal, textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
          {date.toLocaleString('default', { month: 'short' })}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.navy }}>{appt.patient_name || 'Patient'}</p>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: COLORS.teal }}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          &nbsp;·&nbsp;
          {appt.consultation_type === 'video' ? '🎥 Video' : '🏥 In-person'}
        </p>
      </div>

      <span style={{
        background: s.bg, color: s.color, fontSize: 12, fontWeight: 700,
        padding: '5px 14px', borderRadius: 20, border: `1px solid ${s.border}`,
        letterSpacing: 0.3,
      }}>
        {s.label}
      </span>

      {appt.status === 'CONFIRMED' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onAction(appt.id, 'complete')} style={{
            background: '#D8F3E8', color: COLORS.navy, border: `1px solid ${COLORS.mint}`,
            borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>Done</button>
          <button onClick={() => onAction(appt.id, 'reject')} style={{
            background: COLORS.blush, color: '#8B1A30', border: '1px solid #F5A0B5',
            borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      )}
      {appt.status === 'PENDING_PAYMENT' && (
        <button onClick={() => onAction(appt.id, 'confirm')} style={{
          background: COLORS.cream, color: COLORS.navy, border: `1.5px solid ${COLORS.teal}`,
          borderRadius: 10, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
        }}>Confirm</button>
      )}
    </div>
  );
}

// ── AppointmentsPanel ──────────────────────────────────────────────────────────
function AppointmentsPanel({ appointments, loading, onAction, onRefresh }) {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.navy }}>Appointments</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.teal }}>Manage your patient bookings</p>
        </div>
        <button onClick={onRefresh} style={{
          background: COLORS.cream, border: `1.5px solid ${COLORS.mint}`,
          borderRadius: 10, padding: '9px 18px', color: COLORS.navy,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 700,
            background: filter === f ? COLORS.navy : 'white',
            color: filter === f ? 'white' : COLORS.teal,
            border: `1.5px solid ${filter === f ? COLORS.navy : COLORS.teal}`,
            transition: 'all 0.15s',
          }}>
            {f === 'ALL' ? 'All' : STATUS_STYLES[f]?.label || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: COLORS.teal, fontSize: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading appointments...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p style={{ color: COLORS.teal, fontSize: 16, margin: 0 }}>No appointments found.</p>
        </div>
      ) : (
        filtered.map(appt => <AppointmentRow key={appt.id} appt={appt} onAction={onAction} />)
      )}
    </div>
  );
}

// ── PrescriptionsPanel ─────────────────────────────────────────────────────────
function PrescriptionsPanel({ prescriptions, loading, onRefresh, token }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E0EFF5', padding: '28px', boxShadow: '0 2px 16px rgba(24,78,119,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.navy }}>Prescriptions</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.teal }}>Patient medication records</p>
        </div>
        <button onClick={onRefresh} style={{
          background: COLORS.cream, border: `1.5px solid ${COLORS.mint}`,
          borderRadius: 10, padding: '9px 18px', color: COLORS.navy,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: COLORS.teal, fontSize: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading prescriptions...
        </div>
      ) : prescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
          <p style={{ color: COLORS.teal, fontSize: 16, margin: 0 }}>No prescriptions issued yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {prescriptions.map(rx => (
            <div key={rx.id} style={{
              border: `1.5px solid ${COLORS.mint}`, borderRadius: 16,
              padding: '20px 22px', background: COLORS.cream,
              boxShadow: '0 2px 8px rgba(24,78,119,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.navy }}>Patient ID: {rx.patient_id}</p>
                <span style={{
                  fontSize: 12, color: COLORS.teal, fontWeight: 600,
                  background: 'white', padding: '4px 12px', borderRadius: 20, border: `1px solid ${COLORS.teal}`,
                }}>
                  {new Date(rx.issued_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>
                <p style={{ margin: '4px 0', fontSize: 14, color: COLORS.navy }}>
                  <strong>Medications:</strong> {rx.prescription_data?.medications?.length || 0} item(s)
                </p>
                {rx.notes && (
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5A7A8A' }}>
                    <strong>Notes:</strong> {rx.notes}
                  </p>
                )}
              </div>
              <button style={{
                background: COLORS.navy, color: 'white', border: 'none',
                borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ReportsPanel ───────────────────────────────────────────────────────────────
function ReportsPanel({ reports, loading, onRefresh }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: '1.5px solid #E0EFF5', padding: '28px', boxShadow: '0 2px 16px rgba(24,78,119,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: COLORS.navy }}>Patient Reports</h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: COLORS.teal }}>Uploaded medical reports</p>
        </div>
        <button onClick={onRefresh} style={{
          background: COLORS.cream, border: `1.5px solid ${COLORS.mint}`,
          borderRadius: 10, padding: '9px 18px', color: COLORS.navy,
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: COLORS.teal, fontSize: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ color: COLORS.teal, fontSize: 16, margin: 0 }}>No patient reports uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {reports.map(report => (
            <div key={report.id} style={{
              border: `1.5px solid ${COLORS.mint}`, borderRadius: 16,
              padding: '20px 22px', background: COLORS.cream,
              boxShadow: '0 2px 8px rgba(24,78,119,0.05)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.navy }}>Patient ID: {report.patient_id}</p>
                <span style={{
                  fontSize: 12, color: COLORS.teal, fontWeight: 600,
                  background: 'white', padding: '4px 12px', borderRadius: 20, border: `1px solid ${COLORS.teal}`,
                }}>
                  {new Date(report.uploaded_at).toLocaleDateString()}
                </span>
              </div>
              <div style={{ marginBottom: 14 }}>
                {report.report_type && (
                  <p style={{ margin: '4px 0', fontSize: 14, color: COLORS.navy }}>
                    <strong>Type:</strong> {report.report_type}
                  </p>
                )}
                {report.description && (
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#5A7A8A' }}>
                    <strong>Description:</strong> {report.description}
                  </p>
                )}
              </div>
              <a href={report.report_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block', background: COLORS.navy, color: 'white',
                textDecoration: 'none', borderRadius: 10, padding: '8px 18px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>View Report ↗</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}