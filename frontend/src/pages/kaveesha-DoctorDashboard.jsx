import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KaveeshaDoctorAvailability from './kaveesha-DoctorAvailability';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'appointments', label: 'Appointments', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'availability', label: 'Availability', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'prescriptions', label: 'Prescriptions', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'reports', label: 'Patient Reports', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'profile', label: 'My Profile', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

const STATUS_STYLES = {
  PENDING_PAYMENT: { bg: '#FEF3C7', color: '#92400E', label: 'Pending' },
  CONFIRMED:       { bg: '#D1FAE5', color: '#065F46', label: 'Confirmed' },
  COMPLETED:       { bg: '#E0F2FE', color: '#0C4A6E', label: 'Completed' },
  CANCELLED:       { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
  REJECTED:        { bg: '#F3F4F6', color: '#374151', label: 'Rejected' },
};

const StatCard = ({ label, value, sub, color }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: '20px 22px', border: '1px solid #34A0A4', flex: 1, minWidth: 140 }}>
    <div style={{ width: 40, height: 40, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, color }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
    <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color: '#184E77' }}>{value}</p>
    <p style={{ margin: '4px 0 0', fontSize: 13, color: '#34A0A4' }}>{label}</p>
    {sub && <p style={{ margin: '4px 0 0', fontSize: 11, color }}>{sub}</p>}
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

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'prescriptions') fetchPrescriptions();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctors/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDoctor(await res.json());
    } catch { }
  };

  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const res = await fetch('/api/doctors/me/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAppointments(await res.json());
    } catch { }
    finally { setLoadingAppts(false); }
  };

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const res = await fetch('/api/doctors/me/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPrescriptions(await res.json());
    } catch { }
    finally { setLoadingPrescriptions(false); }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await fetch('/api/doctors/me/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setReports(await res.json());
    } catch { }
    finally { setLoadingReports(false); }
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

  // ── Mock stats for demo ────────────────────────────────────────────────────
  const stats = {
    today: appointments.filter(a => new Date(a.scheduled_at).toDateString() === new Date().toDateString()).length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    pending: appointments.filter(a => a.status === 'PENDING_PAYMENT').length,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 72, minHeight: '100vh', background: 'white',
        borderRight: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s', overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? '24px 20px 20px' : '24px 16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#124170', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          {sidebarOpen && <span style={{ fontSize: 18, fontWeight: 700, color: '#124170', fontFamily: "'Playfair Display', serif", whiteSpace: 'nowrap' }}>MediCore</span>}
        </div>

        {/* Doctor info */}
        {sidebarOpen && doctor && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #124170, #67C090)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {doctor.first_name} {doctor.last_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{doctor.specialty}</p>
              </div>
            </div>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: doctor.verification_status === 'approved' ? '#10B981' : '#F59E0B' }} />
              <span style={{ fontSize: 11, color: doctor.verification_status === 'approved' ? '#059669' : '#D97706' }}>
                {doctor.verification_status === 'approved' ? 'Verified Doctor' : 'Pending Verification'}
              </span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            // Navigate to appointments page when clicking Appointments in sidebar
            const handleClick = id === 'appointments' 
              ? () => navigate('/doctor-appointments') 
              : () => setActiveTab(id);
            return (
              <button key={id} onClick={handleClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: active ? '#EFF6FF' : 'transparent',
                  color: active ? '#124170' : '#6B7280', marginBottom: 4,
                  fontWeight: active ? 600 : 400, fontSize: 14, textAlign: 'left',
                  transition: 'all 0.15s',
                }}>
                <span style={{ flexShrink: 0 }}>{icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {active && sidebarOpen && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#124170' }} />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #F1F5F9' }}>
          <button onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#EF4444', fontSize: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setSidebarOpen((s) => !s)} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#6B7280' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>
                {NAV_ITEMS.find(n => n.id === activeTab)?.label}
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #124170, #67C090)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
              {initials}
            </div>
          </div>
        </div>

        {/* ── Overview tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stat cards */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <StatCard label="Today's Appointments" value={stats.today} sub="Scheduled today" color="#3B82F6" />
              <StatCard label="Confirmed" value={stats.confirmed} sub="Upcoming" color="#10B981" />
              <StatCard label="Completed" value={stats.completed} sub="All time" color="#8B5CF6" />
              <StatCard label="Awaiting Approval" value={stats.pending} sub="Need action" color="#F59E0B" />
            </div>

            {/* Welcome card */}
            <div style={{ background: 'linear-gradient(135deg, #124170, #26667F)', borderRadius: 20, padding: '28px 32px', color: 'white', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -20, top: -20, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', right: 60, bottom: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(103,192,144,0.15)' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                  Welcome back, Dr. {doctor?.first_name || '—'}
                </h2>
                <p style={{ margin: '0 0 20px', opacity: 0.8, fontSize: 14 }}>
                  {doctor?.specialty} · {doctor?.hospital}
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => navigate('/doctor-appointments')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 18px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    View Appointments →
                  </button>
                  <button onClick={() => setActiveTab('availability')} style={{ background: 'rgba(103,192,144,0.3)', border: '1px solid rgba(103,192,144,0.4)', borderRadius: 10, padding: '8px 18px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Manage Schedule
                  </button>
                </div>
              </div>
            </div>

            {/* Quick appointment list */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>Recent Appointments</h3>
                <button onClick={() => setActiveTab('appointments')} style={{ background: 'none', border: 'none', color: '#124170', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View all →</button>
              </div>
              {appointments.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No appointments yet. Share your profile to start receiving bookings.</p>
              ) : (
                appointments.slice(0, 4).map((appt) => (
                  <AppointmentRow key={appt.id} appt={appt} onAction={handleAppointmentAction} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Appointments tab ──────────────────────────────────────────────────── */}
        {activeTab === 'appointments' && (
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '24px' }}>
            <AppointmentsPanel appointments={appointments} loading={loadingAppts} onAction={handleAppointmentAction} onRefresh={fetchAppointments} />
          </div>
        )}

        {/* ── Availability tab ──────────────────────────────────────────────────── */}
        {activeTab === 'availability' && (
          <KaveeshaDoctorAvailability token={token} />
        )}

        {/* ── Prescriptions tab ─────────────────────────────────────────────────── */}
        {activeTab === 'prescriptions' && (
          <PrescriptionsPanel prescriptions={prescriptions} loading={loadingPrescriptions} onRefresh={fetchPrescriptions} token={token} />
        )}

        {/* ── Reports tab ───────────────────────────────────────────────────────── */}
        {activeTab === 'reports' && (
          <ReportsPanel reports={reports} loading={loadingReports} onRefresh={fetchReports} />
        )}

        {/* ── Profile tab ───────────────────────────────────────────────────────── */}
        {activeTab === 'profile' && (
          <ProfilePanel doctor={doctor} onRefresh={fetchProfile} token={token} />
        )}
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AppointmentRow({ appt, onAction }) {
  const s = STATUS_STYLES[appt.status] || STATUS_STYLES.PENDING_PAYMENT;
  const date = new Date(appt.scheduled_at);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid #F9FAFB' }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: '#EFF6FF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#124170' }}>{date.getDate()}</span>
        <span style={{ fontSize: 9, color: '#6B7280', textTransform: 'uppercase' }}>{date.toLocaleString('default', { month: 'short' })}</span>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>{appt.patient_name || 'Patient'}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {appt.consultation_type === 'video' ? '🎥 Video' : '🏥 In-person'}
        </p>
      </div>
      <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{s.label}</span>
      {appt.status === 'CONFIRMED' && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onAction(appt.id, 'complete')} style={{ background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Done</button>
          <button onClick={() => onAction(appt.id, 'reject')} style={{ background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
        </div>
      )}
      {appt.status === 'PENDING_PAYMENT' && (
        <button onClick={() => onAction(appt.id, 'confirm')} style={{ background: '#EFF6FF', color: '#1D4ED8', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
      )}
    </div>
  );
}

function AppointmentsPanel({ appointments, loading, onAction, onRefresh }) {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827' }}>Appointments</h2>
        <button onClick={onRefresh} style={{ background: '#EFF6FF', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#124170', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? '#124170' : '#F3F4F6', color: filter === f ? 'white' : '#6B7280' }}>
            {f === 'ALL' ? 'All' : STATUS_STYLES[f]?.label || f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#9CA3AF', fontSize: 15 }}>No appointments found.</p>
        </div>
      ) : (
        filtered.map((appt) => <AppointmentRow key={appt.id} appt={appt} onAction={onAction} />)
      )}
    </div>
  );
}

function ProfilePanel({ doctor, onRefresh, token }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', phone: '', consultation_fee_online: '', consultation_fee_physical: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (doctor) setForm({ bio: doctor.bio || '', phone: doctor.phone || '', consultation_fee_online: doctor.consultation_fee_online || '', consultation_fee_physical: doctor.consultation_fee_physical || '' });
  }, [doctor]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/doctors/me/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      onRefresh();
      setEditing(false);
    } catch { }
    finally { setSaving(false); }
  };

  if (!doctor) return <p style={{ color: '#9CA3AF' }}>Loading profile...</p>;

  return (
    <div>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        {/* Profile header */}
        <div style={{ background: 'linear-gradient(135deg, #124170, #26667F)', padding: '32px 32px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 26, fontWeight: 700, border: '3px solid rgba(255,255,255,0.3)' }}>
            {doctor.first_name?.[0]}{doctor.last_name?.[0]}
          </div>
          <div style={{ color: 'white' }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Dr. {doctor.first_name} {doctor.last_name}</h2>
            <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 14 }}>{doctor.specialty} · {doctor.hospital}</p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '3px 10px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: doctor.verification_status === 'approved' ? '#34D399' : '#FCD34D' }} />
              <span style={{ fontSize: 11 }}>{doctor.verification_status === 'approved' ? 'Verified' : 'Pending Verification'}</span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 16px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Info grid */}
        <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            ['Email', doctor.email], ['Phone', editing ? null : doctor.phone],
            ['Hospital', doctor.hospital], ['License No.', doctor.medical_license_number],
            ['Experience', `${doctor.years_of_experience} years`], ['Specialty', doctor.specialty],
          ].map(([label, val]) => val !== null && (
            <div key={label}>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#111827' }}>{val}</p>
            </div>
          ))}
        </div>

        {/* Editable fields */}
        {editing ? (
          <div style={{ padding: '0 32px 28px' }}>
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
              {[
                { key: 'phone', label: 'Phone', type: 'text' },
                { key: 'consultation_fee_online', label: 'Online Consultation Fee (LKR)', type: 'number' },
                { key: 'consultation_fee_physical', label: 'Physical Visit Fee (LKR)', type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input type={type} value={form[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              <button onClick={save} disabled={saving}
                style={{ background: 'linear-gradient(135deg, #124170, #67C090)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0 32px 28px', borderTop: '1px solid #F1F5F9', margin: '0 32px' }}>
            <p style={{ margin: '16px 0 4px', fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</p>
            <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{doctor.bio || 'No bio added yet.'}</p>
          </div>
        )}
      </div>

      {/* Fees card */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 24px', marginTop: 20, display: 'flex', gap: 24 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px 16px', background: '#EFF6FF', borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Online Fee</p>
          <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 700, color: '#124170' }}>LKR {doctor.consultation_fee_online || '—'}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '12px 16px', background: '#F0FDF4', borderRadius: 12 }}>
          <p style={{ margin: 0, fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Physical Fee</p>
          <p style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 700, color: '#059669' }}>LKR {doctor.consultation_fee_physical || '—'}</p>
        </div>
      </div>
    </div>
  );
}

// ── Prescriptions Panel ────────────────────────────────────────────────────────
function PrescriptionsPanel({ prescriptions, loading, onRefresh, token }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #34A0A4', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#184E77' }}>Prescriptions</h2>
        <button onClick={onRefresh} style={{ background: '#F1FAEE', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#184E77', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#34A0A4' }}>Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#34A0A4', fontSize: 15 }}>No prescriptions issued yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {prescriptions.map((rx) => (
            <div key={rx.id} style={{ border: '1px solid #76C893', borderRadius: 12, padding: '16px', background: '#F1FAEE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#184E77' }}>Patient ID: {rx.patient_id}</p>
                <span style={{ fontSize: 12, color: '#34A0A4' }}>{new Date(rx.issued_at).toLocaleDateString()}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <p style={{ margin: '4px 0', fontSize: 13, color: '#184E77' }}>
                  <strong>Medications:</strong> {rx.prescription_data?.medications?.length || 0} item(s)
                </p>
                {rx.notes && <p style={{ margin: '4px 0', fontSize: 13, color: '#34A0A4' }}><strong>Notes:</strong> {rx.notes}</p>}
              </div>
              <button style={{ background: '#184E77', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Reports Panel ──────────────────────────────────────────────────────────────
function ReportsPanel({ reports, loading, onRefresh }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #34A0A4', padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#184E77' }}>Patient Reports</h2>
        <button onClick={onRefresh} style={{ background: '#F1FAEE', border: 'none', borderRadius: 8, padding: '6px 14px', color: '#184E77', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#34A0A4' }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ color: '#34A0A4', fontSize: 15 }}>No patient reports uploaded yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {reports.map((report) => (
            <div key={report.id} style={{ border: '1px solid #76C893', borderRadius: 12, padding: '16px', background: '#F1FAEE' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#184E77' }}>Patient ID: {report.patient_id}</p>
                <span style={{ fontSize: 12, color: '#34A0A4' }}>{new Date(report.uploaded_at).toLocaleDateString()}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                {report.report_type && <p style={{ margin: '4px 0', fontSize: 13, color: '#184E77' }}><strong>Type:</strong> {report.report_type}</p>}
                {report.description && <p style={{ margin: '4px 0', fontSize: 13, color: '#34A0A4' }}><strong>Description:</strong> {report.description}</p>}
              </div>
              <a href={report.report_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', background: '#184E77', color: 'white', textDecoration: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>View Report</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}