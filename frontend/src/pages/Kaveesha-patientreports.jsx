import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const C = {
  navy: '#0F3460',
  teal: '#16213E',
  accent: '#0F9B8E',
  accentLight: '#E8FAF8',
  accentMid: '#B2EDE7',
  gold: '#E8A838',
  goldLight: '#FFF8EC',
  slate: '#64748B',
  surface: '#F8FAFC',
  white: '#FFFFFF',
  border: '#E2E8F0',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  warn: '#F59E0B',
  warnLight: '#FFFBEB',
};

const TYPE_META = {
  blood_test:   { label: 'Blood Test',      icon: '🩸', color: '#EF4444', bg: '#FEF2F2' },
  xray:         { label: 'X-Ray',           icon: '🦴', color: '#6366F1', bg: '#EEF2FF' },
  mri:          { label: 'MRI Scan',        icon: '🧲', color: '#8B5CF6', bg: '#F5F3FF' },
  ultrasound:   { label: 'Ultrasound',      icon: '📡', color: '#0891B2', bg: '#E0F2FE' },
  urine_test:   { label: 'Urine Test',      icon: '🧪', color: '#F59E0B', bg: '#FFFBEB' },
  ct_scan:      { label: 'CT Scan',         icon: '🖥',  color: '#10B981', bg: '#ECFDF5' },
  ecg:          { label: 'ECG',             icon: '💓', color: '#EC4899', bg: '#FDF2F8' },
  prescription: { label: 'Prescription',    icon: '💊', color: '#0F9B8E', bg: '#E8FAF8' },
  other:        { label: 'Other',           icon: '📄', color: '#64748B', bg: '#F1F5F9' },
};

const FILE_EXT_COLORS = {
  pdf:  { bg: '#FEF2F2', color: '#991B1B', label: 'PDF' },
  jpg:  { bg: '#EFF6FF', color: '#1D4ED8', label: 'JPG' },
  jpeg: { bg: '#EFF6FF', color: '#1D4ED8', label: 'JPG' },
  png:  { bg: '#F0FDF4', color: '#166534', label: 'PNG' },
  docx: { bg: '#EFF6FF', color: '#1E40AF', label: 'DOC' },
};

function Badge({ type }) {
  const m = TYPE_META[type] || TYPE_META.other;
  return (
    <span style={{ background: m.bg, color: m.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 0.3, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 12 }}>{m.icon}</span>{m.label}
    </span>
  );
}

function ExtBadge({ filename }) {
  const ext = (filename || '').split('.').pop()?.toLowerCase();
  const meta = FILE_EXT_COLORS[ext] || { bg: '#F1F5F9', color: '#475569', label: ext?.toUpperCase() || 'FILE' };
  return (
    <span style={{ background: meta.bg, color: meta.color, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, letterSpacing: 0.5 }}>
      {meta.label}
    </span>
  );
}

