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
          <input value={med.name} onChange={e => onChange(idx, 'name', e.target.value)} placeholder="e.g. Amoxicillin 500mg" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dosage *</label>
          <input value={med.dosage} onChange={e => onChange(idx, 'dosage', e.target.value)} placeholder="e.g. 500mg, 1 tablet" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Frequency</label>
          <select value={med.frequency} onChange={e => onChange(idx, 'frequency', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#000000', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
            <option value="" style={{ color: '#000000' }}>Select...</option>
            {FREQ_OPTIONS.map(f => <option key={f} style={{ color: '#000000' }}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</label>
          <select value={med.duration} onChange={e => onChange(idx, 'duration', e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#000000', outline: 'none', background: 'white', boxSizing: 'border-box' }}>
            <option value="" style={{ color: '#000000' }}>Select...</option>
            {DURATION_OPTIONS.map(d => <option key={d} style={{ color: '#000000' }}>{d}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.slate, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Instructions</label>
          <input value={med.instructions} onChange={e => onChange(idx, 'instructions', e.target.value)} placeholder="e.g. Take with water" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, color: '#000000', outline: 'none', boxSizing: 'border-box' }} />
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
  const [appointmentPrescriptions, setAppointmentPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentsWithPrescriptions, setAppointmentsWithPrescriptions] = useState(() => {
    // Load from localStorage on initial render
    try {
      const stored = localStorage.getItem('appointmentsWithPrescriptions');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [finishedConsultations, setFinishedConsultations] = useState(() => {
    // Load from localStorage on initial render
    try {
      const stored = localStorage.getItem('finishedConsultations');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [consultationSearch, setConsultationSearch] = useState('');

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
        
        // Load prescriptions for ALL completed appointments in PARALLEL
        const prescriptionsSet = new Set();
        const finishedSet = new Set();
        
        const prescriptionChecks = completed.map(async (appt) => {
          try {
            const rxResponse = await fetch(`/api/doctors/me/prescriptions/appointment/${appt.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (rxResponse.ok) {
              const rxData = await rxResponse.json();
              if (rxData.length > 0) {
                prescriptionsSet.add(appt.id);
                
                // Check if ANY prescription for this appointment has is_finished = TRUE
                const hasFinished = rxData.some(rx => rx.is_finished === true);
                if (hasFinished) {
                  finishedSet.add(appt.id);
                }
              }
            }
          } catch (err) {
            console.error(`Error loading prescriptions for appointment ${appt.id}:`, err);
          }
        });
        
        // Wait for all checks to complete in parallel
        await Promise.all(prescriptionChecks);
        
        // Save to localStorage for persistence
        localStorage.setItem('appointmentsWithPrescriptions', JSON.stringify([...prescriptionsSet]));
        setAppointmentsWithPrescriptions(prescriptionsSet);
        
        // ONLY use database is_finished status, not localStorage
        setFinishedConsultations(finishedSet);
        localStorage.setItem('finishedConsultations', JSON.stringify([...finishedSet]));
      }
    } catch (err) {
      console.error('Error fetching completed appointments:', err);
    }
  };

  const handleSelectForPrescription = async (appt) => {
    setSelectedAppointment(appt);
    setShowPrescriptionForm(true);
    
    // CRITICAL: Clear editing state when starting a new prescription
    setEditingPrescription(null);
    
    // Load existing prescriptions for this appointment
    setLoadingPrescriptions(true);
    try {
      const response = await fetch(`/api/doctors/me/prescriptions/appointment/${appt.id}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointmentPrescriptions(data);
      } else {
        setAppointmentPrescriptions([]);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setAppointmentPrescriptions([]);
    } finally {
      setLoadingPrescriptions(false);
    }
    
    // Reset form to create mode
    setForm({
      patient_id: appt.patient_id,
      diagnosis: appt.symptoms || '',
      notes: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleClosePrescriptionForm = () => {
    setShowPrescriptionForm(false);
    setEditingPrescription(null);
    setSelectedAppointment(null);
    setAppointmentPrescriptions([]);
  };

  const handleMarkFinished = async (appt) => {
    try {
      // Call API to mark as finished in database
      const response = await fetch(`/api/doctors/me/prescriptions/appointment/${appt.id}/finish`, {
        method: 'PATCH',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Update local state
        setFinishedConsultations(prev => {
          const newSet = new Set(prev);
          newSet.add(appt.id);
          // Persist to localStorage as backup
          localStorage.setItem('finishedConsultations', JSON.stringify([...newSet]));
          return newSet;
        });
        
        // Show success notification
        setSuccessMessage('✅ Consultation marked as finished successfully!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } else {
        const errorText = await response.text();
        alert('❌ Failed to mark as finished: ' + errorText);
      }
    } catch (error) {
      console.error('Error marking as finished:', error);
      alert('❌ Failed to mark as finished. Please try again.');
    }
  };

  const handleViewPrescription = async (appt) => {
    setSelectedAppointment(appt);
    
    // Load existing prescriptions for this appointment BEFORE showing the modal
    setLoadingPrescriptions(true);
    try {
      const response = await fetch(`/api/doctors/me/prescriptions/appointment/${appt.id}?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointmentPrescriptions(data);
        
        // If there's at least one prescription, load the first one for editing
        if (data.length > 0) {
          const firstRx = data[0];
          setEditingPrescription(firstRx);
          const meds = firstRx.prescription_data?.medications || [];
          setForm({
            patient_id: firstRx.patient_id,
            diagnosis: firstRx.diagnosis || '',
            notes: firstRx.notes || '',
            medications: meds.length > 0 ? meds : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
          });
        } else {
          // No prescriptions - reset to create mode
          setEditingPrescription(null);
          setForm({
            patient_id: appt.patient_id,
            diagnosis: appt.symptoms || '',
            notes: '',
            medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
          });
        }
      } else {
        setAppointmentPrescriptions([]);
        setEditingPrescription(null);
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setAppointmentPrescriptions([]);
      setEditingPrescription(null);
    } finally {
      setLoadingPrescriptions(false);
    }
    
    // NOW show the modal after state is set
    setShowPrescriptionForm(true);
  };

  const handleViewReports = async (appt) => {
    console.log('🔍 View Reports clicked for appointment:', appt.id);
    const apiUrl = `/api/doctors/me/reports/appointment/${appt.id}?t=${Date.now()}`;
    console.log('🔍 Fetching URL:', apiUrl);
    
    setSelectedAppointment(appt);
    setLoadingReports(true);
    setShowReportsModal(true);
    
    try {
      const response = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reports loaded:', data.length, 'reports', data);
        setAppointmentReports(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load reports:', response.status, errorText);
        setAppointmentReports([]);
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      setAppointmentReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDownloadReport = async (reportUrl, reportType) => {
    try {
      console.log('📥 Downloading report:', reportUrl);
      
      // Fetch the file as a blob
      const response = await fetch(reportUrl);
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      
      // Extract file extension from URL
      const ext = reportUrl.split('.').pop()?.split('?')[0] || 'pdf';
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType || 'report'}_${new Date().getTime()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Download started');
    } catch (error) {
      console.error('❌ Download failed:', error);
      // Fallback: open in new tab
      window.open(reportUrl, '_blank');
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
          appointment_id: selectedAppointment?.id,
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

  const handleModalSubmit = async () => {
    if (!selectedAppointment || !form.patient_id || form.medications.some(m => !m.name)) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('🔵 Submitting prescription...');
    console.log('🔵 URL:', '/api/doctors/me/prescriptions');
    console.log('🔵 Token:', token ? token.substring(0, 20) + '...' : 'NONE');
    console.log('🔵 Body:', JSON.stringify({
      appointment_id: selectedAppointment.id,
      patient_id: form.patient_id,
      diagnosis: form.diagnosis,
      notes: form.notes,
      prescription_data: { medications: form.medications },
    }, null, 2));
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/doctors/me/prescriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: selectedAppointment.id,
          patient_id: form.patient_id,
          diagnosis: form.diagnosis,
          notes: form.notes,
          prescription_data: { medications: form.medications },
        }),
      });
      
      console.log('🔵 Response status:', res.status);
      const responseText = await res.text();
      console.log('🔵 Response body:', responseText);
      
      if (res.ok) {
        const responseData = JSON.parse(responseText);
        // Track that this appointment now has a prescription and save to localStorage
        setAppointmentsWithPrescriptions(prev => {
          const newSet = new Set([...prev, selectedAppointment.id]);
          localStorage.setItem('appointmentsWithPrescriptions', JSON.stringify([...newSet]));
          return newSet;
        });
        
        // Reload prescriptions for this appointment
        const response = await fetch(`/api/doctors/me/prescriptions/appointment/${selectedAppointment.id}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppointmentPrescriptions(data);
        }
        
        // Reset form
        setForm({
          patient_id: selectedAppointment.patient_id,
          diagnosis: selectedAppointment.symptoms || '',
          notes: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
        
        // Show success message
        setSuccessMessage('✅ Prescription issued successfully!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } else {
        alert('❌ Failed to issue prescription: ' + responseText);
      }
    } catch (error) {
      console.error('Error submitting prescription:', error);
      alert('❌ Failed to issue prescription. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPrescription = (rx) => {
    setEditingPrescription(rx);
    const meds = rx.prescription_data?.medications || [];
    setForm({
      patient_id: rx.patient_id,
      diagnosis: rx.diagnosis || '',
      notes: rx.notes || '',
      medications: meds.length > 0 ? meds : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleDeletePrescription = async (rxId) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;
    
    console.log('🔴 Deleting prescription:', rxId);
    console.log('🔴 URL:', `/api/doctors/me/prescriptions/${rxId}`);
    
    try {
      const res = await fetch(`/api/doctors/me/prescriptions/${rxId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('🔴 Response status:', res.status);
      const responseText = await res.text();
      console.log('🔴 Response body:', responseText);
      
      if (res.ok) {
        // Reload prescriptions
        const response = await fetch(`/api/doctors/me/prescriptions/appointment/${selectedAppointment.id}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppointmentPrescriptions(data);
          
          // If no prescriptions left, reset form to allow creating new one
          if (data.length === 0) {
            console.log('✅ All prescriptions deleted, resetting to create mode');
            // Force state updates immediately
            setEditingPrescription(null);
            setForm({
              patient_id: selectedAppointment.patient_id,
              diagnosis: selectedAppointment.symptoms || '',
              notes: '',
              medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
            });
            
            // Remove from appointmentsWithPrescriptions set so card turns green and save to localStorage
            setAppointmentsWithPrescriptions(prev => {
              const newSet = new Set(prev);
              newSet.delete(selectedAppointment.id);
              localStorage.setItem('appointmentsWithPrescriptions', JSON.stringify([...newSet]));
              console.log('✅ Removed appointment from prescriptions set:', selectedAppointment.id);
              return newSet;
            });
          } else if (editingPrescription?.id === rxId) {
            // If we deleted the prescription being edited, switch to first available
            console.log('✅ Switching to first available prescription');
            const firstRx = data[0];
            setEditingPrescription(firstRx);
            const meds = firstRx.prescription_data?.medications || [];
            setForm({
              patient_id: firstRx.patient_id,
              diagnosis: firstRx.diagnosis || '',
              notes: firstRx.notes || '',
              medications: meds.length > 0 ? meds : [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
            });
          }
        }
        
        setSuccessMessage('🗑️ Prescription deleted successfully!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } else {
        alert('❌ Failed to delete prescription: ' + responseText);
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('❌ Failed to delete prescription: ' + error.message);
    }
  };

  const handleUpdatePrescription = async () => {
    if (!editingPrescription || !form.patient_id || form.medications.some(m => !m.name)) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('🟡 Updating prescription:', editingPrescription.id);
    console.log('🟡 URL:', `/api/doctors/me/prescriptions/${editingPrescription.id}`);
    console.log('🟡 Body:', JSON.stringify({
      prescription_data: { medications: form.medications },
      notes: form.notes,
      diagnosis: form.diagnosis
    }, null, 2));
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/doctors/me/prescriptions/${editingPrescription.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prescription_data: { medications: form.medications },
          notes: form.notes,
          diagnosis: form.diagnosis
        }),
      });
      
      console.log('🟡 Response status:', res.status);
      const responseText = await res.text();
      console.log('🟡 Response body:', responseText);
      
      if (res.ok) {
        // Reload prescriptions
        const response = await fetch(`/api/doctors/me/prescriptions/appointment/${selectedAppointment.id}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAppointmentPrescriptions(data);
        }
        
        setEditingPrescription(null);
        setSuccessMessage('✏️ Prescription updated successfully!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
        
        // Reset form
        setForm({
          patient_id: selectedAppointment.patient_id,
          diagnosis: selectedAppointment.symptoms || '',
          notes: '',
          medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
        });
      } else {
        alert('❌ Failed to update prescription: ' + responseText);
      }
    } catch (error) {
      console.error('Error updating prescription:', error);
      alert('❌ Failed to update prescription: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    return !q || (rx.patient_name || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Success Notification */}
      {showSuccessNotification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: 16,
          padding: '20px 28px',
          boxShadow: '0 12px 40px rgba(16,185,129,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          maxWidth: 420,
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
            animation: 'pulse 2s infinite'
          }}>
            ✓
          </div>
          <div>
            <p style={{ 
              margin: 0, 
              fontSize: 16, 
              fontWeight: 700, 
              color: 'white',
              lineHeight: 1.4
            }}>
              {successMessage}
            </p>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: 13, 
              color: 'rgba(255,255,255,0.9)',
              fontWeight: 500
            }}>
              Prescription saved to database
            </p>
          </div>
        </div>
      )}
      <aside style={{
        width: sidebarOpen ? 260 : 78,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        background: COLORS.navy,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: '4px 0 24px rgba(24,78,119,0.15)',
        zIndex: 100,
      }}>
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
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { localStorage.clear(); navigate('/login'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '11px 14px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              background: 'transparent',
              color: '#FFB3C6',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'all 0.18s ease',
              fontFamily: "'DM Sans', sans-serif",
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#FFB3C6';
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
            <p style={{ margin: '6px 0 0', color: C.slate, fontSize: 14 }}>Manage prescriptions for completed video consultations</p>
          </div>
        </div>
      </div>

      {/* Completed Video Consultations Section */}
      {completedAppointments.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
                {completedAppointments.filter(appt => !finishedConsultations.has(appt.id)).length}
              </span>
            </div>
            
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: 320 }}>
              <svg 
                style={{ 
                  position: 'absolute', 
                  left: 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  pointerEvents: 'none',
                  color: C.slate
                }} 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search by patient name or symptoms..."
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  borderRadius: 12,
                  border: `2px solid ${C.border}`,
                  fontSize: 14,
                  color: '#000000',
                  outline: 'none',
                  background: 'white',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = C.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${C.accentLight}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = C.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {consultationSearch && (
                <button
                  onClick={() => setConsultationSearch('')}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    color: C.slate,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {completedAppointments
              .filter(appt => !finishedConsultations.has(appt.id))
              .filter(appt => {
                if (!consultationSearch) return true;
                const searchLower = consultationSearch.toLowerCase();
                const patientName = (appt.patient_name || '').toLowerCase();
                const symptoms = (appt.symptoms || '').toLowerCase();
                return patientName.includes(searchLower) || symptoms.includes(searchLower);
              })
              .map(appt => {
              const isFinished = finishedConsultations.has(appt.id);
              const hasPrescription = appointmentsWithPrescriptions.has(appt.id);
              
              return (
              <div key={appt.id} style={{
                background: isFinished
                  ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                  : hasPrescription 
                    ? 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)'
                    : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
                borderRadius: 18,
                padding: 22,
                border: `1.5px solid ${isFinished ? '#93C5FD' : hasPrescription ? '#FDBA74' : C.border}`,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isFinished
                  ? '0 2px 8px rgba(59,130,246,0.15)'
                  : hasPrescription 
                    ? '0 2px 8px rgba(251,146,60,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => setSelectedAppointment(appt)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isFinished
                  ? '0 8px 24px rgba(59,130,246,0.25)'
                  : hasPrescription
                    ? '0 8px 24px rgba(251,146,60,0.25)'
                    : '0 8px 24px rgba(15,52,96,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = isFinished ? '#60A5FA' : hasPrescription ? '#F97316' : C.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isFinished
                  ? '0 2px 8px rgba(59,130,246,0.15)'
                  : hasPrescription
                    ? '0 2px 8px rgba(251,146,60,0.15)'
                    : '0 2px 8px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = isFinished ? '#93C5FD' : hasPrescription ? '#FDBA74' : C.border;
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
                    ? 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                    : hasPrescription
                      ? 'linear-gradient(90deg, #F97316, #FB923C)'
                      : 'linear-gradient(90deg, #0F9B8E, #10B981)'
                }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: isFinished
                          ? 'linear-gradient(135deg, #3B82F6, #60A5FA)'
                          : hasPrescription
                            ? 'linear-gradient(135deg, #F97316, #FB923C)'
                            : 'linear-gradient(135deg, #0F9B8E, #10B981)',
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                    <span style={{
                      background: hasPrescription 
                        ? 'linear-gradient(135deg, #FFF7ED, #FFEDD5)'
                        : 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                      color: hasPrescription ? '#EA580C' : '#059669',
                      padding: '5px 12px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      border: `1px solid ${hasPrescription ? '#FED7AA' : '#A7F3D0'}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {hasPrescription ? '💊 Prescription Issued' : '✓ Completed'}
                    </span>
                  </div>
                </div>
                
                {appt.symptoms && (
                  <div style={{
                    background: hasPrescription ? '#FEF3C7' : '#F1F5F9',
                    padding: '10px 12px',
                    borderRadius: 10,
                    marginBottom: 16,
                    border: `1px solid ${hasPrescription ? '#FDE68A' : '#E2E8F0'}`
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
                  {hasPrescription && !isFinished ? (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPrescription(appt);
                        }}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #F97316, #EA580C)',
                          color: C.white,
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(249,115,22,0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(249,115,22,0.3)';
                        }}
                      >
                        👁️ View Prescription
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkFinished(appt);
                        }}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                          color: C.white,
                          border: 'none',
                          padding: '10px 14px',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
                        }}
                      >
                        ✅ Mark as Finished
                      </button>
                    </>
                  ) : isFinished ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPrescription(appt);
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        color: C.white,
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
                      }}
                    >
                      👁️ View Prescription (Finished)
                    </button>
                  ) : (
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
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReports(appt);
                    }}
                    style={{
                      flex: 1,
                      background: hasPrescription 
                        ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                        : 'linear-gradient(135deg, #E8FAF8, #D5F5F0)',
                      color: hasPrescription ? '#D97706' : C.accent,
                      border: `1.5px solid ${hasPrescription ? '#FCD34D' : '#B2EDE7'}`,
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = hasPrescription ? '#FDE68A' : '#D5F5F0';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = hasPrescription 
                        ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                        : 'linear-gradient(135deg, #E8FAF8, #D5F5F0)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    📄 View Reports
                  </button>
                </div>
              </div>
            );
              })}
            
            {/* No Results Message */}
            {completedAppointments.filter(appt => !finishedConsultations.has(appt.id)).filter(appt => {
              if (!consultationSearch) return true;
              const searchLower = consultationSearch.toLowerCase();
              const patientName = (appt.patient_name || '').toLowerCase();
              const symptoms = (appt.symptoms || '').toLowerCase();
              return patientName.includes(searchLower) || symptoms.includes(searchLower);
            }).length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: 18,
                border: `2px dashed ${C.border}`
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
                  No consultations found
                </h3>
                <p style={{ fontSize: 14, color: C.slate, margin: 0 }}>
                  Try adjusting your search for "{consultationSearch}"
                </p>
                <button
                  onClick={() => setConsultationSearch('')}
                  style={{
                    marginTop: 16,
                    background: C.accent,
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Finished Consultations Section */}
      {completedAppointments.filter(appt => finishedConsultations.has(appt.id)).length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>
                Finished Consultations
              </h2>
              <span style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700
              }}>
                {completedAppointments.filter(appt => finishedConsultations.has(appt.id)).length}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            {completedAppointments
              .filter(appt => finishedConsultations.has(appt.id))
              .filter(appt => {
                if (!consultationSearch) return true;
                const searchLower = consultationSearch.toLowerCase();
                const patientName = (appt.patient_name || '').toLowerCase();
                const symptoms = (appt.symptoms || '').toLowerCase();
                return patientName.includes(searchLower) || symptoms.includes(searchLower);
              })
              .map(appt => {
                const hasPrescription = appointmentsWithPrescriptions.has(appt.id);
                
                return (
                <div key={appt.id} style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  borderRadius: 18,
                  padding: 22,
                  border: '1.5px solid #93C5FD',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => setSelectedAppointment(appt)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#60A5FA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#93C5FD';
                }}
                >
                  {/* Accent bar at top */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #3B82F6, #60A5FA)'
                  }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <span style={{
                        background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                        color: '#2563EB',
                        padding: '5px 12px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        border: '1px solid #93C5FD',
                        whiteSpace: 'nowrap'
                      }}>
                        ✅ Finished
                      </span>
                      {hasPrescription && (
                        <span style={{
                          background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
                          color: '#EA580C',
                          padding: '5px 12px',
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          border: '1px solid #FED7AA',
                          whiteSpace: 'nowrap'
                        }}>
                          💊 Prescription Issued
                        </span>
                      )}
                    </div>
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
                        handleViewPrescription(appt);
                      }}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                        color: C.white,
                        border: 'none',
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 8px rgba(59,130,246,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(59,130,246,0.3)';
                      }}
                    >
                      👁️ View Prescription
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReports(appt);
                      }}
                      style={{
                        flex: 1,
                        background: hasPrescription 
                          ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                          : 'linear-gradient(135deg, #E8FAF8, #D5F5F0)',
                        color: hasPrescription ? '#D97706' : C.accent,
                        border: `1.5px solid ${hasPrescription ? '#FCD34D' : '#B2EDE7'}`,
                        padding: '10px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = hasPrescription ? '#FDE68A' : '#D5F5F0';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = hasPrescription 
                          ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)'
                          : 'linear-gradient(135deg, #E8FAF8, #D5F5F0)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      📄 View Reports
                    </button>
                  </div>
                </div>
              );
              })}
            
            {/* No Results Message for Finished */}
            {completedAppointments.filter(appt => finishedConsultations.has(appt.id)).filter(appt => {
              if (!consultationSearch) return true;
              const searchLower = consultationSearch.toLowerCase();
              const patientName = (appt.patient_name || '').toLowerCase();
              const symptoms = (appt.symptoms || '').toLowerCase();
              return patientName.includes(searchLower) || symptoms.includes(searchLower);
            }).length === 0 && (
              <div style={{ 
                gridColumn: '1 / -1',
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'white',
                borderRadius: 18,
                border: `2px dashed ${C.border}`
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
                  No finished consultations found
                </h3>
                <p style={{ fontSize: 14, color: C.slate, margin: 0 }}>
                  Try adjusting your search for "{consultationSearch}"
                </p>
                <button
                  onClick={() => setConsultationSearch('')}
                  style={{
                    marginTop: 16,
                    background: C.accent,
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {viewRx && <PrescriptionModal rx={viewRx} onClose={() => setViewRx(null)} />}

      {/* Reports Modal */}
      {showReportsModal && selectedAppointment && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15,52,96,0.7)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: 24,
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setShowReportsModal(false)}>
          <div style={{ 
            background: C.white, 
            borderRadius: 28, 
            width: '100%', 
            maxWidth: 950, 
            maxHeight: '90vh', 
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(15,52,96,0.3)',
            animation: 'slideUp 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ 
              background: `linear-gradient(135deg, ${C.navy} 0%, #1a5a8a 50%, ${C.teal} 100%)`, 
              padding: '32px 36px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    borderRadius: 18, 
                    background: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 32,
                    border: '2px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}>📄</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Patient Reports</h2>
                    <p style={{ margin: '6px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      {selectedAppointment.patient_name} · {new Date(selectedAppointment.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    {appointmentReports.length > 0 && (
                      <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{appointmentReports.length} report{appointmentReports.length !== 1 ? 's' : ''} available</span>
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowReportsModal(false)} 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)', 
                    color: 'white', 
                    borderRadius: 14, 
                    width: 44, 
                    height: 44, 
                    cursor: 'pointer', 
                    fontSize: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontWeight: 300
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >×</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ 
              padding: '32px 36px',
              overflow: 'auto',
              flex: 1
            }}>
              {loadingReports ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${C.accentLight}, ${C.accentMid})`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 24px',
                    fontSize: 36,
                    animation: 'pulse 2s infinite'
                  }}>⏳</div>
                  <p style={{ color: C.slate, fontSize: 16, fontWeight: 600, margin: 0 }}>Loading reports...</p>
                </div>
              ) : appointmentReports.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, #F1F5F9, #E2E8F0)`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 24px', 
                    fontSize: 48,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                  }}>📋</div>
                  <h3 style={{ margin: '0 0 10px', color: C.navy, fontSize: 20, fontWeight: 700 }}>No Reports Uploaded</h3>
                  <p style={{ color: C.slate, margin: 0, fontSize: 15, lineHeight: 1.6 }}>The patient hasn't uploaded any reports for this consultation yet.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 18 }}>
                  {appointmentReports.map((report, index) => {
                    const reportTypes = {
                      blood_test: { label: 'Blood Test', icon: '🩸', gradient: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', color: '#EF4444' },
                      xray: { label: 'X-Ray', icon: '🦴', gradient: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', color: '#6366F1' },
                      mri: { label: 'MRI Scan', icon: '🧲', gradient: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', color: '#7C3AED' },
                      ultrasound: { label: 'Ultrasound', icon: '📡', gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', color: '#10B981' },
                      urine_test: { label: 'Urine Test', icon: '🧪', gradient: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', color: '#F59E0B' },
                      ct_scan: { label: 'CT Scan', icon: '🖥', gradient: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', color: '#0EA5E9' },
                      ecg: { label: 'ECG', icon: '💓', gradient: 'linear-gradient(135deg, #FFF1F2, #FFE4E6)', color: '#F43F5E' },
                      other: { label: 'Other Report', icon: '📄', gradient: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)', color: '#64748B' },
                    };
                    const meta = reportTypes[report.report_type] || reportTypes.other;
                    const ext = (report.report_url || '').split('.').pop()?.split('?')[0]?.toLowerCase();
                    const extColors = { 
                      pdf: { bg: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)', color: '#DC2626', icon: '📕' }, 
                      jpg: { bg: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', color: '#2563EB', icon: '🖼️' }, 
                      jpeg: { bg: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', color: '#2563EB', icon: '🖼️' }, 
                      png: { bg: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', color: '#059669', icon: '🖼️' }
                    };
                    const ec = extColors[ext] || { bg: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', color: '#475569', icon: '📄' };

                    return (
                      <div key={report.id} style={{ 
                        background: '#FFFFFF', 
                        borderRadius: 20, 
                        border: '2px solid #E2E8F0', 
                        padding: '24px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = C.accent;
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,52,96,0.12)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                          {/* Left: Report Type Icon */}
                          <div style={{ 
                            width: 68, 
                            height: 68, 
                            borderRadius: 16, 
                            background: meta.gradient, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: 32,
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            border: '2px solid rgba(255,255,255,0.5)'
                          }}>{meta.icon}</div>
                          
                          {/* Middle: Details */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                              <span style={{ fontSize: 17, fontWeight: 700, color: C.navy }}>{meta.label}</span>
                              {ext && (
                                <span style={{ 
                                  background: ec.bg, 
                                  color: ec.color, 
                                  fontSize: 10, 
                                  fontWeight: 800, 
                                  padding: '4px 10px', 
                                  borderRadius: 8,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>{ec.icon} {ext.toUpperCase()}</span>
                              )}
                              <span style={{ 
                                background: report.uploaded_by === 'patient' ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', 
                                color: report.uploaded_by === 'patient' ? '#059669' : '#2563EB', 
                                fontSize: 10, 
                                fontWeight: 700, 
                                padding: '4px 10px', 
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                {report.uploaded_by === 'patient' ? '👤 Patient' : '👨‍⚕️ Doctor'}
                              </span>
                            </div>
                            
                            {report.description && (
                              <p style={{ 
                                margin: '0 0 12px', 
                                fontSize: 14, 
                                color: '#475569', 
                                lineHeight: 1.6,
                                padding: '10px 14px',
                                background: '#F8FAFC',
                                borderRadius: 12,
                                border: '1px solid #E2E8F0'
                              }}>
                                {report.description}
                              </p>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                                🕐 {new Date(report.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span style={{ color: '#CBD5E1' }}>•</span>
                              <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                                {new Date(report.uploaded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          
                          {/* Right: Actions */}
                          <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexDirection: 'column' }}>
                            <button 
                              onClick={() => window.open(report.report_url, '_blank')}
                              style={{ 
                                background: `linear-gradient(135deg, ${C.navy}, #1a5a8a)`, 
                                color: 'white', 
                                border: 'none',
                                borderRadius: 12, 
                                padding: '10px 18px', 
                                fontSize: 12, 
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                boxShadow: '0 4px 12px rgba(15,52,96,0.2)'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.05)';
                                e.target.style.boxShadow = '0 6px 16px rgba(15,52,96,0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 4px 12px rgba(15,52,96,0.2)';
                              }}>
                              👁️ View
                            </button>
                            <button
                              onClick={() => handleDownloadReport(report.report_url, meta.label)}
                              style={{ 
                                background: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', 
                                color: C.navy, 
                                border: '2px solid #CBD5E1',
                                borderRadius: 12, 
                                padding: '10px 18px', 
                                fontSize: 12, 
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #E2E8F0, #CBD5E1)';
                                e.target.style.borderColor = C.navy;
                                e.target.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.background = 'linear-gradient(135deg, #F1F5F9, #E2E8F0)';
                                e.target.style.borderColor = '#CBD5E1';
                                e.target.style.transform = 'scale(1)';
                              }}>
                              ⬇️ Download
                            </button>
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

      {/* Prescription Modal */}
      {showPrescriptionForm && selectedAppointment && (
        <div key={`prescription-modal-${editingPrescription?.id || 'new'}`} style={{ 
          position: 'fixed', 
          inset: 0, 
          background: 'rgba(15,52,96,0.7)', 
          backdropFilter: 'blur(8px)',
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'flex-start', 
          justifyContent: 'center', 
          padding: '40px 24px',
          overflow: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={handleClosePrescriptionForm}>
          <div style={{ 
            background: C.white, 
            borderRadius: 28, 
            width: '100%', 
            maxWidth: 1100,
            boxShadow: '0 25px 60px rgba(15,52,96,0.3)',
            animation: 'slideUp 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 80px)'
          }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ 
              background: `linear-gradient(135deg, ${C.navy} 0%, #1a5a8a 50%, ${C.teal} 100%)`, 
              padding: '28px 36px',
              position: 'relative',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -80, left: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: 16, 
                    background: 'rgba(255,255,255,0.15)', 
                    backdropFilter: 'blur(10px)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 30,
                    border: '2px solid rgba(255,255,255,0.2)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                  }}>💊</div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Issue Prescription</h2>
                    <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                      {selectedAppointment.patient_name} · {new Date(selectedAppointment.scheduled_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleClosePrescriptionForm} 
                  style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)', 
                    color: 'white', 
                    borderRadius: 14, 
                    width: 44, 
                    height: 44, 
                    cursor: 'pointer', 
                    fontSize: 24, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    fontWeight: 300
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >×</button>
              </div>
            </div>

            {/* Content */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: appointmentPrescriptions.length > 0 ? '1fr 380px' : '1fr',
              overflow: 'hidden',
              flex: 1
            }}>
              {/* Left: Prescription Form */}
              <div style={{ 
                padding: '32px 36px',
                overflow: 'auto',
                borderRight: appointmentPrescriptions.length > 0 ? '2px solid #E2E8F0' : 'none'
              }}>
                {editingPrescription ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                    padding: '14px 18px',
                    borderRadius: 12,
                    marginBottom: 24,
                    border: '2px solid #FCD34D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20 }}>✏️</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                          Editing Prescription
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#A16207' }}>
                          Created on {new Date(editingPrescription.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    {appointmentPrescriptions.length > 0 && (
                      <button
                        onClick={() => {
                          setEditingPrescription(null);
                          setForm({
                            patient_id: selectedAppointment.patient_id,
                            diagnosis: selectedAppointment.symptoms || '',
                            notes: '',
                            medications: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
                          });
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: 'white',
                          border: 'none',
                          padding: '8px 14px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        ➕ Add Another
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #DCFCE7, #BBF7D0)',
                    padding: '14px 18px',
                    borderRadius: 12,
                    marginBottom: 24,
                    border: '2px solid #86EFAC',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span style={{ fontSize: 20 }}>💊</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#166534' }}>
                        Create New Prescription
                      </p>
                      <p style={{ margin: '2px 0 0 0', fontSize: 11, color: '#15803D' }}>
                        Fill in the medication details below
                      </p>
                    </div>
                  </div>
                )}
                {/* Patient Info */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
                  padding: '18px 22px',
                  borderRadius: 16,
                  marginBottom: 28,
                  border: '2px solid #BAE6FD'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>👤</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Patient Information</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Name</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.navy }}>{selectedAppointment.patient_name}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Date</p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.navy }}>
                        {new Date(selectedAppointment.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
                    🩺 Diagnosis / Symptoms <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea 
                    value={form.diagnosis}
                    onChange={(e) => setForm({...form, diagnosis: e.target.value})}
                    placeholder="Enter diagnosis or symptoms..."
                    rows={3}
                    style={{ 
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '2px solid #E2E8F0',
                      fontSize: 14,
                      color: C.navy,
                      background: '#F8FAFC',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.accent}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>

                {/* Medications */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                      💊 Medications <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      onClick={addMed}
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      + Add Medication
                    </button>
                  </div>

                  <div style={{ display: 'grid', gap: 16 }}>
                    {form.medications.map((med, idx) => (
                      <div key={idx} style={{ 
                        background: '#F8FAFC',
                        borderRadius: 16,
                        padding: 20,
                        border: '2px solid #E2E8F0',
                        position: 'relative',
                        animation: 'slideIn 0.3s ease-out'
                      }}>
                        {form.medications.length > 1 && (
                          <button
                            onClick={() => removeMed(idx)}
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              background: '#FEE2E2',
                              color: '#EF4444',
                              border: 'none',
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              fontSize: 16,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#FECACA'}
                            onMouseLeave={(e) => e.target.style.background = '#FEE2E2'}
                          >×</button>
                        )}

                        <div style={{ display: 'grid', gap: 14 }}>
                          {/* Medication Name */}
                          <div>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              💊 Medication Name <span style={{ color: '#EF4444' }}>*</span>
                            </label>
                            <input 
                              value={med.name}
                              onChange={(e) => updateMed(idx, 'name', e.target.value)}
                              placeholder="e.g., Amoxicillin 500mg"
                              style={{ 
                                width: '100%',
                                padding: '12px 14px',
                                borderRadius: 10,
                                border: '2px solid #E2E8F0',
                                fontSize: 14,
                                color: C.navy,
                                background: 'white',
                                outline: 'none',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                boxSizing: 'border-box'
                              }}
                              onFocus={(e) => e.target.style.borderColor = C.accent}
                              onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                          </div>
                          
                          {/* Dosage and Frequency */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                💉 Dosage <span style={{ color: '#EF4444' }}>*</span>
                              </label>
                              <select 
                                value={med.dosage}
                                onChange={(e) => updateMed(idx, 'dosage', e.target.value)}
                                style={{ 
                                  width: '100%',
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: '2px solid #E2E8F0',
                                  fontSize: 13,
                                  color: med.dosage ? C.navy : '#94A3B8',
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box',
                                  cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = C.accent}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              >
                                <option value="">Select dosage...</option>
                                <optgroup label="Tablets/Capsules">
                                  <option value="250mg">250mg</option>
                                  <option value="500mg">500mg</option>
                                  <option value="750mg">750mg</option>
                                  <option value="1000mg">1000mg (1g)</option>
                                  <option value="1 tablet">1 tablet</option>
                                  <option value="2 tablets">2 tablets</option>
                                  <option value="1 capsule">1 capsule</option>
                                  <option value="2 capsules">2 capsules</option>
                                </optgroup>
                                <optgroup label="Liquid/Syrup">
                                  <option value="5ml">5ml</option>
                                  <option value="10ml">10ml</option>
                                  <option value="15ml">15ml</option>
                                  <option value="20ml">20ml</option>
                                  <option value="1 teaspoon">1 teaspoon (5ml)</option>
                                  <option value="2 teaspoons">2 teaspoons (10ml)</option>
                                  <option value="1 tablespoon">1 tablespoon (15ml)</option>
                                </optgroup>
                                <optgroup label="Injections">
                                  <option value="1ml">1ml</option>
                                  <option value="2ml">2ml</option>
                                  <option value="5ml">5ml</option>
                                </optgroup>
                                <optgroup label="Topical">
                                  <option value="Apply thin layer">Apply thin layer</option>
                                  <option value="Apply sparingly">Apply sparingly</option>
                                  <option value="1 drop">1 drop</option>
                                  <option value="2 drops">2 drops</option>
                                </optgroup>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                🕐 Frequency
                              </label>
                              <select 
                                value={med.frequency}
                                onChange={(e) => updateMed(idx, 'frequency', e.target.value)}
                                style={{ 
                                  width: '100%',
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: '2px solid #E2E8F0',
                                  fontSize: 13,
                                  color: med.frequency ? C.navy : '#94A3B8',
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box',
                                  cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = C.accent}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              >
                                <option value="">Select frequency...</option>
                                <optgroup label="Daily">
                                  <option value="Once daily">Once daily (OD)</option>
                                  <option value="Twice daily">Twice daily (BD)</option>
                                  <option value="Three times daily">Three times daily (TDS)</option>
                                  <option value="Four times daily">Four times daily (QDS)</option>
                                </optgroup>
                                <optgroup label="Time-based">
                                  <option value="Every 4 hours">Every 4 hours</option>
                                  <option value="Every 6 hours">Every 6 hours</option>
                                  <option value="Every 8 hours">Every 8 hours</option>
                                  <option value="Every 12 hours">Every 12 hours</option>
                                  <option value="Every 24 hours">Every 24 hours</option>
                                </optgroup>
                                <optgroup label="Meal-related">
                                  <option value="Before meals">Before meals (AC)</option>
                                  <option value="After meals">After meals (PC)</option>
                                  <option value="With meals">With meals</option>
                                  <option value="On empty stomach">On empty stomach</option>
                                </optgroup>
                                <optgroup label="Special">
                                  <option value="As needed">As needed (PRN)</option>
                                  <option value="At bedtime">At bedtime (HS)</option>
                                  <option value="Once weekly">Once weekly</option>
                                  <option value="Stat dose">Stat dose (immediately)</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>
                          
                          {/* Duration and Instructions */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                📅 Duration
                              </label>
                              <select 
                                value={med.duration}
                                onChange={(e) => updateMed(idx, 'duration', e.target.value)}
                                style={{ 
                                  width: '100%',
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: '2px solid #E2E8F0',
                                  fontSize: 13,
                                  color: med.duration ? C.navy : '#94A3B8',
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box',
                                  cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = C.accent}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              >
                                <option value="">Select duration...</option>
                                <optgroup label="Days">
                                  <option value="1 day">1 day</option>
                                  <option value="3 days">3 days</option>
                                  <option value="5 days">5 days</option>
                                  <option value="7 days">7 days</option>
                                  <option value="10 days">10 days</option>
                                  <option value="14 days">14 days (2 weeks)</option>
                                </optgroup>
                                <optgroup label="Weeks">
                                  <option value="1 week">1 week</option>
                                  <option value="2 weeks">2 weeks</option>
                                  <option value="3 weeks">3 weeks</option>
                                  <option value="4 weeks">4 weeks (1 month)</option>
                                  <option value="6 weeks">6 weeks</option>
                                  <option value="8 weeks">8 weeks (2 months)</option>
                                </optgroup>
                                <optgroup label="Months">
                                  <option value="1 month">1 month</option>
                                  <option value="2 months">2 months</option>
                                  <option value="3 months">3 months</option>
                                  <option value="6 months">6 months</option>
                                  <option value="9 months">9 months</option>
                                  <option value="12 months">12 months (1 year)</option>
                                </optgroup>
                                <optgroup label="Special">
                                  <option value="Single dose">Single dose</option>
                                  <option value="Continue until reviewed">Continue until reviewed</option>
                                  <option value="Ongoing">Ongoing</option>
                                </optgroup>
                              </select>
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                📝 Instructions
                              </label>
                              <input 
                                value={med.instructions}
                                onChange={(e) => updateMed(idx, 'instructions', e.target.value)}
                                placeholder="e.g., Take with food"
                                style={{ 
                                  width: '100%',
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: '2px solid #E2E8F0',
                                  fontSize: 13,
                                  color: C.navy,
                                  background: 'white',
                                  outline: 'none',
                                  transition: 'all 0.2s',
                                  boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = C.accent}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
                    📝 Additional Notes
                  </label>
                  <textarea 
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                    placeholder="Any additional notes or instructions..."
                    rows={2}
                    style={{ 
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '2px solid #E2E8F0',
                      fontSize: 14,
                      color: C.navy,
                      background: '#F8FAFC',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = C.accent}
                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={editingPrescription ? handleUpdatePrescription : handleModalSubmit}
                  disabled={isSubmitting || form.medications.some(m => !m.name)}
                  style={{
                    width: '100%',
                    background: isSubmitting || form.medications.some(m => !m.name) 
                      ? '#CBD5E1' 
                      : editingPrescription
                        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                        : 'linear-gradient(135deg, #0F9B8E, #0D8A7D)',
                    color: 'white',
                    border: 'none',
                    padding: '16px 24px',
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: isSubmitting || form.medications.some(m => !m.name) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: isSubmitting || form.medications.some(m => !m.name) ? 'none' : '0 8px 24px rgba(15,155,142,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting && !form.medications.some(m => !m.name)) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 32px rgba(15,155,142,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = isSubmitting || form.medications.some(m => !m.name) ? 'none' : '0 8px 24px rgba(15,155,142,0.3)';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ 
                        width: 20, 
                        height: 20, 
                        border: '3px solid rgba(255,255,255,0.3)', 
                        borderTop: '3px solid white', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                      {editingPrescription ? 'Updating...' : 'Issuing...'}
                    </>
                  ) : (
                    <>{editingPrescription ? '✏️ Update Prescription' : '💊 Issue Prescription'}</>
                  )}
                </button>
              </div>

              {/* Right: Existing Prescriptions */}
              {appointmentPrescriptions.length > 0 && (
                <div style={{ 
                  padding: '32px 28px',
                  overflow: 'auto',
                  background: '#F8FAFC'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 20 }}>📋</span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>Prescriptions</h3>
                    <span style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700
                    }}>
                      {appointmentPrescriptions.length}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gap: 16 }}>
                    {loadingPrescriptions ? (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <div style={{ 
                          width: 40, 
                          height: 40, 
                          border: '4px solid #E2E8F0', 
                          borderTop: '4px solid #10B981', 
                          borderRadius: '50%', 
                          animation: 'spin 1s linear infinite',
                          margin: '0 auto 12px'
                        }} />
                        <p style={{ color: C.slate, fontSize: 13, margin: 0 }}>Loading...</p>
                      </div>
                    ) : (
                      appointmentPrescriptions.map((rx, idx) => {
                        const meds = rx.prescription_data?.medications || [];
                        const isEditing = editingPrescription?.id === rx.id;
                        return (
                          <div key={rx.id} style={{ 
                            background: isEditing ? '#FEF3C7' : 'white',
                            borderRadius: 16,
                            padding: 20,
                            border: isEditing ? '2px solid #FCD34D' : '2px solid #E2E8F0',
                            animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                              <div style={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: 10, 
                                background: isEditing ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'linear-gradient(135deg, #10B981, #059669)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 14
                              }}>{isEditing ? '✏️' : '✓'}</div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.navy }}>Prescription #{idx + 1}</p>
                                <p style={{ margin: 0, fontSize: 11, color: C.slate }}>
                                  {new Date(rx.issued_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {isEditing && (
                                <span style={{
                                  background: '#F59E0B',
                                  color: 'white',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontSize: 9,
                                  fontWeight: 700
                                }}>EDITING</span>
                              )}
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                  onClick={() => handleEditPrescription(rx)}
                                  style={{
                                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePrescription(rx.id)}
                                  style={{
                                    background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 4
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>

                            <div style={{ display: 'grid', gap: 10 }}>
                              {meds.map((med, medIdx) => (
                                <div key={medIdx} style={{ 
                                  background: '#F0FDF4',
                                  padding: '12px 14px',
                                  borderRadius: 10,
                                  border: '1px solid #BBF7D0'
                                }}>
                                  <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: '#059669' }}>{med.name}</p>
                                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    {med.dosage && <span style={{ fontSize: 11, color: '#475569' }}>💊 {med.dosage}</span>}
                                    {med.frequency && <span style={{ fontSize: 11, color: '#475569' }}>🕐 {med.frequency}</span>}
                                    {med.duration && <span style={{ fontSize: 11, color: '#475569' }}>📅 {med.duration}</span>}
                                  </div>
                                  {med.instructions && (
                                    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#64748B', fontStyle: 'italic' }}>
                                      📝 {med.instructions}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>

                            {rx.notes && (
                              <div style={{ 
                                marginTop: 12,
                                padding: '10px 12px',
                                background: '#FEF3C7',
                                borderRadius: 8,
                                border: '1px solid #FDE68A'
                              }}>
                                <p style={{ margin: 0, fontSize: 11, color: '#92400E', lineHeight: 1.5 }}>
                                  📝 {rx.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
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