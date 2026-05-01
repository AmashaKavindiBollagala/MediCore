// kaveesha-DoctorTelemedicine.jsx
// Doctor's telemedicine sessions overview — beautiful, comprehensive

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:3007';
const MAIN_API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = {
  navy: '#184E77', navyDark: '#0D3352', teal: '#34A0A4',
  mint: '#76C893', cream: '#F1FAEE', blush: '#FFE5EC',
  mintLight: '#A8DDB5', tealLight: '#52B5BA',
};

const STATUS_MAP = {
  WAITING:   { label: 'Waiting',   bg: '#FFF8E7', color: '#92400E', dot: '#F59E0B' },
  ACTIVE:    { label: 'Live',      bg: '#ECFDF5', color: '#065F46', dot: '#10B981' },
  ENDED:     { label: 'Ended',     bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6' },
  MISSED:    { label: 'Missed',    bg: '#FFF1F2', color: '#9F1239', dot: '#F43F5E' },
  CANCELLED: { label: 'Cancelled', bg: '#F9FAFB', color: '#374151', dot: '#9CA3AF' },
};

function SessionCard({ session, onJoin }) {
  const s = STATUS_MAP[session.status] || STATUS_MAP.WAITING;
  const isLive = session.status === 'ACTIVE' || session.status === 'WAITING';
  const date = new Date(session.scheduled_at);

  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '22px 24px',
      border: `1.5px solid ${isLive ? COLORS.teal + '40' : '#E8F4F8'}`,
      boxShadow: isLive
        ? `0 4px 24px rgba(52,160,164,0.15)`
        : '0 2px 12px rgba(24,78,119,0.06)',
      transition: 'all 0.2s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isLive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.mint})`,
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: isLive
                ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`
                : '#F0F7FA',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              {session.status === 'ACTIVE' ? '🔴' : '🎥'}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: COLORS.navy }}>
                Patient Session
              </p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: COLORS.teal, fontFamily: 'monospace' }}>
                #{session.id?.substring(0, 12)}...
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginTop: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Date</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: COLORS.navy, fontWeight: 600 }}>
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Time</p>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: COLORS.navy, fontWeight: 600 }}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {session.duration_seconds > 0 && (
              <div>
                <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Duration</p>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: COLORS.navy, fontWeight: 600 }}>
                  {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
                </p>
              </div>
            )}
            <div>
              <p style={{ margin: 0, fontSize: 10, color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Channel</p>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: COLORS.teal, fontWeight: 600, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {session.channel_name?.substring(0, 22)}...
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: s.bg, color: s.color,
            border: `1px solid ${s.dot}40`,
            borderRadius: 20, padding: '5px 12px', fontSize: 11, fontWeight: 700,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, animation: session.status === 'ACTIVE' ? 'pulse 1.5s infinite' : 'none' }} />
            {s.label}
          </span>

          {isLive && (
            <button
              onClick={() => onJoin(session.id)}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: session.status === 'ACTIVE'
                  ? `linear-gradient(135deg, #FF6B6B, #FF8E53)`
                  : `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
                color: session.status === 'ACTIVE' ? 'white' : COLORS.navy,
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                boxShadow: session.status === 'ACTIVE'
                  ? '0 4px 16px rgba(255,107,107,0.4)'
                  : `0 4px 16px rgba(52,160,164,0.4)`,
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >
              {session.status === 'ACTIVE' ? '🔴 Rejoin Live' : '🎥 Join Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KaveeshaDoctorTelemedicine() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [creating, setCreating] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState('');

  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchSessions();
    fetchVideoAppointments();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/telemedicine/doctor/sessions`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data.success) setSessions(data.data || []);
    } catch (err) {
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoAppointments = async () => {
    try {
      const res = await fetch(`${MAIN_API}/appointments/doctor/my-appointments`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await res.json();
      if (data.success) {
        const videoAppts = (data.data || []).filter(
          (a) => (a.consultation_type === 'video' || a.consultation_type === 'online') && a.status === 'CONFIRMED'
        );
        setAppointments(videoAppts);
      }
    } catch {}
  };

  const handleCreateSession = async () => {
    if (!selectedAppt) return;
    setCreating(true);
    try {
      const appt = appointments.find((a) => a.id === selectedAppt);
      const res = await fetch(`${API_BASE}/telemedicine/sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appt.id,
          doctor_id: appt.doctor_id,
          patient_id: appt.patient_id,
          scheduled_at: appt.scheduled_at,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setSelectedAppt('');
        await fetchSessions();
        navigate(`/telemedicine/room/${data.data.id}?role=doctor`);
      }
    } catch (err) {
      console.error('Create session error:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = (sessionId) => {
    navigate(`/telemedicine/room/${sessionId}?role=doctor`);
  };

  const filtered = filterStatus === 'ALL'
    ? sessions
    : sessions.filter((s) => s.status === filterStatus);

  const stats = {
    total: sessions.length,
    active: sessions.filter((s) => s.status === 'ACTIVE').length,
    waiting: sessions.filter((s) => s.status === 'WAITING').length,
    ended: sessions.filter((s) => s.status === 'ENDED').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: '32px 36px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="1.8"/>
              </svg>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: COLORS.navy, letterSpacing: '-0.5px' }}>
              Telemedicine Sessions
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: COLORS.teal, paddingLeft: 54 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '12px 24px', borderRadius: 14, border: 'none',
            background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
            color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(24,78,119,0.3)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="2"/>
          </svg>
          + Start New Session
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Sessions', value: stats.total, color: COLORS.navy, bg: '#EBF4FF', icon: '📊' },
          { label: 'Live Now', value: stats.active, color: '#10B981', bg: '#ECFDF5', icon: '🔴' },
          { label: 'Waiting', value: stats.waiting, color: '#F59E0B', bg: '#FFF8E7', icon: '⏳' },
          { label: 'Completed', value: stats.ended, color: COLORS.teal, bg: '#E0F5F5', icon: '✅' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 20, padding: '22px 24px',
            border: `1.5px solid ${stat.bg}`,
            boxShadow: '0 2px 12px rgba(24,78,119,0.06)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: stat.bg, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, marginBottom: 14,
            }}>
              {stat.icon}
            </div>
            <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: COLORS.navy, lineHeight: 1 }}>{stat.value}</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: stat.color, fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {['ALL', 'WAITING', 'ACTIVE', 'ENDED', 'CANCELLED'].map((status) => {
          const s = STATUS_MAP[status];
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 18px', borderRadius: 20, border: `1.5px solid ${isActive ? COLORS.navy : '#E0EFF5'}`,
                background: isActive ? COLORS.navy : 'white',
                color: isActive ? 'white' : COLORS.teal,
                fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {status === 'ALL' ? 'All Sessions' : (s?.label || status)}
              <span style={{
                marginLeft: 6, background: isActive ? 'rgba(255,255,255,0.2)' : '#F0F7FA',
                color: isActive ? 'white' : COLORS.navy,
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 800,
              }}>
                {status === 'ALL' ? sessions.length : sessions.filter(s2 => s2.status === status).length}
              </span>
            </button>
          );
        })}
        <button
          onClick={fetchSessions}
          style={{
            marginLeft: 'auto', padding: '8px 18px', borderRadius: 20,
            border: `1.5px solid ${COLORS.mint}`,
            background: 'white', color: COLORS.navy,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Sessions list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p style={{ color: COLORS.teal, fontSize: 15 }}>Loading sessions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 24, padding: '60px 24px',
          border: '1.5px solid #E0EFF5', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎥</div>
          <p style={{ color: COLORS.navy, fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>No sessions found</p>
          <p style={{ color: COLORS.teal, fontSize: 14, margin: 0 }}>
            Start a new telemedicine session from a confirmed video appointment.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} onJoin={handleJoin} />
          ))}
        </div>
      )}

      {/* Create session modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: 'white', borderRadius: 24, padding: '36px',
            width: '100%', maxWidth: 480,
            boxShadow: '0 24px 80px rgba(24,78,119,0.3)',
          }}>
            <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: COLORS.navy }}>
              Start Video Session
            </h2>
            <p style={{ margin: '0 0 28px', fontSize: 14, color: COLORS.teal }}>
              Select a confirmed video appointment to begin
            </p>

            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: COLORS.teal, fontSize: 14 }}>
                No confirmed video appointments found.
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: COLORS.navy, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Select Appointment
                </label>
                <select
                  value={selectedAppt}
                  onChange={(e) => setSelectedAppt(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: `1.5px solid ${selectedAppt ? COLORS.teal : '#E0EFF5'}`,
                    fontSize: 14, color: COLORS.navy, background: COLORS.cream,
                    outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  <option value="">Choose an appointment...</option>
                  {appointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.patient_name} · {new Date(a.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: `1.5px solid ${COLORS.mint}`,
                  background: 'white', color: COLORS.navy,
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!selectedAppt || creating}
                style={{
                  flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                  background: selectedAppt && !creating
                    ? `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`
                    : '#E0EFF5',
                  color: selectedAppt && !creating ? 'white' : '#94A3B8',
                  fontSize: 14, fontWeight: 700,
                  cursor: selectedAppt && !creating ? 'pointer' : 'not-allowed',
                }}
              >
                {creating ? '⏳ Creating...' : '🎥 Create & Join Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}