export default function KaveeshaPatientReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors/me/reports', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReports(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || (r.patient_name || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q) || (r.file_name || '').toLowerCase().includes(q);
    const matchType = filterType === 'ALL' || r.report_type === filterType;
    return matchSearch && matchType;
  });

  const typeCounts = Object.keys(TYPE_META).reduce((acc, t) => {
    acc[t] = reports.filter(r => r.report_type === t).length;
    return acc;
  }, {});

  const stats = [
    { label: 'Total Reports', value: reports.length, icon: '📋', color: C.accent, bg: C.accentLight },
    { label: 'This Week', value: reports.filter(r => { const d = new Date(r.uploaded_at); const now = new Date(); return (now - d) < 7 * 86400000; }).length, icon: '📅', color: C.gold, bg: C.goldLight },
    { label: 'Unique Patients', value: new Set(reports.map(r => r.patient_id)).size, icon: '👥', color: '#6366F1', bg: '#EEF2FF' },
    { label: 'Pending Review', value: reports.filter(r => !r.reviewed).length, icon: '⏳', color: C.warn, bg: C.warnLight },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: C.surface, minHeight: '100vh', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <button onClick={() => navigate('/doctor-dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                ← Dashboard
              </button>
              <span style={{ color: C.border }}>/</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Patient Reports</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>Patient Medical Reports</h1>
            <p style={{ margin: '6px 0 0', color: C.slate, fontSize: 14 }}>Review and manage all patient-uploaded diagnostic files</p>
          </div>
          <button onClick={fetchReports} style={{ background: C.navy, border: 'none', borderRadius: 12, padding: '10px 20px', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 16, padding: '20px 22px', border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{s.icon}</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: C.slate, marginTop: 6, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        {/* Sidebar Filters */}
        <div>
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}` }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.navy, textTransform: 'uppercase', letterSpacing: 0.8 }}>Filter by Type</p>
            </div>
            <div style={{ padding: '12px 12px' }}>
              <button onClick={() => setFilterType('ALL')} style={{
                width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: filterType === 'ALL' ? 700 : 400,
                background: filterType === 'ALL' ? C.accentLight : 'transparent', color: filterType === 'ALL' ? C.accent : C.slate, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2,
              }}>
                <span>📁 All Reports</span>
                <span style={{ background: filterType === 'ALL' ? C.accentMid : C.border, color: filterType === 'ALL' ? C.accent : C.slate, borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>{reports.length}</span>
              </button>
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <button key={key} onClick={() => setFilterType(key)} style={{
                  width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: filterType === key ? 700 : 400,
                  background: filterType === key ? meta.bg : 'transparent', color: filterType === key ? meta.color : C.slate, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2,
                }}>
                  <span>{meta.icon} {meta.label}</span>
                  {typeCounts[key] > 0 && <span style={{ background: filterType === key ? 'rgba(255,255,255,0.7)' : C.border, color: filterType === key ? meta.color : C.slate, borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 700 }}>{typeCounts[key]}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.slate, fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by patient name, description, or file..." style={{
              width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, background: C.white, outline: 'none', boxSizing: 'border-box',
            }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⏳</div>
              <p style={{ color: C.slate, fontSize: 15 }}>Loading patient reports...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>📋</div>
              <h3 style={{ margin: '0 0 8px', color: C.navy, fontSize: 18, fontWeight: 700 }}>No reports found</h3>
              <p style={{ color: C.slate, margin: 0 }}>{search || filterType !== 'ALL' ? 'Try adjusting your filters.' : 'Patient reports will appear here once uploaded.'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 14 }}>
              {filtered.map(report => {
                const meta = TYPE_META[report.report_type] || TYPE_META.other;
                const isSelected = selected === report.id;
                return (
                  <div key={report.id} onClick={() => setSelected(isSelected ? null : report.id)} style={{
                    background: C.white, borderRadius: 16, border: `1.5px solid ${isSelected ? C.accent : C.border}`, padding: '20px 24px', cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 0 3px ${C.accentLight}` : '0 1px 6px rgba(0,0,0,0.04)', transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                      {/* Icon */}
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{meta.icon}</div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{report.patient_name || `Patient #${report.patient_id}`}</span>
                          <Badge type={report.report_type} />
                          <ExtBadge filename={report.file_name} />
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: C.slate }}>
                          {report.description || 'No description provided'}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 12, color: C.slate, display: 'flex', alignItems: 'center', gap: 4 }}>
                            📎 {report.file_name}
                          </span>
                          <span style={{ fontSize: 12, color: C.slate }}>
                            🕐 {new Date(report.uploaded_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <a href={report.report_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                          background: C.navy, color: 'white', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700,
                        }}>View ↗</a>
                        <a href={report.report_url} download onClick={e => e.stopPropagation()} style={{
                          background: C.accentLight, color: C.accent, textDecoration: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700,
                        }}>⬇</a>
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isSelected && (
                      <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px dashed ${C.border}`, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                        {[
                          { label: 'Patient ID', value: report.patient_id },
                          { label: 'Report Type', value: meta.label },
                          { label: 'File Name', value: report.file_name },
                          { label: 'Upload Date', value: new Date(report.uploaded_at).toLocaleString() },
                          { label: 'Patient Email', value: report.patient_email || '—' },
                          { label: 'Reviewed', value: report.reviewed ? '✅ Yes' : '⏳ Pending' },
                        ].map((item, i) => (
                          <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '12px 14px' }}>
                            <p style={{ margin: '0 0 3px', fontSize: 11, color: C.slate, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
                            <p style={{ margin: 0, fontSize: 13, color: C.navy, fontWeight: 600 }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}