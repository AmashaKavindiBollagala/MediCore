import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  primary: '#184E77',
  secondary: '#34A0A4',
  success: '#76C893',
  light: '#F1FAEE',
  accent: '#FFE5EC',
  navy: '#184E77',
  teal: '#34A0A4',
  mint: '#76C893',
  cream: '#F1FAEE',
  blush: '#FFE5EC',
};

const NAV_ITEMS = [
  {
    id: 'overview', label: 'Overview', route: '/doctor-dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
  {
    id: 'appointments', label: 'Appointments', route: '/doctor-appointments',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'telemedicine', label: 'My Consultations', route: '/doctor-telemedicine',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
  {
    id: 'availability', label: 'Availability', route: '/doctor-availability',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  },
  {
    id: 'prescriptions', label: 'Prescriptions', route: '/doctor-dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
  {
    id: 'profile', label: 'My Profile', route: '/doctor-dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg>,
  },
];

const STATUS_CONFIG = {
  PENDING_PAYMENT: { bg: '#FFF8E7', color: '#92400E', border: '#F0C040', dot: '#F59E0B', label: 'Pending Payment' },
  CONFIRMED: { bg: '#E8F5E9', color: '#1B5E20', border: '#76C893', dot: '#76C893', label: 'Confirmed' },
  COMPLETED: { bg: '#E3F2FD', color: '#0D3352', border: '#34A0A4', dot: '#34A0A4', label: 'Completed' },
  CANCELLED: { bg: '#FFF0F3', color: '#8B1A30', border: '#F5A0B5', dot: '#E57373', label: 'Cancelled' },
  REJECTED: { bg: '#F5F5F5', color: '#374151', border: '#CBD5E1', dot: '#9CA3AF', label: 'Rejected' },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  .appt-page {
    font-family: 'DM Sans', sans-serif;
    background: #F0F7FA;
    min-height: 100vh;
  }

  .appt-sidebar {
    background: linear-gradient(180deg, #184E77 0%, #0D3352 100%);
    box-shadow: 4px 0 30px rgba(24,78,119,0.18);
    transition: width 0.28s cubic-bezier(.4,0,.2,1);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
    flex-shrink: 0;
  }

  .nav-btn {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 11px 14px; border-radius: 12px;
    border: none; cursor: pointer; background: transparent;
    color: rgba(255,255,255,0.55); margin-bottom: 3px;
    font-size: 14px; font-weight: 500; text-align: left;
    transition: all 0.18s ease; font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
  }
  .nav-btn:hover { background: rgba(255,255,255,0.08); color: white; }
  .nav-btn.active {
    background: linear-gradient(135deg, #34A0A4, #52B5BA);
    color: white; font-weight: 700;
    box-shadow: 0 4px 14px rgba(52,160,164,0.35);
  }
  .nav-btn.active::before {
    content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 60%; background: #76C893; border-radius: 0 2px 2px 0;
  }

  .stat-card {
    background: white;
    border-radius: 20px;
    padding: 22px 24px;
    border: 1.5px solid transparent;
    transition: all 0.22s ease;
    position: relative;
    overflow: hidden;
    cursor: default;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(24,78,119,0.12);
  }
  .stat-card::after {
    content: ''; position: absolute; right: -20px; top: -20px;
    width: 90px; height: 90px; border-radius: 50%;
    background: var(--card-glow); opacity: 0.12;
    transition: transform 0.3s ease;
  }
  .stat-card:hover::after { transform: scale(1.3); }

  .filter-chip {
    padding: 8px 18px; border-radius: 50px; border: 1.5px solid transparent;
    cursor: pointer; font-size: 13px; font-weight: 600;
    transition: all 0.18s ease; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .filter-chip:hover { transform: translateY(-1px); }

  .appt-card {
    background: white;
    border-radius: 20px;
    border: 1.5px solid #E8F4F8;
    padding: 22px 26px;
    transition: all 0.22s ease;
    position: relative;
    overflow: hidden;
  }
  .appt-card:hover {
    box-shadow: 0 10px 35px rgba(24,78,119,0.1);
    border-color: #34A0A420;
    transform: translateY(-2px);
  }
  .appt-card::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 4px; border-radius: 20px 0 0 20px;
    background: var(--accent-bar, #34A0A4);
  }

  .action-btn {
    padding: 9px 20px; border-radius: 10px; border: none;
    cursor: pointer; font-size: 13px; font-weight: 700;
    transition: all 0.18s ease; font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 6px;
  }
  .action-btn:hover { transform: translateY(-1px); }
  .action-btn-complete {
    background: linear-gradient(135deg, #76C893, #52B09A);
    color: white;
    box-shadow: 0 4px 12px rgba(118,200,147,0.35);
  }
  .action-btn-cancel {
    background: #FFF0F3;
    color: #8B1A30;
    border: 1.5px solid #F5A0B5 !important;
  }
  .action-btn-confirm {
    background: linear-gradient(135deg, #184E77, #34A0A4);
    color: white;
    box-shadow: 0 4px 12px rgba(24,78,119,0.3);
  }

  .section-card {
    background: white;
    border-radius: 24px;
    padding: 28px 32px;
    border: 1.5px solid #E8F4F8;
    box-shadow: 0 2px 20px rgba(24,78,119,0.06);
    margin-bottom: 20px;
  }

  .refresh-btn {
    background: linear-gradient(135deg, #184E77, #34A0A4);
    color: white; border: none; border-radius: 12px;
    padding: 10px 20px; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.18s ease; display: flex; align-items: center; gap: 7px;
    box-shadow: 0 4px 14px rgba(24,78,119,0.25);
  }
  .refresh-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(24,78,119,0.3); }

  .back-btn {
    background: white; border: 1.5px solid #34A0A4;
    border-radius: 12px; padding: 10px 20px;
    color: #184E77; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all 0.18s ease; display: flex; align-items: center; gap: 7px;
    box-shadow: 0 2px 10px rgba(52,160,164,0.12);
  }
  .back-btn:hover { background: #F0F9FA; transform: translateY(-1px); }

  .spinner {
    width: 44px; height: 44px; border: 4px solid #E8F4F8;
    border-top-color: #184E77; border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .pulse-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #76C893;
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
  }

  .consultation-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 50px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.2px;
  }

  .status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 50px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.2px;
    border: 1.5px solid transparent;
  }

  .empty-state {
    text-align: center; padding: 60px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
  }
  .empty-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: #F0F7FA; display: flex; align-items: center;
    justify-content: center; font-size: 32px; margin-bottom: 4px;
  }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #34A0A440; border-radius: 10px; }

  @media (max-width: 768px) {
    .appt-sidebar { display: none !important; }
    .appt-main { padding: 20px 16px !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
  }
`;

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [appointmentType, setAppointmentType] = useState('ALL');
  const [doctor, setDoctor] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDoctorProfile();
    fetchAppointments();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const res = await fetch('/api/doctors/me/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDoctor(data);
      }
    } catch (err) {
      console.error('Failed to fetch doctor profile:', err);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments/doctor/my-appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setAppointments(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVideoCall = (appointmentId) => {
    // Navigate to video call page with appointment ID
    navigate(`/telemedicine/${appointmentId}`);
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      if (action === 'cancel') {
        // Cancel with refund
        const confirmCancel = window.confirm(
          'Are you sure you want to cancel this appointment? A full refund will be issued to the patient.'
        );
        
        if (!confirmCancel) return;
        
        const response = await fetch('/api/payments/cancel-with-refund', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            reason: 'Cancelled by doctor'
          }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          alert(result.error || 'Failed to cancel appointment');
          return;
        }
        
        alert('Appointment cancelled successfully. Refund has been processed.');
      } else {
        // Complete appointment
        const endpoint = action === 'complete' ? 'status' : action;
        
        await fetch(`/api/appointments/${appointmentId}/${endpoint}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: action === 'complete' ? 'COMPLETED' : undefined,
          }),
        });
      }
      
      fetchAppointments();
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err);
      alert(`Failed to ${action} appointment. Please try again.`);
    }
  };

  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.PENDING_PAYMENT;

  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus = activeFilter === 'ALL' || appt.status === activeFilter;
    let matchesType = true;
    if (appointmentType !== 'ALL') {
      if (appointmentType === 'video') {
        matchesType = appt.consultation_type === 'video' || appt.consultation_type === 'online';
      } else {
        matchesType = appt.consultation_type === appointmentType;
      }
    }
    return matchesStatus && matchesType;
  });

  const stats = {
    total: appointments.length,
    today: appointments.filter((a) => {
      const dateStr = a.scheduled_at.toString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];
      return dateStr === todayStr;
    }).length,
    confirmed: appointments.filter((a) => a.status === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    video: appointments.filter((a) => a.consultation_type === 'video' || a.consultation_type === 'online').length,
    physical: appointments.filter((a) => a.consultation_type === 'physical').length,
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initials = doctor
    ? `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase()
    : 'DR';

  const STAT_CARDS = [
    { label: "Today's", sublabel: 'Appointments', value: stats.today, icon: '📅', color: '#184E77', glow: '#184E77', bg: 'linear-gradient(135deg, #184E7715, #184E770A)' },
    { label: 'Confirmed', sublabel: 'Upcoming', value: stats.confirmed, icon: '✅', color: '#34A0A4', glow: '#34A0A4', bg: 'linear-gradient(135deg, #34A0A415, #34A0A40A)' },
    { label: 'Completed', sublabel: 'All time', value: stats.completed, icon: '🏁', color: '#76C893', glow: '#76C893', bg: 'linear-gradient(135deg, #76C89315, #76C8930A)' },
    { label: 'Video Calls', sublabel: 'Virtual visits', value: stats.video, icon: '🎥', color: '#8B5CF6', glow: '#8B5CF6', bg: 'linear-gradient(135deg, #8B5CF615, #8B5CF60A)' },
    { label: 'In-Person', sublabel: 'Physical visits', value: stats.physical, icon: '🏥', color: '#F59E0B', glow: '#F59E0B', bg: 'linear-gradient(135deg, #F59E0B15, #F59E0B0A)' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="appt-page" style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Sidebar ── */}
        <aside
          className="appt-sidebar"
          style={{ width: sidebarOpen ? 240 : 74 }}
        >
          {/* Logo */}
          <div style={{
            padding: sidebarOpen ? '26px 22px 20px' : '26px 16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #34A0A4, #76C893)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(52,160,164,0.4)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            {sidebarOpen && (
              <span style={{ fontSize: 20, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>
                Medi<span style={{ color: '#76C893' }}>Core</span>
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(s => !s)}
              style={{
                marginLeft: 'auto', background: 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)', display: 'flex', flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                {sidebarOpen
                  ? <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  : <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                }
              </svg>
            </button>
          </div>

          {/* Doctor chip */}
          {sidebarOpen && doctor && (
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #34A0A4, #76C893)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 14, fontWeight: 800,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 3px 10px rgba(52,160,164,0.4)',
                }}>
                  {initials}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(118,200,147,0.9)', fontWeight: 500 }}>{doctor.specialty}</p>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(118,200,147,0.12)', borderRadius: 20, padding: '5px 11px', width: 'fit-content' }}>
                <div className="pulse-dot" />
                <span style={{ fontSize: 11, color: '#A8DDB5', fontWeight: 600 }}>Active Now</span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: '14px 12px' }}>
            {NAV_ITEMS.map(({ id, label, icon, route }) => {
              const active = id === 'appointments';
              return (
                <button
                  key={id}
                  onClick={() => navigate(route)}
                  className={`nav-btn${active ? ' active' : ''}`}
                  style={{ justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
                >
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                  {active && sidebarOpen && (
                    <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#76C893' }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={handleLogout}
              className="nav-btn"
              style={{ color: '#FFB3C6', justifyContent: sidebarOpen ? 'flex-start' : 'center' }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="appt-main" style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', minWidth: 0 }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, #184E77, #34A0A4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="3" stroke="white" strokeWidth="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#184E77', fontFamily: 'Sora, sans-serif', letterSpacing: '-0.5px' }}>
                    My Appointments
                  </h1>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#64748B', fontWeight: 500, paddingLeft: 46 }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="back-btn" onClick={() => navigate('/doctor-dashboard')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Dashboard
                </button>
                <button className="refresh-btn" onClick={fetchAppointments}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
            {STAT_CARDS.map((s, i) => (
              <div
                key={i}
                className="stat-card"
                style={{ '--card-glow': s.color, background: 'white', borderColor: `${s.color}20` }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: s.bg, borderRadius: 20, zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 14, background: `${s.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, marginBottom: 14,
                    border: `1.5px solid ${s.color}20`,
                  }}>
                    {s.icon}
                  </div>
                  <p style={{ margin: 0, fontSize: 34, fontWeight: 800, color: '#184E77', lineHeight: 1, fontFamily: 'Sora, sans-serif' }}>
                    {s.value}
                  </p>
                  <p style={{ margin: '6px 0 2px', fontSize: 14, fontWeight: 700, color: '#184E77' }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: s.color, fontWeight: 600 }}>{s.sublabel}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="section-card" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(180deg, #184E77, #34A0A4)' }} />
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#184E77', fontFamily: 'Sora, sans-serif' }}>
                Filter Appointments
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
              {/* Type filter */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Consultation Type
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { key: 'ALL', label: 'All Types', icon: '📋' },
                    { key: 'video', label: 'Video', icon: '🎥' },
                    { key: 'physical', label: 'Physical', icon: '🏥' },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      className="filter-chip"
                      onClick={() => setAppointmentType(key)}
                      style={{
                        background: appointmentType === key ? 'linear-gradient(135deg, #184E77, #34A0A4)' : 'white',
                        color: appointmentType === key ? 'white' : '#184E77',
                        borderColor: appointmentType === key ? 'transparent' : '#E0EFF5',
                        boxShadow: appointmentType === key ? '0 4px 14px rgba(24,78,119,0.25)' : '0 2px 6px rgba(24,78,119,0.06)',
                      }}
                    >
                      <span>{icon}</span> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ width: 1, background: '#E8F4F8', alignSelf: 'stretch' }} />

              {/* Status filter */}
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Status
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['ALL', 'CONFIRMED', 'COMPLETED', 'REJECTED'].map((status) => {
                    const cfg = status === 'ALL' ? null : STATUS_CONFIG[status];
                    const isActive = activeFilter === status;
                    return (
                      <button
                        key={status}
                        className="filter-chip"
                        onClick={() => setActiveFilter(status)}
                        style={{
                          background: isActive ? (cfg ? cfg.bg : '#F0F7FA') : 'white',
                          color: isActive ? (cfg ? cfg.color : '#184E77') : '#64748B',
                          borderColor: isActive ? (cfg ? cfg.border : '#34A0A4') : '#E0EFF5',
                          boxShadow: isActive ? '0 3px 10px rgba(24,78,119,0.12)' : '0 2px 6px rgba(24,78,119,0.06)',
                        }}
                      >
                        {status === 'ALL' ? 'All Status' : cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Results count */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #F0F7FA', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34A0A4' }} />
              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                Showing <strong style={{ color: '#184E77' }}>{filteredAppointments.length}</strong> of <strong style={{ color: '#184E77' }}>{appointments.length}</strong> appointments
              </span>
            </div>
          </div>

          {/* Appointments List */}
          {loading ? (
            <div className="section-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="spinner" />
              <p style={{ margin: 0, color: '#64748B', fontSize: 15, fontWeight: 500 }}>Loading appointments...</p>
              <p style={{ margin: '6px 0 0', color: '#34A0A4', fontSize: 13 }}>Please wait a moment</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="section-card">
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#184E77', fontFamily: 'Sora, sans-serif' }}>No appointments found</p>
                <p style={{ margin: 0, fontSize: 14, color: '#64748B' }}>
                  {activeFilter !== 'ALL' || appointmentType !== 'ALL'
                    ? 'Try adjusting your filters to see more results'
                    : 'You have no appointments yet. Share your profile to start receiving bookings.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredAppointments.map((appt) => {
                const statusConfig = getStatusConfig(appt.status);
                const scheduledAtStr = appt.scheduled_at.toString();
                const [datePart, timePart] = scheduledAtStr.split('T');
                const [year, month, day] = datePart.split('-');
                const appointmentDate = new Date(year, month - 1, day);
                const timeStr = timePart ? timePart.substring(0, 5) : '00:00';
                const consultationType = appt.consultation_type || 'video';
                const isVideo = consultationType === 'video' || consultationType === 'online';

                const accentBar = isVideo
                  ? 'linear-gradient(180deg, #184E77, #34A0A4)'
                  : 'linear-gradient(180deg, #34A0A4, #76C893)';

                return (
                  <div
                    key={appt.id}
                    className="appt-card"
                    style={{ '--accent-bar': accentBar }}
                  >
                    <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

                      {/* Date Box */}
                      <div style={{
                        width: 72, height: 80, flexShrink: 0, borderRadius: 16,
                        background: isVideo
                          ? 'linear-gradient(145deg, #184E77, #34A0A4)'
                          : 'linear-gradient(145deg, #34A0A4, #76C893)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: 'white', boxShadow: isVideo
                          ? '0 6px 20px rgba(24,78,119,0.3)'
                          : '0 6px 20px rgba(52,160,164,0.3)',
                      }}>
                        <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, fontFamily: 'Sora, sans-serif' }}>
                          {appointmentDate.getDate()}
                        </span>
                        <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600, opacity: 0.9, marginTop: 2 }}>
                          {appointmentDate.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span style={{ fontSize: 10, opacity: 0.75, fontWeight: 500 }}>
                          {appointmentDate.toLocaleString('default', { weekday: 'short' })}
                        </span>
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: '#184E77', fontFamily: 'Sora, sans-serif' }}>
                              {appt.patient_name || 'Patient'}
                            </h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="9" stroke="#64748B" strokeWidth="1.8"/>
                                <path d="M12 6v6l4 2" stroke="#64748B" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                                {timeStr} · {appointmentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                            <span
                              className="consultation-badge"
                              style={{
                                background: isVideo ? '#8B5CF615' : '#F59E0B15',
                                color: isVideo ? '#7C3AED' : '#D97706',
                                border: `1.5px solid ${isVideo ? '#8B5CF630' : '#F59E0B30'}`,
                              }}
                            >
                              {isVideo ? '🎥' : '🏥'} {isVideo ? 'Video/Online' : 'Physical'}
                            </span>
                            <span
                              className="status-badge"
                              style={{
                                background: statusConfig.bg,
                                color: statusConfig.color,
                                borderColor: statusConfig.border,
                              }}
                            >
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig.dot, flexShrink: 0 }} />
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>

                        {/* Info grid */}
                        <div style={{
                          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12,
                          padding: '14px 0', borderTop: '1px dashed #E8F4F8', marginTop: 4,
                        }}>
                          <div>
                            <p style={{ margin: '0 0 3px', fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                              Consultation
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: '#184E77', fontWeight: 600 }}>
                              {isVideo ? '🎥 Video/Online' : '🏥 Physical Visit'}
                            </p>
                          </div>
                          {appt.patient_age && (
                            <div>
                              <p style={{ margin: '0 0 3px', fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                Patient Age
                              </p>
                              <p style={{ margin: 0, fontSize: 13, color: '#184E77', fontWeight: 600 }}>{appt.patient_age} years</p>
                            </div>
                          )}
                          {appt.symptoms && (
                            <div style={{ gridColumn: 'span 2' }}>
                              <p style={{ margin: '0 0 3px', fontSize: 11, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                                Symptoms
                              </p>
                              <p style={{ margin: 0, fontSize: 13, color: '#184E77', fontWeight: 600 }}>{appt.symptoms}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {appt.status === 'CONFIRMED' && (
                          <div style={{ display: 'flex', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px dashed #E8F4F8', flexWrap: 'wrap' }}>
                            {/* Join Video Call button for video appointments */}
                            {isVideo && (
                              <button
                                className="action-btn"
                                onClick={() => handleJoinVideoCall(appt.id)}
                                style={{
                                  background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                                  color: 'white',
                                  border: 'none',
                                  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Join Video Call
                              </button>
                            )}
                            
                            <button
                              className="action-btn action-btn-complete"
                              onClick={() => handleAppointmentAction(appt.id, 'complete')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Mark Complete
                            </button>
                            <button
                              className="action-btn action-btn-cancel"
                              onClick={() => handleAppointmentAction(appt.id, 'cancel')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Cancel
                            </button>
                          </div>
                        )}

                        {appt.status === 'PENDING_PAYMENT' && (
                          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed #E8F4F8' }}>
                            <button
                              className="action-btn action-btn-confirm"
                              onClick={() => handleAppointmentAction(appt.id, 'confirm')}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Confirm Appointment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default DoctorAppointments;