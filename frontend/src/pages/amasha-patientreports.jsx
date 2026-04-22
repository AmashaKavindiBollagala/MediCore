import React, { useState, useEffect, useRef } from 'react';
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
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  success: '#10B981',
  successLight: '#ECFDF5',
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
};

const navItems = [
  { to: '/patient-dashboard',   label: 'Dashboard',       path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/patient-profile',     label: 'My Profile',      path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { to: '/appointments',        label: 'Appointments',    path: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { to: '/patient-reports',     label: 'Medical Reports', path: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { to: '/patient-prescription',       label: 'Prescriptions',   path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
];

const REPORT_TYPES = [
  { value: 'blood_test',   label: 'Blood Test',   icon: '🩸' },
  { value: 'xray',         label: 'X-Ray',        icon: '🦴' },
  { value: 'mri',          label: 'MRI Scan',     icon: '🧲' },
  { value: 'ultrasound',   label: 'Ultrasound',   icon: '📡' },
  { value: 'urine_test',   label: 'Urine Test',   icon: '🧪' },
  { value: 'ct_scan',      label: 'CT Scan',      icon: '🖥' },
  { value: 'ecg',          label: 'ECG',          icon: '💓' },
  { value: 'other',        label: 'Other',        icon: '📄' },
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

function UploadZone({ onFile, file }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  };

  const ext = file ? file.name.split('.').pop().toUpperCase() : null;
  const extColors = { PDF: '#EF4444', JPG: '#3B82F6', PNG: '#10B981', DOCX: '#2563EB' };
  const extColor = extColors[ext] || C.teal;

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      onClick={() => !file && inputRef.current?.click()}
      style={{
        border: `2px dashed ${drag ? C.teal : file ? C.success : C.border}`,
        borderRadius: 16, padding: '32px', textAlign: 'center',
        background: drag ? C.tealLight : file ? C.successLight : '#FAFAFA',
        cursor: file ? 'default' : 'pointer', transition: 'all 0.2s',
      }}
    >
      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={e => e.target.files[0] && onFile(e.target.files[0])} style={{ display: 'none' }} />
      {!file ? (
        <>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📎</div>
          <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: C.navy }}>Drop your file here or click to browse</p>
          <p style={{ margin: 0, fontSize: 13, color: C.slate }}>Supports PDF, JPG, PNG, DOCX — Max 10MB</p>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `${extColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>📄</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ margin: '0 0 3px', fontSize: 15, fontWeight: 700, color: C.navy }}>{file.name}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ background: `${extColor}20`, color: extColor, fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{ext}</span>
              <span style={{ fontSize: 12, color: C.slate }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); onFile(null); }} style={{ background: '#FEF2F2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: C.danger, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
      )}
    </div>
  );
}

export default function AmashaPatientReports() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('list');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [form, setForm] = useState({ report_type: '', description: '', doctor_id: '' });
  const [file, setFile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
    fetchReports();
    fetchDoctors();
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/patients/reports`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setReports(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${API_URL}/api/doctors`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setDoctors(await res.json());
    } catch {}
  };

  const handleUpload = async () => {
    if (!file || !form.report_type) { setUploadError('Please select a file and report type.'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('report_type', form.report_type);
      formData.append('description', form.description);
      if (form.doctor_id) formData.append('doctor_id', form.doctor_id);

      const res = await fetch(`${API_URL}/api/patients/reports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setUploadSuccess(true);
        setForm({ report_type: '', description: '', doctor_id: '' });
        setFile(null);
        fetchReports();
        setTimeout(() => { setUploadSuccess(false); setTab('list'); }, 2200);
      } else {
        const err = await res.json().catch(() => ({}));
        setUploadError(err.message || 'Upload failed. Please try again.');
      }
    } catch {
      setUploadError('Network error. Please check your connection.');
    }
    finally { setUploading(false); }
  };

  const reportTypeMeta = { blood_test: { label: 'Blood Test', icon: '🩸', color: '#EF4444', bg: '#FEF2F2' }, xray: { label: 'X-Ray', icon: '🦴', color: '#6366F1', bg: '#EEF2FF' }, mri: { label: 'MRI Scan', icon: '🧲', color: '#8B5CF6', bg: '#F5F3FF' }, ultrasound: { label: 'Ultrasound', icon: '📡', color: '#0891B2', bg: '#E0F2FE' }, urine_test: { label: 'Urine Test', icon: '🧪', color: '#F59E0B', bg: '#FFFBEB' }, ct_scan: { label: 'CT Scan', icon: '🖥', color: '#10B981', bg: '#ECFDF5' }, ecg: { label: 'ECG', icon: '💓', color: '#EC4899', bg: '#FDF2F8' }, other: { label: 'Other', icon: '📄', color: '#64748B', bg: '#F1F5F9' } };
  const extColors = { pdf: { bg: '#FEF2F2', color: '#991B1B' }, jpg: { bg: '#EFF6FF', color: '#1D4ED8' }, jpeg: { bg: '#EFF6FF', color: '#1D4ED8' }, png: { bg: '#F0FDF4', color: '#166534' }, docx: { bg: '#EFF6FF', color: '#1E40AF' } };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', sans-serif" }}>
      <Sidebar user={user} />
      <main style={{ flex: 1, background: C.surface, padding: '36px 40px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>My Medical Reports</h1>
            <p style={{ margin: 0, color: C.slate, fontSize: 14 }}>Upload and manage your diagnostic reports — your doctor can view them</p>
          </div>
          <button onClick={() => setTab(tab === 'upload' ? 'list' : 'upload')} style={{ background: tab === 'upload' ? '#F1F5F9' : C.navy, border: 'none', borderRadius: 12, padding: '11px 22px', color: tab === 'upload' ? C.slate : 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {tab === 'upload' ? '← View Reports' : '+ Upload Report'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Reports', value: reports.length, icon: '📋', bg: C.tealLight },
            { label: 'This Month', value: reports.filter(r => { const d = new Date(r.uploaded_at); const n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear(); }).length, icon: '📅', bg: C.goldLight },
            { label: 'Blood Tests', value: reports.filter(r => r.report_type === 'blood_test').length, icon: '🩸', bg: '#FEF2F2' },
            { label: 'Scans & Imaging', value: reports.filter(r => ['xray', 'mri', 'ultrasound', 'ct_scan'].includes(r.report_type)).length, icon: '🦴', bg: '#EEF2FF' },
          ].map((s, i) => (
            <div key={i} style={{ background: C.white, borderRadius: 14, padding: '16px 18px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F1F5F9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[['list', '📋 My Reports'], ['upload', '⬆ Upload New']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === id ? 700 : 500, background: tab === id ? C.white : 'transparent', color: tab === id ? C.navy : C.slate, boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* List */}
        {tab === 'list' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <p style={{ color: C.slate }}>Loading your reports...</p>
              </div>
            ) : reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>📋</div>
                <h3 style={{ margin: '0 0 8px', color: C.navy }}>No reports yet</h3>
                <p style={{ color: C.slate, margin: '0 0 20px' }}>Upload your medical reports and your doctor will be able to review them.</p>
                <button onClick={() => setTab('upload')} style={{ background: C.navy, color: 'white', border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Upload First Report</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {reports.map(r => {
                  const meta = reportTypeMeta[r.report_type] || reportTypeMeta.other;
                  const ext = (r.file_name || '').split('.').pop()?.toLowerCase();
                  const ec = extColors[ext] || { bg: '#F1F5F9', color: '#475569' };
                  return (
                    <div key={r.id} style={{ background: C.white, borderRadius: 18, border: `1.5px solid ${C.border}`, padding: '20px 24px', boxShadow: '0 1px 8px rgba(15,52,96,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{meta.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{r.file_name}</span>
                            <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{meta.icon} {meta.label}</span>
                            <span style={{ background: ec.bg, color: ec.color, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{ext?.toUpperCase()}</span>
                          </div>
                          <p style={{ margin: '0 0 8px', fontSize: 13, color: C.slate }}>{r.description || 'No description provided'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 12, color: C.slate }}>🕐 {new Date(r.uploaded_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            {r.doctor_name && <span style={{ fontSize: 12, color: C.teal, fontWeight: 600 }}>👨‍⚕️ Sent to Dr. {r.doctor_name}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                          <a href={r.report_url} target="_blank" rel="noopener noreferrer" style={{ background: C.navy, color: 'white', textDecoration: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700 }}>View ↗</a>
                          <a href={r.report_url} download style={{ background: C.tealLight, color: C.teal, textDecoration: 'none', borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 700 }}>⬇</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upload form */}
        {tab === 'upload' && (
          <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', maxWidth: 700 }}>
            {uploadSuccess ? (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✅</div>
                <h3 style={{ margin: '0 0 8px', color: C.navy, fontSize: 22, fontWeight: 800 }}>Report Uploaded!</h3>
                <p style={{ color: C.slate, margin: 0 }}>Your doctor can now view this report in their portal.</p>
              </div>
            ) : (
              <>
                <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>⬆️</span> Upload Medical Report
                </h2>

                {/* File drop */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select File *</label>
                  <UploadZone file={file} onFile={setFile} />
                </div>

                {/* Report type */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Report Type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {REPORT_TYPES.map(({ value, label, icon }) => (
                      <button key={value} onClick={() => setForm(f => ({ ...f, report_type: value }))} style={{
                        padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${form.report_type === value ? C.teal : C.border}`, cursor: 'pointer', fontSize: 13, fontWeight: form.report_type === value ? 700 : 400,
                        background: form.report_type === value ? C.tealLight : '#FAFAFA', color: form.report_type === value ? C.teal : C.slate, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                      }}>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description (optional)</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="E.g. CBC test results from City Hospital, March 2025. Include any relevant context for your doctor." rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                </div>

                {/* Doctor select */}
                {doctors.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Share with Doctor (optional)</label>
                    <select value={form.doctor_id} onChange={e => setForm(f => ({ ...f, doctor_id: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                      <option value="">-- Select your doctor (optional) --</option>
                      {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name} — {d.specialty}</option>)}
                    </select>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: C.slate }}>Your doctor will be notified and can view this report in their portal.</p>
                  </div>
                )}

                {uploadError && (
                  <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
                    <p style={{ margin: 0, color: C.danger, fontSize: 14 }}>⚠️ {uploadError}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => { setTab('list'); setUploadError(''); setFile(null); setForm({ report_type: '', description: '', doctor_id: '' }); }} style={{ background: '#F1F5F9', color: C.slate, border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                  <button onClick={handleUpload} disabled={uploading || !file || !form.report_type} style={{ background: uploading || !file || !form.report_type ? '#CBD5E1' : C.navy, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: uploading || !file || !form.report_type ? 'not-allowed' : 'pointer', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {uploading ? '⏳ Uploading...' : '⬆ Upload Report'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}