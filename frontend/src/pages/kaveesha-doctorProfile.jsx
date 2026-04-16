import React, { useState, useEffect } from 'react';

// ── Color Palette ────────────────────────────────────────────────────
const C = {
  navy:    '#184e77',
  teal:    '#34a0a4',
  mint:    '#76c893',
  cream:   '#f1faee',
  blush:   '#ffe5ec',
  navyDark:'#0f3352',
  tealDark:'#237a7d',
  mintDark:'#52a870',
  white:   '#ffffff',
  gray50:  '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray700: '#334155',
  gray900: '#0f172a',
  error:   '#e53e3e',
  success: '#059669',
};

// ── Inject global styles ─────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dp-root {
    font-family: 'DM Sans', sans-serif;
    color: ${C.gray900};
    background: ${C.gray50};
    min-height: 100vh;
  }

  .dp-root ::-webkit-scrollbar { width: 5px; height: 5px; }
  .dp-root ::-webkit-scrollbar-track { background: transparent; }
  .dp-root ::-webkit-scrollbar-thumb { background: ${C.gray200}; border-radius: 99px; }

  .dp-tab { transition: all 0.2s ease; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
  .dp-tab:hover { background: rgba(255,255,255,0.15) !important; color: white !important; }

  .dp-input {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid ${C.gray200}; background: ${C.white};
    font-size: 15px; font-family: 'DM Sans', sans-serif; color: ${C.gray900};
    transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .dp-input:focus { border-color: ${C.teal}; box-shadow: 0 0 0 3px ${C.teal}22; }
  .dp-input:disabled { background: ${C.gray100}; color: ${C.gray400}; cursor: not-allowed; }

  .dp-textarea {
    width: 100%; padding: 13px 16px; border-radius: 12px;
    border: 1.5px solid ${C.gray200}; background: ${C.white};
    font-size: 15px; font-family: 'DM Sans', sans-serif; color: ${C.gray900};
    resize: vertical; min-height: 100px; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .dp-textarea:focus { border-color: ${C.teal}; box-shadow: 0 0 0 3px ${C.teal}22; }

  .dp-btn-save {
    background: linear-gradient(135deg, ${C.navy} 0%, ${C.teal} 100%);
    color: white; border: none; border-radius: 12px;
    padding: 13px 32px; font-size: 15px; font-weight: 700;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.25s; letter-spacing: 0.2px;
  }
  .dp-btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${C.navy}44; }
  .dp-btn-save:disabled { background: ${C.gray200}; cursor: not-allowed; transform: none; box-shadow: none; }

  .dp-btn-edit {
    background: rgba(255,255,255,0.18); color: white;
    border: 1.5px solid rgba(255,255,255,0.35); border-radius: 12px;
    padding: 10px 22px; font-size: 14px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer;
    transition: all 0.2s; backdrop-filter: blur(4px);
  }
  .dp-btn-edit:hover { background: rgba(255,255,255,0.28); border-color: rgba(255,255,255,0.5); }

  .dp-btn-cancel {
    background: ${C.gray100}; color: ${C.gray500};
    border: 1.5px solid ${C.gray200}; border-radius: 12px;
    padding: 13px 24px; font-size: 15px; font-weight: 600;
    font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.2s;
  }
  .dp-btn-cancel:hover { background: ${C.gray200}; color: ${C.gray700}; }

  .dp-card {
    background: white; border-radius: 20px;
    border: 1px solid ${C.gray200};
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
    overflow: hidden;
  }

  .dp-fee-card { transition: all 0.2s; }
  .dp-fee-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

  .dp-doc-chip { transition: all 0.15s; }
  .dp-doc-chip:hover { transform: scale(1.02); }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .fade-up { animation: fadeUp 0.3s ease forwards; }

  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  .pulse-dot { animation: pulse 2s ease-in-out infinite; }
`;

// ── Mock doctor data ──────────────────────────────────────────────────
const MOCK_DOCTOR = {
  id: 'DOC-2024-0047',
  first_name: 'Arjuna',
  last_name: 'Wickramasinghe',
  email: 'arjuna.w@medconnect.lk',
  phone: '0771234567',
  date_of_birth: '1985-03-12',
  gender: 'male',
  specialty: 'Cardiology',
  sub_specialty: 'Interventional Cardiology',
  medical_license_number: 'SLMC-34521',
  license_issuing_authority: 'Sri Lanka Medical Council (SLMC)',
  years_of_experience: 14,
  hospital: 'Nawaloka Hospital',
  hospital_address: '23 Deshamanya H.K. Dharmadasa Mawatha, Colombo 00200',
  bio: 'Specialist cardiologist with 14 years of experience in interventional procedures. Committed to delivering patient-centered care with compassion and precision.',
  verification_status: 'approved',
  verified: true,
  consultation_fee_online: 2500,
  consultation_fee_physical: 4000,
  profile_photo_url: null,
  documents: {
    profile_photo: 'profile_arjuna.jpg',
    id_card_front: 'nic_front_arjuna.jpg',
    id_card_back: 'nic_back_arjuna.jpg',
    medical_license: 'slmc_license_arjuna.pdf',
    degree_certificates: 'mbbs_md_arjuna.pdf',
  },
};

// ── Sub-components ───────────────────────────────────────────────────

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: C.gray400 }}>
        {label}
      </span>
      <span style={{ fontSize: 17, fontWeight: 500, color: C.gray700, lineHeight: 1.5 }}>
        {value || <span style={{ color: C.gray400, fontStyle: 'italic', fontWeight: 300 }}>Not provided</span>}
      </span>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: `linear-gradient(135deg, ${C.navy}18, ${C.teal}18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 600, color: C.navy, fontFamily: "'Fraunces', serif" }}>{title}</h3>
    </div>
  );
}

