import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const C = {
  navy: '#0F3460',
  teal: '#0F9B8E',
  tealLight: '#E8FAF8',
  tealMid: '#B2EDE7',
  gold: '#E8A838',
  goldLight: '#FFF8EC',
  slate: '#64748B',
  surface: '#F1FAEE',
  white: '#FFFFFF',
  border: '#E2E8F0',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
  success: '#10B981',
  successLight: '#ECFDF5',
};

const navItems = [
  { to: '/patient-dashboard',   label: 'Dashboard',       path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/patient-profile',     label: 'My Profile',      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/appointments',        label: 'Appointments',    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/telemedicine',        label: 'My Consultations', path: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
  { to: '/patient-reports',     label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/patient-prescription',       label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

function Sidebar({ user }) {
  const loc = window.location.pathname;
  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #124170 0%, #1a5a8a 100%)' }}>
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
    </aside>
  );
}

function PrescriptionCard({ rx, onView }) {
  const meds = rx.prescription_data?.medications || [];
  const isNew = (new Date() - new Date(rx.issued_at)) < 3 * 86400000;
  const isFinished = rx.is_finished === true;
  
  return (
    <div style={{ 
      background: C.white, 
      borderRadius: 20, 
      border: `1.5px solid ${isFinished ? '#93C5FD' : C.border}`, 
      padding: '24px', 
      boxShadow: isFinished ? '0 2px 12px rgba(16,185,129,0.08)' : '0 2px 12px rgba(15,52,96,0.06)', 
      transition: 'all 0.2s', 
      position: 'relative', 
      overflow: 'hidden',
      opacity: isFinished ? 0.95 : 1
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = isFinished 
        ? '0 8px 24px rgba(16,185,129,0.15)' 
        : '0 8px 24px rgba(15,52,96,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = isFinished 
        ? '0 2px 12px rgba(16,185,129,0.08)' 
        : '0 2px 12px rgba(15,52,96,0.06)';
    }}
    >
      {/* Accent bar at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: isFinished 
          ? 'linear-gradient(90deg, #10B981, #059669)'
          : 'linear-gradient(90deg, #3B82F6, #2563EB)'
      }} />
      
      {/* Status badges */}
      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
        {isFinished && (
          <div style={{ 
            background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', 
            color: '#059669', 
            fontSize: 10, 
            fontWeight: 800, 
            padding: '4px 12px', 
            borderRadius: 20, 
            letterSpacing: 0.5 
          }}>✅ FINISHED</div>
        )}
        {isNew && !isFinished && (
          <div style={{ 
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)', 
            color: 'white', 
            fontSize: 10, 
            fontWeight: 800, 
            padding: '4px 12px', 
            borderRadius: 20, 
            letterSpacing: 0.5 
          }}>NEW</div>
        )}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16, marginTop: 8 }}>
        <div style={{ 
          width: 54, 
          height: 54, 
          borderRadius: 16, 
          background: isFinished ? 'linear-gradient(135deg, #D1FAE5, #A7F3D0)' : C.tealLight, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          fontSize: 26, 
          flexShrink: 0 
        }}>💊</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>Dr. {rx.doctor_name || 'Your Doctor'}</h3>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.slate }}>
            {rx.doctor_specialty && <span style={{ color: C.teal }}>{rx.doctor_specialty}</span>}
            {rx.doctor_specialty && rx.diagnosis && <span> · </span>}
            {rx.diagnosis && <><strong style={{ color: C.navy }}>Diagnosis:</strong> {rx.diagnosis}</>}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: C.slate }}>
            Issued {new Date(rx.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Patient and Symptoms Info */}
      {rx.patient_name && (
        <div style={{
          background: isFinished ? '#F0FDF4' : '#EFF6FF',
          padding: '12px 14px',
          borderRadius: 10,
          marginBottom: 16,
          border: `1px solid ${isFinished ? '#A7F3D0' : '#BFDBFE'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: isFinished ? '#10B981' : '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 14,
              fontWeight: 700
            }}>
              {(rx.patient_name || 'P').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: C.slate, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Patient</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.navy }}>{rx.patient_name}</p>
            </div>
          </div>
          {rx.symptoms && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${isFinished ? '#D1FAE5' : '#DBEAFE'}` }}>
              <p style={{ margin: '0 0 4px 0', fontSize: 11, color: C.slate, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>🩺 Symptoms</p>
              <p style={{ margin: 0, fontSize: 13, color: isFinished ? '#059669' : '#2563EB', lineHeight: 1.5 }}>
                {rx.symptoms}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Medications preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {meds.slice(0, 3).map((m, i) => (
          <div key={i} style={{ 
            background: isFinished ? '#F0FDF4' : C.surface, 
            borderRadius: 10, 
            padding: '10px 14px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                background: isFinished ? '#10B981' : C.teal, 
                flexShrink: 0 
              }} />
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{m.name}</span>
                {m.dosage && <span style={{ fontSize: 12, color: C.slate }}> · {m.dosage}</span>}
              </div>
            </div>
            {m.frequency && (
              <span style={{ 
                fontSize: 11, 
                color: isFinished ? '#059669' : C.teal, 
                background: isFinished ? '#D1FAE5' : C.tealLight, 
                padding: '2px 10px', 
                borderRadius: 20, 
                fontWeight: 600 
              }}>{m.frequency}</span>
            )}
          </div>
        ))}
        {meds.length > 3 && (
          <div style={{ 
            background: '#F8FAFC', 
            borderRadius: 10, 
            padding: '8px 14px', 
            fontSize: 13, 
            color: C.slate, 
            textAlign: 'center' 
          }}>+ {meds.length - 3} more medication{meds.length - 3 !== 1 ? 's' : ''}</div>
        )}
      </div>

      {rx.notes && (
        <div style={{ 
          background: C.goldLight, 
          borderRadius: 10, 
          padding: '10px 14px', 
          borderLeft: `3px solid ${C.gold}`, 
          marginBottom: 16 
        }}>
          <p style={{ margin: 0, fontSize: 12, color: '#92400E' }}>📝 <strong>Doctor's notes:</strong> {rx.notes}</p>
        </div>
      )}

      <button 
        onClick={() => onView(rx)} 
        style={{ 
          width: '100%', 
          background: isFinished 
            ? 'linear-gradient(135deg, #10B981, #059669)' 
            : C.navy, 
          color: 'white', 
          border: 'none', 
          borderRadius: 12, 
          padding: '12px', 
          fontSize: 14, 
          fontWeight: 700, 
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isFinished 
            ? '0 2px 8px rgba(16,185,129,0.3)' 
            : '0 2px 8px rgba(15,52,96,0.2)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = isFinished 
            ? '0 4px 12px rgba(16,185,129,0.4)' 
            : '0 4px 12px rgba(15,52,96,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isFinished 
            ? '0 2px 8px rgba(16,185,129,0.3)' 
            : '0 2px 8px rgba(15,52,96,0.2)';
        }}
      >
        View Full Prescription →
      </button>
    </div>
  );
}

function PrescriptionDetailModal({ rx, onClose }) {
  const meds = rx.prescription_data?.medications || [];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,52,96,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 24, width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${C.navy}, #16213E)`, borderRadius: '24px 24px 0 0', padding: '28px 32px', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#76C893', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>Medical Prescription</p>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>Dr. {rx.doctor_name || 'Your Doctor'}</h2>
              {rx.diagnosis && <p style={{ margin: 0, fontSize: 14, opacity: 0.8 }}>Diagnosis: {rx.diagnosis}</p>}
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>DATE ISSUED</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{new Date(rx.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 11, opacity: 0.6 }}>MEDICATIONS</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{meds.length} item{meds.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding: '28px 32px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: C.navy }}>Medications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {meds.map((m, i) => (
              <div key={i} style={{ background: C.surface, borderRadius: 14, padding: '18px 20px', borderLeft: `4px solid ${C.teal}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 16, fontWeight: 700, color: C.navy }}>💊 {m.name}</p>
                    {m.dosage && <p style={{ margin: 0, fontSize: 13, color: C.slate }}>Dosage: {m.dosage}</p>}
                  </div>
                  <span style={{ background: C.tealLight, color: C.teal, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>#{i + 1}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {m.frequency && <span style={{ background: C.purpleLight, color: C.purple, fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>🕐 {m.frequency}</span>}
                  {m.duration && <span style={{ background: C.goldLight, color: '#92400E', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>📅 {m.duration}</span>}
                  {m.instructions && <span style={{ background: C.successLight, color: '#065F46', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>ℹ {m.instructions}</span>}
                </div>
              </div>
            ))}
          </div>
          {rx.notes && (
            <div style={{ background: C.goldLight, borderRadius: 12, padding: '16px 20px', borderLeft: `4px solid ${C.gold}` }}>
              <p style={{ margin: '0 0 4px', fontSize: 12, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5 }}>Doctor's Notes</p>
              <p style={{ margin: 0, fontSize: 14, color: '#78350F' }}>{rx.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AmashaPatientPrescriptions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRx, setViewRx] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const userData = JSON.parse(stored);
    setUser(userData);
    fetchPrescriptions(userData.id);
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchPrescriptions(userData.id);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchPrescriptions = async (userId) => {
    console.log('[PatientPrescriptions] Fetching prescriptions for user_id:', userId);
    try {
      const url = `${API_URL}/api/patients/me/prescriptions?user_id=${userId}`;
      console.log('[PatientPrescriptions] API URL:', url);
      
      const res = await fetch(url, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('[PatientPrescriptions] Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('[PatientPrescriptions] Received', data.length, 'prescriptions');
        console.log('[PatientPrescriptions] Prescription data:', data);
        setPrescriptions(data);
      } else {
        const errorText = await res.text();
        console.error('[PatientPrescriptions] Error response:', errorText);
      }
    } catch (err) {
      console.error('[PatientPrescriptions] Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Separate prescriptions by finished status
  const finishedPrescriptions = prescriptions.filter(rx => rx.is_finished === true);
  const activePrescriptions = prescriptions.filter(rx => rx.is_finished !== true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', padding: '36px 40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
            }}>
              💊
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>My Prescriptions</h1>
              <p style={{ margin: 0, color: C.slate, fontSize: 15 }}>View all prescriptions from your doctors</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 36 }}>
          {[
            { 
              label: 'Active Prescriptions', 
              value: activePrescriptions.length, 
              icon: '💙', 
              bg: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', 
              color: '#2563EB',
              description: 'Current medications'
            },
            { 
              label: 'Finished Consultations', 
              value: finishedPrescriptions.length, 
              icon: '✅', 
              bg: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)', 
              color: '#059669',
              description: 'Completed visits'
            },
            { 
              label: 'Total Prescriptions', 
              value: prescriptions.length, 
              icon: '📋', 
              bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', 
              color: '#D97706',
              description: 'All time'
            },
          ].map((s, i) => (
            <div key={i} style={{ 
              background: C.white, 
              borderRadius: 20, 
              padding: '24px 26px', 
              border: `1.5px solid ${C.border}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 16,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
            }}
            >
              <div style={{ 
                width: 52, 
                height: 52, 
                borderRadius: 16, 
                background: s.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 24 
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{s.description}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', background: C.white, borderRadius: 20, border: `1.5px solid ${C.border}` }}>
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 2s infinite' }}>⏳</div>
            <p style={{ color: C.slate, fontSize: 15, fontWeight: 600 }}>Loading your prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: C.white, borderRadius: 20, border: `1.5px solid ${C.border}` }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 42 }}>💊</div>
            <h3 style={{ margin: '0 0 12px', color: C.navy, fontSize: 22, fontWeight: 700 }}>No prescriptions yet</h3>
            <p style={{ color: C.slate, margin: 0, fontSize: 15 }}>Your doctor's prescriptions will appear here once issued.</p>
          </div>
        ) : (
          <div>
            {/* Active Prescriptions Section */}
            {activePrescriptions.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 8,
                    height: 28,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)'
                  }} />
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: 0 }}>
                    Active Prescriptions
                  </h2>
                  <span style={{
                    background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: 'white',
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700
                  }}>
                    {activePrescriptions.length}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 20 }}>
                  {activePrescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} onView={setViewRx} />)}
                </div>
              </section>
            )}

            {/* Finished Consultations Section */}
            {finishedPrescriptions.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 8,
                    height: 28,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #10B981, #059669)'
                  }} />
                  <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, margin: 0 }}>
                    Finished Consultations
                  </h2>
                  <span style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white',
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700
                  }}>
                    {finishedPrescriptions.length}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 20 }}>
                  {finishedPrescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} onView={setViewRx} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {viewRx && <PrescriptionDetailModal rx={viewRx} onClose={() => setViewRx(null)} />}
    </div>
  );
}