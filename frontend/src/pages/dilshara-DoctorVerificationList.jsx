// dilshara-DoctorVerificationList.jsx
// Lists all doctors grouped by verification status with filter tabs

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors } from '../services/dilshara-adminApi';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const STATUS_STYLE = {
  pending:  { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B',  label: 'Pending'  },
  approved: { bg: 'rgba(16,185,129,0.15)',  color: '#10B981',  label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444',  label: 'Rejected' },
};

const Badge = ({ status }) => {
  const s = STATUS_STYLE[status] || {};
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: '3px 12px', borderRadius: 20,
      fontSize: 12, fontWeight: 700,
    }}>{s.label}</span>
  );
};

export default function DilsharaDoctorVerificationList() {
  const navigate = useNavigate();
  const [doctors, setDoctors]   = useState([]);
  const [tab, setTab]           = useState('all');
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    setLoading(true);
    getDoctors(tab)
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      !q ||
      d.full_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.specialty?.toLowerCase().includes(q)
    );
  });

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
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '8px 14px', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ← Back
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
            Doctor Verification
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Review and approve doctor registrations
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px' }}>

        {/* Filters row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
            {STATUS_TABS.map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 18px', borderRadius: 9, border: 'none',
                background: tab === t ? 'rgba(103,192,144,0.2)' : 'transparent',
                color: tab === t ? '#67C090' : 'rgba(255,255,255,0.45)',
                fontWeight: tab === t ? 700 : 400,
                fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}>{t}</button>
            ))}
          </div>

          {/* Search */}
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, specialty…"
            style={{
              flex: 1, minWidth: 220, padding: '10px 16px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingTop: 60 }}>
            Loading doctors…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', paddingTop: 80,
            color: 'rgba(255,255,255,0.3)', fontSize: 15,
          }}>
            No doctors found for this filter.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((doc) => (
              <div key={doc.id}
                onClick={() => navigate(`/admin/doctors/${doc.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr 160px 140px 120px 100px',
                  alignItems: 'center', gap: 20,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(103,192,144,0.07)';
                  e.currentTarget.style.borderColor = 'rgba(103,192,144,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: 'linear-gradient(135deg, #124170, #67C090)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {doc.profile_photo_url
                    ? <img src={doc.profile_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (doc.first_name?.[0] || '?')}
                </div>

                {/* Name + email */}
                <div>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: 15, marginBottom: 3 }}>
                    {doc.full_name || `${doc.first_name} ${doc.last_name}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{doc.email}</div>
                </div>

                {/* Specialty */}
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{doc.specialty || '—'}</div>

                {/* Hospital */}
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{doc.hospital || '—'}</div>

                {/* Date */}
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
                </div>

                {/* Status badge */}
                <div><Badge status={doc.verification_status} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}