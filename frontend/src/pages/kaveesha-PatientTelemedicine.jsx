// kaveesha-PatientTelemedicine.jsx
// Patient's telemedicine sessions view — join video consultations

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:4000';
const MAIN_API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = {
  navy: '#184E77', teal: '#34A0A4', mint: '#76C893',
  cream: '#F1FAEE', blush: '#FFE5EC', mintLight: '#A8DDB5',
};

const STATUS_MAP = {
  WAITING:   { label: 'Ready to Join', bg: '#ECFDF5', color: '#065F46', dot: '#10B981', canJoin: true },
  ACTIVE:    { label: 'Session Live',  bg: '#FFF8E7', color: '#92400E', dot: '#F59E0B', canJoin: true },
  ENDED:     { label: 'Ended',         bg: '#EFF6FF', color: '#1E40AF', dot: '#3B82F6', canJoin: false },
  MISSED:    { label: 'Missed',        bg: '#FFF1F2', color: '#9F1239', dot: '#F43F5E', canJoin: false },
  CANCELLED: { label: 'Cancelled',     bg: '#F9FAFB', color: '#374151', dot: '#9CA3AF', canJoin: false },
};

function PatientSessionCard({ session, appointment, onJoin }) {
  const s = STATUS_MAP[session.status] || STATUS_MAP.WAITING;
  const date = new Date(session.scheduled_at);
  const isUpcoming = new Date(session.scheduled_at) > new Date();
  const minutesUntil = Math.floor((new Date(session.scheduled_at) - new Date()) / 60000);

  return (
    <div style={{
      background: 'white', borderRadius: 24, padding: '28px',
      border: s.canJoin ? `2px solid ${COLORS.teal}40` : '1.5px solid #E8F4F8',
      boxShadow: s.canJoin
        ? `0 8px 32px rgba(52,160,164,0.15), 0 2px 8px rgba(24,78,119,0.06)`
        : '0 2px 12px rgba(24,78,119,0.06)',
      position: 'relative', overflow: 'hidden',
      transition: 'all 0.2s',
    }}>
      {/* Top gradient bar for active sessions */}
      {s.canJoin && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.mint})`,
        }} />
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Date box */}
        <div style={{
          width: 70, height: 78, borderRadius: 16, flexShrink: 0,
          background: s.canJoin
            ? `linear-gradient(145deg, ${COLORS.navy}, ${COLORS.teal})`
            : '#F0F7FA',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', color: s.canJoin ? 'white' : COLORS.navy,
        }}>
          <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{date.getDate()}</span>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, opacity: 0.85 }}>
            {date.toLocaleString('default', { month: 'short' })}
          </span>
          <span style={{ fontSize: 10, opacity: 0.65 }}>
            {date.toLocaleString('default', { weekday: 'short' })}
          </span>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 800, color: COLORS.navy }}>
                🎥 Video Consultation
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.teal, fontWeight: 500 }}>
                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: s.bg, color: s.color,
              border: `1px solid ${s.dot}30`,
              borderRadius: 20, padding: '5px 13px', fontSize: 11, fontWeight: 700,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%', background: s.dot,
                animation: s.canJoin ? 'pulse 1.5s infinite' : 'none',
              }} />
              {s.label}
            </span>
          </div>

          {/* Countdown */}
          {isUpcoming && minutesUntil > 0 && minutesUntil < 60 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#FFF8E7', border: '1px solid #F59E0B40',
              borderRadius: 12, padding: '8px 14px', marginBottom: 14,
            }}>
              <span style={{ fontSize: 14 }}>⏰</span>
              <span style={{ fontSize: 13, color: '#92400E', fontWeight: 700 }}>
                Starting in {minutesUntil} minute{minutesUntil !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Tips */}
          {s.canJoin && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16,
            }}>
              {['Quiet space ready', 'Camera & mic on', 'Stable internet'].map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#F0F7FA', borderRadius: 10, padding: '6px 10px',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.mint, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: COLORS.navy, fontWeight: 500 }}>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Join button */}
          {s.canJoin && (
            <button
              onClick={() => onJoin(session.id)}
              style={{
                padding: '12px 28px', borderRadius: 12, border: 'none',
                background: `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.mint} 100%)`,
                color: COLORS.navy, fontSize: 14, fontWeight: 800, cursor: 'pointer',
                boxShadow: `0 6px 20px rgba(52,160,164,0.4)`,
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'all 0.18s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Join Consultation
            </button>
          )}

          {/* Duration for ended */}
          {session.status === 'ENDED' && session.duration_seconds > 0 && (
            <p style={{ margin: 0, fontSize: 13, color: COLORS.teal }}>
              ⏱ Duration: {Math.floor(session.duration_seconds / 60)}m {session.duration_seconds % 60}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KaveeshaPatientTelemedicine() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const userToken = localStorage.getItem('token');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/telemedicine/patient/sessions`, {
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

  const handleJoin = (sessionId) => {
    navigate(`/telemedicine/room/${sessionId}?role=patient`);
  };

  const filtered = filterStatus === 'ALL'
    ? sessions
    : sessions.filter((s) => s.status === filterStatus);

  const upcoming = sessions.filter((s) => s.status === 'WAITING' || s.status === 'ACTIVE');

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.cream,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: '32px 36px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: COLORS.navy, letterSpacing: '-0.5px' }}>
          🎥 My Video Consultations
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: COLORS.teal }}>
          Connect with your doctor from anywhere
        </p>
      </div>

      {/* Upcoming alert */}
      {upcoming.length > 0 && (
        <div style={{
          background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
          borderRadius: 20, padding: '22px 26px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0,
          }}>🔴</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 800, color: 'white' }}>
              You have {upcoming.length} upcoming video session{upcoming.length > 1 ? 's' : ''}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
              Your doctor is ready. Join when you're prepared.
            </p>
          </div>
          <button
            onClick={() => handleJoin(upcoming[0].id)}
            style={{
              padding: '12px 24px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.mintLight})`,
              color: COLORS.navy, fontSize: 14, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(79,255,176,0.3)', flexShrink: 0,
            }}
          >
            Join Now →
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {['ALL', 'WAITING', 'ACTIVE', 'ENDED'].map((status) => {
          const s = STATUS_MAP[status];
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 18px', borderRadius: 20,
                border: `1.5px solid ${isActive ? COLORS.navy : '#E0EFF5'}`,
                background: isActive ? COLORS.navy : 'white',
                color: isActive ? 'white' : COLORS.teal,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {status === 'ALL' ? 'All' : (s?.label || status)}
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

      {/* List */}
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <p style={{ color: COLORS.navy, fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>
            No video sessions found
          </p>
          <p style={{ color: COLORS.teal, fontSize: 14, margin: '0 0 24px' }}>
            Book a video consultation with your doctor to get started.
          </p>
          <button
            onClick={() => navigate('/appointments/book')}
            style={{
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})`,
              color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            + Book Video Appointment
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filtered.map((session) => (
            <PatientSessionCard
              key={session.id}
              session={session}
              onJoin={handleJoin}
            />
          ))}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}