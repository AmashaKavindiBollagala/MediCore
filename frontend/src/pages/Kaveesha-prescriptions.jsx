import React, { useState, useEffect, useRef } from 'react';
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
  const token = localStorage.getItem('token');
  const [tab, setTab] = useState('list');
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [viewRx, setViewRx] = useState(null);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Form state
  const [form, setForm] = useState({
    patient_id: '',
    diagnosis: '',
    notes: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
  });

  useEffect(() => { fetchData(); }, []);

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
    </div>
  );
}