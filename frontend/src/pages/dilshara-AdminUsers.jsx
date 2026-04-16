// dilshara-AdminUsers.jsx
// Read-only user list — shows all users registered in auth.users
// Auth logic is owned by the auth-service team (Amasha)

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../services/dilshara-adminApi';

const ROLE_STYLE = {
  admin:   { bg: 'rgba(129,140,248,0.15)', color: '#818CF8' },
  doctor:  { bg: 'rgba(103,192,144,0.15)', color: '#67C090' },
  patient: { bg: 'rgba(52,160,164,0.15)',  color: '#34A0A4' },
};

export default function DilsharaAdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const matchRole  = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = {
    all:     users.length,
    patient: users.filter((u) => u.role === 'patient').length,
    doctor:  users.filter((u) => u.role === 'doctor').length,
    admin:   users.filter((u) => u.role === 'admin').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '7px 14px', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, cursor: 'pointer',
        }}>← Back</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>User Management</h2>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Read-only view — auth managed by auth-service</p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 40px' }}>

        {/* Info notice */}
        <div style={{
          background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,0.5)',
        }}>
          <span>ℹ️</span>
          <span>User creation, login, and role assignment is handled by the <strong style={{ color: '#818CF8' }}>auth-service</strong> (Amasha). This view is read-only.</span>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
            {['all', 'patient', 'doctor', 'admin'].map((r) => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{
                padding: '7px 16px', borderRadius: 9, border: 'none',
                background: roleFilter === r ? 'rgba(129,140,248,0.2)' : 'transparent',
                color: roleFilter === r ? '#818CF8' : 'rgba(255,255,255,0.4)',
                fontWeight: roleFilter === r ? 700 : 400,
                fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
              }}>
                {r} <span style={{ opacity: 0.6 }}>({counts[r]})</span>
              </button>
            ))}
          </div>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            style={{
              flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', paddingTop: 60 }}>Loading users…</div>
        ) : (
          <>
            {/* Header row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 160px',
              padding: '8px 20px', marginBottom: 8,
              fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase', letterSpacing: 1.5,
            }}>
              <span>Email</span><span>Role</span><span>Joined</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filtered.map((u) => {
                const rs = ROLE_STYLE[u.role] || ROLE_STYLE.patient;
                return (
                  <div key={u.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 120px 160px',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '14px 20px',
                  }}>
                    <span style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{u.email}</span>
                    <span style={{
                      display: 'inline-block', padding: '3px 12px', borderRadius: 20,
                      fontSize: 12, fontWeight: 700,
                      background: rs.bg, color: rs.color,
                      textTransform: 'capitalize',
                    }}>{u.role}</span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', paddingTop: 40, fontSize: 14 }}>
                  No users found.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}