function LockedBadge() {
  return (
    <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, background: C.navy + '10', borderRadius: 99, padding: '2px 9px' }}>
      <span style={{ fontSize: 9 }}>🔒</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: C.navy, letterSpacing: '0.5px' }}>LOCKED</span>
    </div>
  );
}

function Avatar({ doctor, size = 108 }) {
  const initials = `${doctor?.first_name?.[0] || ''}${doctor?.last_name?.[0] || ''}`.toUpperCase();
  if (doctor?.profile_photo_url) {
    return (
      <img
        src={doctor.profile_photo_url}
        alt="Profile"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.45)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,0.18)',
      border: '4px solid rgba(255,255,255,0.38)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: 700, color: 'white',
      fontFamily: "'Fraunces', serif", letterSpacing: 2,
      backdropFilter: 'blur(8px)',
    }}>
      {initials}
    </div>
  );
}

function DocChip({ icon, label, filename }) {
  return (
    <div className="dp-doc-chip" style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: C.cream, border: `1.5px solid ${C.mint}55`,
      borderRadius: 14, padding: '15px 18px',
    }}>
      <div style={{
        width: 46, height: 46, borderRadius: 12, flexShrink: 0,
        background: `linear-gradient(135deg, ${C.teal}18, ${C.mint}18)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12.5, color: C.gray400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {filename || 'Not uploaded'}
        </div>
      </div>
      {filename && (
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: C.mint + '30', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke={C.mintDark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────
export default function KaveeshaDoctorProfile({ doctor: propDoctor, onRefresh, token }) {
  const [doctor, setDoctor] = useState(propDoctor || MOCK_DOCTOR);
  const [activeSection, setActiveSection] = useState('info');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (propDoctor) setDoctor(propDoctor);
  }, [propDoctor]);

  useEffect(() => {
    if (doctor) {
      setForm({
        phone: doctor.phone || '',
        bio: doctor.bio || '',
        hospital_address: doctor.hospital_address || '',
        sub_specialty: doctor.sub_specialty || '',
        consultation_fee_online: doctor.consultation_fee_online || '',
        consultation_fee_physical: doctor.consultation_fee_physical || '',
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('consultation_fee')) {
      setForm(f => ({ ...f, [name]: value.replace(/\D/g, '') }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (token) {
        const res = await fetch('/api/doctors/me/profile', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setDoctor(prev => ({ ...prev, ...updated }));
        }
      } else {
        await new Promise(r => setTimeout(r, 700));
        setDoctor(prev => ({ ...prev, ...form }));
      }
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3500);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    // reset form to current doctor state
    setForm({
      phone: doctor.phone || '',
      bio: doctor.bio || '',
      hospital_address: doctor.hospital_address || '',
      sub_specialty: doctor.sub_specialty || '',
      consultation_fee_online: doctor.consultation_fee_online || '',
      consultation_fee_physical: doctor.consultation_fee_physical || '',
    });
  };

  if (!doctor) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80, color: C.gray400, fontSize: 18 }}>
      <span className="spin" style={{ fontSize: 32 }}>⟳</span>
    </div>
  );

  const TABS = [
    { id: 'info',         label: 'Personal Info',     icon: '👤' },
    { id: 'professional', label: 'Professional',      icon: '🩺' },
    { id: 'fees',         label: 'Consultation Fees', icon: '💳' },
    { id: 'documents',    label: 'Documents',         icon: '📄' },
  ];

  const dob = doctor.date_of_birth
    ? new Date(doctor.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const age = doctor.date_of_birth
    ? Math.floor((Date.now() - new Date(doctor.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <>
      <style>{STYLES}</style>
      <div className="dp-root">

        {/* ── Hero ──────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(140deg, ${C.navyDark} 0%, ${C.navy} 40%, ${C.teal} 100%)`,
          padding: '36px 40px 0', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(118,200,147,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 30, left: '30%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,229,236,0.07)', pointerEvents: 'none' }} />

          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {/* Avatar with status dot */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <Avatar doctor={doctor} size={110} />
              {doctor.verified && (
                <div style={{
                  position: 'absolute', bottom: 4, right: 4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: C.mint, border: '3px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Name block */}
            <div style={{ flex: 1, minWidth: 200, paddingBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 36, color: 'white', letterSpacing: '-0.5px', lineHeight: 1 }}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </h1>
                {doctor.verification_status === 'approved' && (
                  <div style={{
                    background: 'rgba(118,200,147,0.2)', border: '1px solid rgba(118,200,147,0.45)',
                    borderRadius: 99, padding: '5px 13px',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: C.mint }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.mint, letterSpacing: '0.8px' }}>VERIFIED</span>
                  </div>
                )}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: 17, fontWeight: 300, marginBottom: 12 }}>
                {doctor.specialty}{doctor.sub_specialty ? ` · ${doctor.sub_specialty}` : ''}
              </p>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {[
                  { icon: '🏥', text: doctor.hospital },
                  { icon: '✉️', text: doctor.email },
                  { icon: '🩺', text: `${doctor.years_of_experience} yrs exp.` },
                ].map(({ icon, text }) => text && (
                  <span key={text} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.58)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {icon} {text}
                  </span>
                ))}
              </div>
            </div>

            {/* Edit / Cancel button top right */}
            {activeSection !== 'documents' && (
              <div style={{ paddingBottom: 10 }}>
                {editing ? (
                  <button className="dp-btn-edit" onClick={cancelEdit}>✕ Cancel</button>
                ) : (
                  <button className="dp-btn-edit" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
                )}
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div style={{ display: 'flex', gap: 4, marginTop: 28, position: 'relative', zIndex: 1, overflowX: 'auto' }}>
            {TABS.map(tab => {
              const active = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  className="dp-tab"
                  onClick={() => { setActiveSection(tab.id); setEditing(false); }}
                  style={{
                    padding: '12px 24px', borderRadius: '12px 12px 0 0',
                    fontSize: 15, fontWeight: active ? 700 : 500,
                    background: active ? 'white' : 'transparent',
                    color: active ? C.navy : 'rgba(255,255,255,0.65)',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    boxShadow: active ? '0 -4px 20px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span style={{ marginRight: 8 }}>{tab.icon}</span>{tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────── */}
        <div style={{ padding: '32px 40px 64px', maxWidth: 960, margin: '0 auto' }}>

          {/* Success banner */}
          {saveSuccess && (
            <div className="fade-up" style={{
              background: C.success + '15', border: `1.5px solid ${C.success}40`,
              borderRadius: 14, padding: '14px 22px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span style={{ color: C.success, fontWeight: 600, fontSize: 16 }}>Profile updated successfully!</span>
            </div>
          )}

          {/* ══ PERSONAL INFO ══ */}
          {activeSection === 'info' && (
            <div className="fade-up">
              {/* Bio */}
              <div className="dp-card" style={{ padding: '30px 34px', marginBottom: 22 }}>
                <SectionHeader icon="💬" title="About Me" />
                {editing ? (
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: C.gray700, display: 'block', marginBottom: 8 }}>Bio / Professional Summary</label>
                    <textarea
                      name="bio" value={form.bio} onChange={handleChange}
                      className="dp-textarea"
                      placeholder="Share your background, approach, and expertise with patients..."
                    />
                  </div>
                ) : (
                  <p style={{ fontSize: 17, color: C.gray500, lineHeight: 1.9, fontWeight: 300 }}>
                    {doctor.bio || <span style={{ color: C.gray400, fontStyle: 'italic' }}>No bio added yet. Click "Edit Profile" to add one.</span>}
                  </p>
                )}
              </div>

              {/* Personal details */}
              <div className="dp-card" style={{ padding: '30px 34px', marginBottom: 22 }}>
                <SectionHeader icon="👤" title="Personal Details" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28, marginBottom: 4 }}>
                  <InfoRow label="Full Name" value={`Dr. ${doctor.first_name} ${doctor.last_name}`} />
                  <InfoRow label="Email Address" value={doctor.email} />
                  <InfoRow label="Date of Birth" value={dob ? `${dob}  (Age ${age})` : null} />
                  <InfoRow label="Gender" value={doctor.gender ? doctor.gender.charAt(0).toUpperCase() + doctor.gender.slice(1) : null} />
                  {editing ? (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: C.gray400, display: 'block', marginBottom: 8 }}>Phone Number</label>
                      <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="dp-input" placeholder="0771234567" />
                      <p style={{ fontSize: 12, color: C.gray400, marginTop: 5 }}>10 digits only</p>
                    </div>
                  ) : (
                    <InfoRow label="Phone Number" value={doctor.phone} />
                  )}
                </div>
                <div style={{ marginTop: 22, padding: '13px 18px', background: C.navy + '07', border: `1px solid ${C.navy}15`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ fontSize: 13.5, color: C.gray500 }}>
                    Name, email, date of birth, and gender are verified fields and cannot be changed. Contact support for amendments.
                  </span>
                </div>
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="dp-btn-cancel" onClick={cancelEdit}>Cancel</button>
                  <button className="dp-btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spin" style={{ marginRight: 6 }}>⟳</span>Saving…</> : '✓ Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ PROFESSIONAL ══ */}
          {activeSection === 'professional' && (
            <div className="fade-up">
              <div className="dp-card" style={{ padding: '30px 34px', marginBottom: 22 }}>
                <SectionHeader icon="🩺" title="Medical Credentials" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28, marginBottom: 28 }}>
                  {/* Locked */}
                  <div>
                    <InfoRow label="Medical License Number" value={doctor.medical_license_number} />
                    <LockedBadge />
                  </div>
                  <div>
                    <InfoRow label="Issuing Authority" value={doctor.license_issuing_authority} />
                    <LockedBadge />
                  </div>
                  <div>
                    <InfoRow label="Specialty" value={doctor.specialty} />
                    <LockedBadge />
                  </div>
                  <div>
                    <InfoRow label="Years of Experience" value={doctor.years_of_experience ? `${doctor.years_of_experience} years` : null} />
                    <LockedBadge />
                  </div>
                  {/* Editable sub-specialty */}
                  {editing ? (
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: C.gray400, display: 'block', marginBottom: 8 }}>Sub-Specialty</label>
                      <input type="text" name="sub_specialty" value={form.sub_specialty} onChange={handleChange} className="dp-input" placeholder="e.g. Interventional Cardiology" />
                    </div>
                  ) : (
                    <InfoRow label="Sub-Specialty" value={doctor.sub_specialty} />
                  )}
                </div>

                <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 28 }}>
                  <SectionHeader icon="🏥" title="Workplace" />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 28 }}>
                    <div>
                      <InfoRow label="Hospital / Workplace" value={doctor.hospital} />
                      <LockedBadge />
                    </div>
                    {editing ? (
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: C.gray400, display: 'block', marginBottom: 8 }}>Workplace Address</label>
                        <input type="text" name="hospital_address" value={form.hospital_address} onChange={handleChange} className="dp-input" placeholder="Full address" />
                      </div>
                    ) : (
                      <InfoRow label="Workplace Address" value={doctor.hospital_address} />
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 24, padding: '13px 18px', background: C.navy + '07', border: `1px solid ${C.navy}15`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>🔒</span>
                  <span style={{ fontSize: 13.5, color: C.gray500 }}>
                    License number, issuing authority, specialty, experience, and primary workplace are verified and locked. Sub-specialty and address can be updated.
                  </span>
                </div>
              </div>

              {editing && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="dp-btn-cancel" onClick={cancelEdit}>Cancel</button>
                  <button className="dp-btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? <><span className="spin" style={{ marginRight: 6 }}>⟳</span>Saving…</> : '✓ Save Changes'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ FEES ══ */}
          {activeSection === 'fees' && (
            <div className="fade-up">
              {/* Fee display */}
              {!editing && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 26 }}>
                  <div className="dp-fee-card dp-card" style={{ padding: '32px', textAlign: 'center', borderTop: `4px solid ${C.teal}` }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.teal + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 30 }}>💻</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: C.gray400, marginBottom: 10 }}>Online Consultation</div>
                    <div style={{ fontSize: 44, fontWeight: 700, color: C.navy, fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                      {doctor.consultation_fee_online
                        ? `LKR ${Number(doctor.consultation_fee_online).toLocaleString()}`
                        : <span style={{ fontSize: 24, color: C.gray400, fontFamily: "'DM Sans', sans-serif" }}>Not set</span>}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, color: C.gray400 }}>per session · video call</div>
                  </div>
                  <div className="dp-fee-card dp-card" style={{ padding: '32px', textAlign: 'center', borderTop: `4px solid ${C.mint}` }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.mint + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: 30 }}>🏥</div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: C.gray400, marginBottom: 10 }}>Physical Consultation</div>
                    <div style={{ fontSize: 44, fontWeight: 700, color: C.navy, fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                      {doctor.consultation_fee_physical
                        ? `LKR ${Number(doctor.consultation_fee_physical).toLocaleString()}`
                        : <span style={{ fontSize: 24, color: C.gray400, fontFamily: "'DM Sans', sans-serif" }}>Not set</span>}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, color: C.gray400 }}>per session · in-person</div>
                  </div>
                </div>
              )}

              <div className="dp-card" style={{ padding: '30px 34px' }}>
                <SectionHeader icon="💳" title="Update Consultation Fees" />
                <p style={{ color: C.gray400, fontSize: 15, marginBottom: 28, marginTop: -14, lineHeight: 1.7 }}>
                  Set your fees for online and in-person consultations. These amounts are shown to patients before booking.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 22 }}>
                  {/* Online fee */}
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: C.navy, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                      💻 Online Consultation Fee
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.gray400, fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>LKR</span>
                      <input
                        type="text" name="consultation_fee_online"
                        value={editing ? form.consultation_fee_online : (doctor.consultation_fee_online || '')}
                        onChange={handleChange} disabled={!editing}
                        className="dp-input" placeholder="2500"
                        style={{ paddingLeft: 54 }}
                      />
                    </div>
                    <p style={{ fontSize: 12.5, color: C.gray400, marginTop: 6 }}>Video call session fee in Sri Lankan Rupees</p>
                  </div>
                  {/* Physical fee */}
                  <div>
                    <label style={{ fontSize: 14, fontWeight: 700, color: C.navy, display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                      🏥 Physical Consultation Fee
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.gray400, fontSize: 14, fontWeight: 600, pointerEvents: 'none' }}>LKR</span>
                      <input
                        type="text" name="consultation_fee_physical"
                        value={editing ? form.consultation_fee_physical : (doctor.consultation_fee_physical || '')}
                        onChange={handleChange} disabled={!editing}
                        className="dp-input" placeholder="4000"
                        style={{ paddingLeft: 54 }}
                      />
                    </div>
                    <p style={{ fontSize: 12.5, color: C.gray400, marginTop: 6 }}>In-person visit fee in Sri Lankan Rupees</p>
                  </div>
                </div>

                <div style={{ padding: '14px 18px', background: C.cream, borderRadius: 12, border: `1px solid ${C.mint}40`, marginBottom: 22 }}>
                  <p style={{ fontSize: 13.5, color: C.gray500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💡</span>
                    <span>Platform charges are deducted from collected fees. Net payouts are deposited within 3–5 business days after each session.</span>
                  </p>
                </div>

                {!editing ? (
                  <button className="dp-btn-save" onClick={() => setEditing(true)}>✏️ Update Fees</button>
                ) : (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="dp-btn-cancel" onClick={cancelEdit}>Cancel</button>
                    <button className="dp-btn-save" onClick={handleSave} disabled={saving}>
                      {saving ? <><span className="spin" style={{ marginRight: 6 }}>⟳</span>Saving…</> : '✓ Save Fees'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ DOCUMENTS ══ */}
          {activeSection === 'documents' && (
            <div className="fade-up">
              <div className="dp-card" style={{ padding: '30px 34px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 26 }}>
                  <div>
                    <SectionHeader icon="📄" title="Verification Documents" />
                    <p style={{ color: C.gray400, fontSize: 15, marginTop: -18, lineHeight: 1.7 }}>
                      Documents submitted during registration for identity and credential verification.
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
                    background: doctor.verification_status === 'approved' ? C.success + '10' : '#F59E0B10',
                    border: `1.5px solid ${doctor.verification_status === 'approved' ? C.success + '40' : '#F59E0B40'}`,
                    borderRadius: 14, padding: '12px 18px',
                  }}>
                    <span style={{ fontSize: 22 }}>{doctor.verification_status === 'approved' ? '✅' : '⏳'}</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', color: doctor.verification_status === 'approved' ? C.success : '#B45309' }}>
                        {doctor.verification_status === 'approved' ? 'ALL VERIFIED' : 'UNDER REVIEW'}
                      </div>
                      <div style={{ fontSize: 12.5, color: C.gray400, marginTop: 2 }}>
                        {doctor.verification_status === 'approved' ? 'Admin approved' : 'Processing…'}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  <DocChip icon="📷" label="Profile Photo" filename={doctor.documents?.profile_photo} />
                  <DocChip icon="🪪" label="National ID (Front)" filename={doctor.documents?.id_card_front} />
                  <DocChip icon="🪪" label="National ID (Back)" filename={doctor.documents?.id_card_back} />
                  <DocChip icon="📜" label="Medical License" filename={doctor.documents?.medical_license} />
                  <DocChip icon="🎓" label="Degree Certificate" filename={doctor.documents?.degree_certificates} />
                </div>

                <div style={{
                  marginTop: 24, padding: '13px 18px',
                  background: C.blush, border: `1px solid #f8c8d4`, borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ fontSize: 18 }}>🔒</span>
                  <span style={{ fontSize: 13.5, color: C.navy }}>
                    Uploaded documents are locked after submission and reviewed by our admin team. To replace or update any document, please contact MedConnect support.
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}