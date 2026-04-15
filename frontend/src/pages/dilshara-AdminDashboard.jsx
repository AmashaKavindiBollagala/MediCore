// dilshara-AdminDashboard.jsx
// Main admin dashboard — stats overview + navigation to doctor verification

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../services/dilshara-adminApi';

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 20,
    padding: '28px 28px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backdropFilter: 'blur(12px)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: -20, right: -20,
      width: 100, height: 100, borderRadius: '50%',
      background: accent, opacity: 0.12, filter: 'blur(20px)',
    }} />
    <div style={{ fontSize: 28 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 38, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: accent, marginTop: 4, fontWeight: 600 }}>{sub}</div>
      )}
    </div>
  </div>
);

const NavCard = ({ title, desc, icon, badge, onClick, accent }) => (
  <button onClick={onClick} style={{
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${accent}44`,
    borderRadius: 20,
    padding: '28px 28px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.25s',
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.background = `${accent}18`;
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      e.currentTarget.style.borderColor = `${accent}44`;
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      {badge != null && (
        <span style={{
          background: accent, color: '#fff', borderRadius: 20, padding: '3px 12px',
          fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>{badge}</span>
      )}
    </div>
    <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>{desc}</div>
  </button>
);

export default function DilsharaAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const d = stats?.doctors || {};
  const u = stats?.users || {};

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 50%, #0F2337 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #124170, #67C090)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>MediCore</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Admin Control Panel</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{user.email || 'Admin'}</div>
            <div style={{ fontSize: 11, color: '#67C090' }}>System Administrator</div>
          </div>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 10, padding: '8px 16px', color: 'rgba(255,255,255,0.6)',
              fontSize: 13, cursor: 'pointer',
            }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{
            fontSize: 36, fontWeight: 800, color: '#fff',
            fontFamily: "'Syne', sans-serif", margin: 0, lineHeight: 1.1,
          }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 8, fontSize: 15 }}>
            Here's what's happening across MediCore today.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
          <StatCard icon="⏳" label="Pending Verifications" value={loading ? '...' : d.pending} sub="Requires your review" accent="#F59E0B" />
          <StatCard icon="✅" label="Approved Doctors" value={loading ? '...' : d.approved} sub="Active on platform" accent="#10B981" />
          <StatCard icon="❌" label="Rejected Applications" value={loading ? '...' : d.rejected} sub="Declined registrations" accent="#EF4444" />
          <StatCard icon="👥" label="Total Users" value={loading ? '...' : u.total_users} sub={`${u.patients || 0} patients`} accent="#67C090" />
        </div>

        {/* Section title */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
          Admin Modules
        </div>

        {/* Nav Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
          <NavCard
            icon="🩺"
            title="Doctor Verification"
            desc="Review pending doctor registrations, analyse their medical license with AI, and approve or reject applications."
            badge={d.pending > 0 ? `${d.pending} pending` : null}
            accent="#67C090"
            onClick={() => navigate('/admin/doctors')}
          />
          <NavCard
            icon="💳"
            title="Payment Overview"
            desc="Monitor transaction status, revenue summaries, and payment disputes. Managed by the payments team."
            accent="#818CF8"
            onClick={() => navigate('/admin/payments')}
          />
          <NavCard
            icon="📅"
            title="Doctor Availability"
            desc="View doctor schedule summaries and slot utilisation across the platform. Managed by the doctor-service team."
            accent="#34A0A4"
            onClick={() => navigate('/admin/availability')}
          />
          <NavCard
            icon="👤"
            title="User Management"
            desc="Browse all registered users, view their roles, and monitor account activity across the platform."
            accent="#F59E0B"
            onClick={() => navigate('/admin/users')}
          />
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 48, padding: '20px 24px', borderRadius: 14,
          background: 'rgba(103,192,144,0.06)', border: '1px solid rgba(103,192,144,0.15)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#67C090' }}>AI-Assisted Verification Active</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              When you open a doctor's application, the AI will automatically read and extract details from their uploaded medical license so you can verify faster.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}