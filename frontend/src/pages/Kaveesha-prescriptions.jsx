import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const COLORS = {
  navy: '#184E77',
  teal: '#34A0A4',
  mint: '#76C893',
  cream: '#F1FAEE',
  blush: '#FFE5EC',
  navyLight: '#1B6CA8',
  tealLight: '#52B5BA',
  mintLight: '#A8DDB5',
  navyDark: '#0D3352',
};

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', route: '/doctor-dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'appointments', label: 'Appointments', route: '/doctor-appointments',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'telemedicine', label: 'My Consultations', route: '/doctor-telemedicine',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'availability', label: 'Availability', route: '/doctor-availability',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'prescriptions', label: 'Prescriptions', route: '/doctor-prescriptions',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'reports', label: 'Patient Reports', route: '/doctor-reports',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'profile', label: 'My Profile', route: '/doctor-profile',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

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
  purple: '#7C3AED',
  purpleLight: '#F5F3FF',
};

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'At bedtime', 'With meals', 'Before meals', 'After meals'];
const DURATION_OPTIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '1 month', '2 months', '3 months', '6 months', 'Ongoing'];

function MedRow({ med, idx, onChange, onRemove }) {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '18px 20px', border: '1px solid #E2E8F0', marginBottom: 12, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ background: C.accentLight, color: C.accent, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>#{idx + 1}</div>
        <button onClick={() => onRemove(idx)} style={{ background: '#FEF2F2', border: 'none', color: C.danger, borderRadius: 8, width: 28, height: 28, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Medication Name *</label>
          <input value={med.name} onChange={e => onChange(idx, 'name', e.target.value)} placeholder="e.g. Amoxicillin 500mg" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: C.navy, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dosage *</label>
          <input value={med.dosage} onChange={e => onChange(idx, 'dosage', e.target.value)} placeholder="e.g. 500mg, 1 tablet" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: C.navy, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Frequency</label>
          <select value={med.frequency} onChange={e => onChange(idx, 'frequency', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: C.navy, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
            <option value="">Select...</option>
            {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</label>
          <select value={med.duration} onChange={e => onChange(idx, 'duration', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: C.navy, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
            <option value="">Select...</option>
            {DURATION_OPTIONS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instructions</label>
          <input value={med.instructions} onChange={e => onChange(idx, 'instructions', e.target.value)} placeholder="e.g. Take with water" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: C.navy, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
    </div>
  );
}

function PrescriptionCard({ rx, onView }) {
  const meds = rx.prescription_data?.medications || [];
  return (
    <div style={{ background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: '22px 26px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>💊</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>{rx.patient_name || `Patient #${rx.patient_id}`}</h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: C.slate }}>Issued: {new Date(rx.issued_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: C.accentLight, color: C.accent, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
            {meds.length} Medication{meds.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Med list preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {meds.slice(0, 3).map((m, i) => (
          <div key={i} style={{ background: '#F1F5F9', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.navy, fontWeight: 600 }}>
            💊 {m.name} {m.dosage && `· ${m.dosage}`}
          </div>
        ))}
        {meds.length > 3 && <div style={{ background: C.border, borderRadius: 8, padding: '6px 12px', fontSize: 12, color: C.slate }}>+{meds.length - 3} more</div>}
      </div>

      {rx.notes && (
        <p style={{ margin: '0 0 14px', fontSize: 13, color: C.slate, background: C.goldLight, padding: '10px 14px', borderRadius: 10, borderLeft: `3px solid ${C.gold}` }}>
          📝 {rx.notes}
        </p>
      )}

      <button onClick={() => onView(rx)} style={{ background: C.navy, color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
        View Full Prescription →
      </button>
    </div>
  );
}

function PrescriptionModal({ rx, onClose }) {
  const meds = rx.prescription_data?.medications || [];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,52,96,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: C.white, borderRadius: 24, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', padding: '32px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>💊</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.navy }}>Prescription Details</h2>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: C.slate }}>{rx.patient_name || `Patient #${rx.patient_id}`} · {new Date(rx.issued_at).toLocaleDateString()}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: C.slate, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {meds.map((m, i) => (
            <div key={i} style={{ background: C.surface, borderRadius: 14, padding: '18px 20px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: C.accentLight, color: C.accent, borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>{i + 1}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>{m.name}</p>
                    {m.dosage && <p style={{ margin: 0, fontSize: 13, color: C.slate }}>{m.dosage}</p>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {m.frequency && <span style={{ background: '#EEF2FF', color: '#3730A3', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>🕐 {m.frequency}</span>}
                {m.duration && <span style={{ background: C.goldLight, color: '#92400E', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>📅 {m.duration}</span>}
                {m.instructions && <span style={{ background: C.successLight, color: '#065F46', fontSize: 12, padding: '4px 12px', borderRadius: 20, fontWeight: 600 }}>ℹ {m.instructions}</span>}
              </div>
            </div>
          ))}
        </div>
        {rx.notes && (
          <div style={{ marginTop: 16, background: C.goldLight, borderRadius: 12, padding: '14px 18px', borderLeft: `4px solid ${C.gold}` }}>
            <p style={{ margin: 0, fontSize: 13, color: '#92400E' }}><strong>Doctor's Notes:</strong> {rx.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KaveeshaPrescriptions() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [tab, setTab] = useState('list');
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');
  
  // Completed appointments state
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [appointmentReports, setAppointmentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setDoctor({
        first_name: userData.first_name || userData.name?.split(' ')[0] || 'Doctor',
        last_name: userData.last_name || userData.name?.split(' ')[1] || '',
        specialty: userData.specialty || 'General Physician',
        verification_status: userData.verification_status || 'approved',
      });
    }
  }, []);

  const initials = doctor ? `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase() : 'D';

  // Form state
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => { fetchData(); fetchCompletedAppointments(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rxRes, ptRes] = await Promise.all([
        fetch('/api/doctors/me/prescriptions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/doctors/me/patients', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (rxRes.ok) setPrescriptions(await rxRes.json());
      if (ptRes.ok) setPatients(await ptRes.json());
    } catch {}
    finally { setLoading(false); }
  };

  const fetchCompletedAppointments = async () => {
    try {
      const response = await fetch('/api/appointments/doctor/my-appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success || data.data) {
        const completed = (data.data || []).filter(appt => 
          appt.status === 'COMPLETED' && 
          (appt.consultation_type === 'video' || appt.consultation_type === 'online')
        );
        setCompletedAppointments(completed);
      }
    } catch (err) {
      console.error('Error fetching completed appointments:', err);
    }
  };

  const handleSelectForPrescription = (appt) => {
    setSelectedAppointment(appt);
    setForm(f => ({
      ...f,
      patient_id: appt.patient_id,
      diagnosis: appt.symptoms || '',
    }));
    setTab('new');
    setShowPrescriptionForm(true);
  };

  const handleViewReports = async (appt) => {
    console.log('🔍 View Reports clicked for appointment:', appt.id);
    console.log('🔍 Fetching URL:', `/api/doctors/me/reports/appointment/${appt.id}`);
    
    setSelectedAppointment(appt);
    setLoadingReports(true);
    setShowReportsModal(true);
    
    try {
      const response = await fetch(`/api/doctors/me/reports/appointment/${appt.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reports loaded:', data.length, 'reports');
        setAppointmentReports(data);
      } else {
        console.error('❌ Failed to load reports:', response.status);
        setAppointmentReports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      setAppointmentReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  const updateMed = (i, field, val) => setForm(f => ({ ...f, medications: f.medications.map((m, idx) => idx === i ? { ...m, [field]: val } : m) }));

  const handleSubmit = async () => {
    if (!form.patient_id || form.medications.some(m => !m.name)) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/doctors/me/prescriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: form.patient_id,
          diagnosis: form.diagnosis,
          notes: form.notes,
          prescription_data: { medications: form.medications },
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ patient_id: '', diagnosis: '', notes: '', medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }] });
        fetchData();
        setTimeout(() => { setSuccess(false); setTab('list'); }, 2000);
      }
    } catch {}
    finally { setSubmitting(false); }
  };

  const filtered = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    return !q || (rx.patient_name || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: sidebarOpen ? 260 : 78, minHeight: '100vh', background: COLORS.navy, display: 'flex', flexDirection: 'column', transition: 'width 0.3s cubic-bezier(.4,0,.2,1)', overflow: 'hidden', flexShrink: 0, boxShadow: '4px 0 24px rgba(24,78,119,0.15)' }}>
        <div style={{ padding: sidebarOpen ? '28px 22px 22px' : '28px 16px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </div>
          {sidebarOpen && <span style={{ fontSize: 22, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>Medi<span style={{ color: COLORS.mint }}>Core</span></span>}
        </div>
        {sidebarOpen && doctor && (
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0, border: '2px solid rgba(255,255,255,0.3)' }}>{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dr. {doctor.first_name} {doctor.last_name}</p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.mintLight }}>{doctor.specialty}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', width: 'fit-content' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: doctor.verification_status === 'approved' ? COLORS.mint : '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: doctor.verification_status === 'approved' ? COLORS.mintLight : '#FCD34D', fontWeight: 500 }}>{doctor.verification_status === 'approved' ? 'Verified Doctor' : 'Pending Verification'}</span>
            </div>
          </div>
        )}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(({ id, label, route, icon }) => {
            const active = id === 'prescriptions';
            return (
              <button key={id} onClick={() => navigate(route)} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: active ? COLORS.teal : 'transparent', color: active ? 'white' : 'rgba(255,255,255,0.6)', marginBottom: 4, fontWeight: active ? 700 : 400, fontSize: 15, textAlign: 'left', transition: 'all 0.18s' }}>
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>{icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {active && sidebarOpen && <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: COLORS.mint }} />}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'transparent', color: COLORS.blush, fontSize: 15, fontWeight: 500 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>
      <div style={{ flex: 1 }}>
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", background: C.surface, minHeight: '100vh', padding: '32px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <button onClick={() => navigate('/doctor-dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.slate, fontSize: 13, padding: 0 }}>← Dashboard</button>
              <span style={{ color: C.border }}>/</span>
              <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Prescriptions</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>Prescription Management</h1>
            <p style={{ margin: '6px 0 0', color: C.slate, fontSize: 14 }}>Issue digital prescriptions — patients can view them instantly</p>
          </div>
          <button onClick={() => setTab(tab === 'new' ? 'list' : 'new')} style={{ background: tab === 'new' ? '#F1F5F9' : C.navy, border: 'none', borderRadius: 12, padding: '11px 22px', color: tab === 'new' ? C.slate : 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {tab === 'new' ? '← Back to List' : '+ New Prescription'}
          </button>
        </div>
      </div>

      {/* Completed Video Consultations Section */}
      {completedAppointments.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>
              Completed Video Consultations
            </h2>
            <span style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700
            }}>
              {completedAppointments.length}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {completedAppointments.map(appt => (
              <div key={appt.id} style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                borderRadius: 18,
                padding: 22,
                border: `1.5px solid ${C.border}`,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setSelectedAppointment(appt)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,52,96,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = C.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = C.border;
              }}
              >
                {/* Accent bar at top */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: 'linear-gradient(90deg, #0F9B8E, #10B981)'
                }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0F9B8E, #10B981)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 16,
                        fontWeight: 700
                      }}>
                        {(appt.patient_name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 2, margin: 0 }}>
                          {appt.patient_name || 'Patient'}
                        </h3>
                        <p style={{ fontSize: 12, color: C.slate, margin: 0 }}>
                          {new Date(appt.scheduled_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span style={{
                    background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    color: '#059669',
                    padding: '5px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    border: '1px solid #A7F3D0',
                    whiteSpace: 'nowrap'
                  }}>
                    ✓ Completed
                  </span>
                </div>
                
                {appt.symptoms && (
                  <div style={{
                    background: '#F1F5F9',
                    padding: '10px 12px',
                    borderRadius: 10,
                    marginBottom: 16,
                    border: '1px solid #E2E8F0'
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.slate, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px 0' }}>
                      🩺 Symptoms
                    </p>
                    <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.5, margin: 0 }}>
                      {appt.symptoms}
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectForPrescription(appt);
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #0F9B8E, #0D8A7D)',
                      color: C.white,
                      border: 'none',
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(15,155,142,0.25)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,155,142,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,155,142,0.25)';
                    }}
                  >
                    💊 Add Prescription
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReports(appt);
                    }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #E8FAF8, #D5F5F0)',
                      color: C.accent,
                      border: '1.5px solid #B2EDE7',
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#D5F5F0';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #E8FAF8, #D5F5F0)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    📄 View Reports
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Issued', value: prescriptions.length, icon: '📋', bg: C.accentLight, color: C.accent },
          { label: 'This Month', value: prescriptions.filter(rx => { const d = new Date(rx.issued_at); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length, icon: '📅', bg: C.purpleLight, color: C.purple },
          { label: 'Unique Patients', value: new Set(prescriptions.map(rx => rx.patient_id)).size, icon: '👥', bg: C.goldLight, color: C.gold },
        ].map((s, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 16, padding: '18px 22px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: C.slate, marginTop: 3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#F1F5F9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[['list', '📋 All Prescriptions'], ['new', '✏️ New Prescription']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: tab === id ? 700 : 500, background: tab === id ? C.white : 'transparent', color: tab === id ? C.navy : C.slate, boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* List view */}
      {tab === 'list' && (
        <div>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.slate }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prescriptions by patient name..." style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, background: C.white, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ color: C.slate }}>Loading prescriptions...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: C.white, borderRadius: 20, border: `1px solid ${C.border}` }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>💊</div>
              <h3 style={{ margin: '0 0 8px', color: C.navy }}>No prescriptions yet</h3>
              <p style={{ color: C.slate, margin: '0 0 20px' }}>Issue your first prescription using the button above.</p>
              <button onClick={() => setTab('new')} style={{ background: C.navy, color: 'white', border: 'none', borderRadius: 12, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>+ New Prescription</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {filtered.map(rx => <PrescriptionCard key={rx.id} rx={rx} onView={setViewRx} />)}
            </div>
          )}
        </div>
      )}

      {/* New prescription form */}
      {tab === 'new' && (
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>✅</div>
              <h3 style={{ color: C.navy, margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Prescription Issued!</h3>
              <p style={{ color: C.slate, margin: 0 }}>The patient can now view this prescription in their portal.</p>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 28px', fontSize: 20, fontWeight: 800, color: C.navy, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>✏️</span> Issue New Prescription
              </h2>

              {/* Patient & Diagnosis */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Select Patient *</label>
                  <select value={form.patient_id} onChange={e => setForm(f => ({ ...f, patient_id: e.target.value }))} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: 'none', background: 'white', boxSizing: 'border-box' }}>
                    <option value="">-- Choose a patient --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name} (#{p.id})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Diagnosis</label>
                  <input value={form.diagnosis} onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))} placeholder="e.g. Upper respiratory tract infection" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              {/* Medications */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy }}>Medications</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: C.slate }}>Add all medications for this prescription</p>
                  </div>
                  <button onClick={addMed} style={{ background: C.accentLight, color: C.accent, border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>+ Add Medication</button>
                </div>
                {form.medications.map((med, i) => (
                  <MedRow key={i} med={med} idx={i} onChange={updateMed} onRemove={removeMed} />
                ))}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Doctor's Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Additional instructions, warnings, follow-up notes..." rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.navy, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button onClick={() => setTab('list')} style={{ background: '#F1F5F9', color: C.slate, border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSubmit} disabled={submitting || !form.patient_id || form.medications.some(m => !m.name)} style={{ background: submitting || !form.patient_id ? '#CBD5E1' : C.navy, color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {submitting ? '⏳ Issuing...' : '✅ Issue Prescription'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {viewRx && <PrescriptionModal rx={viewRx} onClose={() => setViewRx(null)} />}

      {/* Reports Modal */}
      {showReportsModal && selectedAppointment && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,52,96,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setShowReportsModal(false)}>
          <div style={{ background: C.white, borderRadius: 24, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', padding: 0 }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #1a5a8a 100%)`, padding: '28px 32px', borderRadius: '24px 24px 0 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📄</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white' }}>Patient Reports</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
                      {selectedAppointment.patient_name} · {new Date(selectedAppointment.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowReportsModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 12, width: 40, height: 40, cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '32px' }}>
              {loadingReports ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                  <p style={{ color: C.slate, fontSize: 15 }}>Loading reports...</p>
                </div>
              ) : appointmentReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36 }}>📋</div>
                  <h3 style={{ margin: '0 0 8px', color: C.navy, fontSize: 18 }}>No Reports Uploaded</h3>
                  <p style={{ color: C.slate, margin: 0, fontSize: 14 }}>The patient hasn't uploaded any reports for this consultation yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 16 }}>
                  {appointmentReports.map(report => {
                    const reportTypes = {
                      blood_test: { label: 'Blood Test', icon: '🩸', bg: '#FEF2F2', color: '#EF4444' },
                      xray: { label: 'X-Ray', icon: '🦴', bg: '#EEF2FF', color: '#6366F1' },
                      mri: { label: 'MRI Scan', icon: '🧲', bg: '#F5F3FF', color: '#7C3AED' },
                      ultrasound: { label: 'Ultrasound', icon: '📡', bg: '#ECFDF5', color: '#10B981' },
                      urine_test: { label: 'Urine Test', icon: '🧪', bg: '#FFF7ED', color: '#F59E0B' },
                      ct_scan: { label: 'CT Scan', icon: '🖥', bg: '#F0F9FF', color: '#0EA5E9' },
                      ecg: { label: 'ECG', icon: '💓', bg: '#FFF1F2', color: '#F43F5E' },
                      other: { label: 'Other Report', icon: '📄', bg: '#F8FAFC', color: '#64748B' },
                    };
                    const meta = reportTypes[report.report_type] || reportTypes.other;
                    const ext = (report.report_url || '').split('.').pop()?.toLowerCase();
                    const extColors = { pdf: { bg: '#FEF2F2', color: '#EF4444' }, jpg: { bg: '#DBEAFE', color: '#3B82F6' }, jpeg: { bg: '#DBEAFE', color: '#3B82F6' }, png: { bg: '#ECFDF5', color: '#10B981' } };
                    const ec = extColors[ext] || { bg: '#F1F5F9', color: '#475569' };

                    return (
                      <div key={report.id} style={{ 
                        background: '#F8FAFC', 
                        borderRadius: 16, 
                        border: `1.5px solid ${C.border}`, 
                        padding: '20px 24px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,52,96,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = C.border;
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          {/* Icon */}
                          <div style={{ 
                            width: 56, 
                            height: 56, 
                            borderRadius: 14, 
                            background: meta.bg, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: 26,
                            flexShrink: 0
                          }}>{meta.icon}</div>
                          
                          {/* Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{meta.label}</span>
                              <span style={{ background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>{meta.icon} {meta.label}</span>
                              {ext && <span style={{ background: ec.bg, color: ec.color, fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6 }}>{ext.toUpperCase()}</span>}
                              <span style={{ background: report.uploaded_by === 'patient' ? '#ECFDF5' : '#DBEAFE', color: report.uploaded_by === 'patient' ? '#10B981' : '#3B82F6', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>
                                {report.uploaded_by === 'patient' ? '👤 Patient Uploaded' : '👨‍⚕️ Doctor Added'}
                              </span>
                            </div>
                            
                            {report.description && (
                              <p style={{ margin: '0 0 10px', fontSize: 13, color: C.slate, lineHeight: 1.5 }}>
                                {report.description}
                              </p>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <span style={{ fontSize: 12, color: C.slate }}>
                                🕐 {new Date(report.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                            <a href={report.report_url} target="_blank" rel="noopener noreferrer" 
                               style={{ 
                                 background: C.navy, 
                                 color: 'white', 
                                 textDecoration: 'none', 
                                 borderRadius: 10, 
                                 padding: '9px 18px', 
                                 fontSize: 12, 
                                 fontWeight: 700,
                                 transition: 'all 0.15s',
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: 6
                               }}
                               onMouseEnter={(e) => e.target.style.background = '#1a5a8a'}
                               onMouseLeave={(e) => e.target.style.background = C.navy}>
                              View ↗
                            </a>
                            <a href={report.report_url} download 
                               style={{ 
                                 background: C.accentLight, 
                                 color: C.accent, 
                                 textDecoration: 'none', 
                                 borderRadius: 10, 
                                 padding: '9px 14px', 
                                 fontSize: 12, 
                                 fontWeight: 700,
                                 transition: 'all 0.15s',
                                 display: 'flex',
                                 alignItems: 'center'
                               }}
                               onMouseEnter={(e) => e.target.style.background = C.accentMid}
                               onMouseLeave={(e) => e.target.style.background = C.accentLight}>
                              ⬇ Download
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}