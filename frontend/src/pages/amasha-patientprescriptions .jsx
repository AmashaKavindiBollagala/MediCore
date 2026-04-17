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
  { to: '/patient-reports',     label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/patient-prescription',       label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

function Sidebar({ user }) {
  const loc = window.location.pathname;
  return (
    <aside style={{ width: 240, minHeight: '100vh', background: 'linear-gradient(180deg, #0F3460 0%, #16213E 100%)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💊</div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: '-0.3px' }}>Medi<span style={{ color: '#76C893' }}>Core</span></span>
        </div>
      </div>
      <div style={{ padding: '16px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ background: 'rgba(15,155,142,0.15)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#26667F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div>
            <p style={{ margin: 0, color: 'white', fontWeight: 600, fontSize: 13 }}>{user?.name || 'Patient'}</p>
            <p style={{ margin: 0, color: '#76C893', fontSize: 11 }}>Patient</p>
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '14px 10px' }}>
        {navItems.map(({ to, label, path }) => {
          const active = loc === to;
          return (
            <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 3, textDecoration: 'none', background: active ? 'rgba(15,155,142,0.25)' : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.6)', fontWeight: active ? 600 : 400, fontSize: 14 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" stroke="currentColor" d={path} /></svg>
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
  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1.5px solid ${C.border}`, padding: '24px', boxShadow: '0 2px 12px rgba(15,52,96,0.06)', transition: 'all 0.15s', position: 'relative', overflow: 'hidden' }}>
      {isNew && (
        <div style={{ position: 'absolute', top: 16, right: 16, background: C.teal, color: 'white', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5 }}>NEW</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 16, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>💊</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>Dr. {rx.doctor_name || 'Your Doctor'}</h3>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.slate }}>
            {rx.diagnosis && <><strong style={{ color: C.navy }}>Diagnosis:</strong> {rx.diagnosis} · </>}
            Issued {new Date(rx.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Medications preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {meds.slice(0, 3).map((m, i) => (
          <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.teal, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{m.name}</span>
                {m.dosage && <span style={{ fontSize: 12, color: C.slate }}> · {m.dosage}</span>}
              </div>
            </div>
            {m.frequency && (
              <span style={{ fontSize: 11, color: C.teal, background: C.tealLight, padding: '2px 10px', borderRadius: 20, fontWeight: 600 }}>{m.frequency}</span>
            )}
          </div>
        ))}
        {meds.length > 3 && (
          <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: C.slate, textAlign: 'center' }}>+ {meds.length - 3} more medication{meds.length - 3 !== 1 ? 's' : ''}</div>
        )}
      </div>

      {rx.notes && (
        <div style={{ background: C.goldLight, borderRadius: 10, padding: '10px 14px', borderLeft: `3px solid ${C.gold}`, marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#92400E' }}>📝 <strong>Doctor's notes:</strong> {rx.notes}</p>
        </div>
      )}

      <button onClick={() => onView(rx)} style={{ width: '100%', background: C.navy, color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
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
    setUser(JSON.parse(stored));
    fetchPrescriptions();
  }, [navigate]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/patients/prescriptions`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPrescriptions(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, background: C.surface, padding: '36px 40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>My Prescriptions</h1>
          <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>View all prescriptions issued by your doctors</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Prescriptions', value: prescriptions.length, icon: '📋', bg: C.tealLight, color: C.teal },
            { label: 'Active (< 1 month)', value: prescriptions.filter(rx => (new Date() - new Date(rx.issued_at)) < 30 * 86400000).length, icon: '✅', bg: C.successLight, color: '#065F46' },
            { label: 'New (< 3 days)', value: prescriptions.filter(rx => (new Date() - new Date(rx.issued_at)) < 3 * 86400000).length, icon: '🆕', bg: C.goldLight, color: '#92400E' },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 16, padding: '20px 22px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: C.slate, marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <p style={{ color: C.slate }}>Loading your prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>💊</div>
            <h3 style={{ margin: '0 0 8px', color: C.navy, fontSize: 20, fontWeight: 700 }}>No prescriptions yet</h3>
            <p style={{ color: C.slate, margin: 0 }}>Your doctor's prescriptions will appear here once issued.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
            {prescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} onView={setViewRx} />)}
          </div>
        )}
      </main>

      {viewRx && <PrescriptionDetailModal rx={viewRx} onClose={() => setViewRx(null)} />}
    </div>
  );
}