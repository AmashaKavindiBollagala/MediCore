import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const SPECIALTIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Practice', 'Neurology', 'Obstetrics & Gynecology', 'Oncology',
  'Ophthalmology', 'Orthopedics', 'Pediatrics', 'Psychiatry',
  'Pulmonology', 'Radiology', 'Rheumatology', 'Surgery', 'Urology',
];

const STEPS = ['Personal Info', 'Professional Info', 'Documents', 'Review'];

const InputField = ({ label, error, children, required }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#184E77', marginBottom: 6 }}>
      {label} {required && <span style={{ color: '#FFE5EC' }}>*</span>}
    </label>
    {children}
    {error && <p style={{ marginTop: 4, fontSize: 12, color: '#FFE5EC' }}>{error}</p>}
  </div>
);

const inputStyle = (hasError) => ({
  width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
  border: `1.5px solid ${hasError ? '#FFE5EC' : '#34A0A4'}`,
  background: '#F1FAEE', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
  fontFamily: "'DM Sans', sans-serif",
});

export default function KaveeshaDoctorRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    specialty: '', sub_specialty: '', hospital: '',
    medical_license_number: '', years_of_experience: '',
    bio: '', consultation_fee_online: '', consultation_fee_physical: '',
  });

  const [files, setFiles] = useState({
    profile_photo: null, id_card: null, medical_license: null, medical_id: null,
  });

  const [filePreviews, setFilePreviews] = useState({});
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (key) => (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFiles((f) => ({ ...f, [key]: file }));
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviews((p) => ({ ...p, [key]: url }));
    } else {
      setFilePreviews((p) => ({ ...p, [key]: 'pdf' }));
    }
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.first_name.trim()) e.first_name = 'Required';
      if (!form.last_name.trim()) e.last_name = 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
      if (!/^[\d\s\+\-\(\)]{7,15}$/.test(form.phone)) e.phone = 'Valid phone required';
    }
    if (step === 1) {
      if (!form.specialty) e.specialty = 'Required';
      if (!form.hospital.trim()) e.hospital = 'Required';
      if (!form.medical_license_number.trim()) e.medical_license_number = 'Required';
      if (!form.years_of_experience) e.years_of_experience = 'Required';
    }
    if (step === 2) {
      if (!files.profile_photo) e.profile_photo = 'Profile photo required';
      if (!files.id_card) e.id_card = 'ID card required';
      if (!files.medical_license) e.medical_license = 'Medical license required';
      if (!files.medical_id) e.medical_id = 'Medical ID required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setServerErrors([]);

    const token = localStorage.getItem('token');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    Object.entries(files).forEach(([k, v]) => { if (v) fd.append(k, v); });

    try {
      const res = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setServerErrors(data.errors || [data.error || 'Registration failed']);
        setStep(0);
      } else {
        setSuccess(true);
      }
    } catch {
      setServerErrors(['Network error. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #184E77 0%, #34A0A4 50%, #76C893 100%)' }}>
        <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#184E77', fontFamily: "'Playfair Display', serif", marginBottom: 12 }}>Registration Submitted!</h2>
          <p style={{ color: '#6B7280', lineHeight: 1.6, marginBottom: 28 }}>Your doctor profile is under review. Our admin team will verify your documents and activate your account within 24-48 hours.</p>
          <button onClick={() => navigate('/login')} style={{ background: 'linear-gradient(135deg, #184E77, #76C893)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #184E77 0%, #34A0A4 50%, #76C893 100%)', display: 'flex' }}>

      {/* Left Panel */}
      <div style={{ display: 'none', width: '40%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, position: 'relative' }}
        className="lg-panel">
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '2px solid white', width: 120 + i * 90, height: 120 + i * 90, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.4 - i * 0.07 }} />
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 1, color: 'white', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 700, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Join as a Doctor</h1>
          <p style={{ opacity: 0.8, fontSize: 16, marginBottom: 40 }}>Start helping patients today</p>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderRadius: 16, background: step === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', marginBottom: 10, backdropFilter: 'blur(8px)', transition: 'background 0.3s' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: step > i ? '#67C090' : step === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{ fontWeight: step === i ? 600 : 400, opacity: step === i ? 1 : 0.7 }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel / Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.97)', borderRadius: 28, padding: '36px 36px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#184E77', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#184E77', fontFamily: "'Playfair Display', serif" }}>MediCore</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#184E77', fontFamily: "'Playfair Display', serif", margin: 0 }}>Doctor Registration</h2>
            <p style={{ color: '#34A0A4', fontSize: 13, marginTop: 4 }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
          </div>

          {/* Step progress bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? '#184E77' : '#34A0A4', transition: 'background 0.3s' }} />
            ))}
          </div>

          {/* Server errors */}
          {serverErrors.length > 0 && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
              {serverErrors.map((e, i) => <p key={i} style={{ color: '#DC2626', fontSize: 13, margin: '2px 0' }}>• {e}</p>)}
            </div>
          )}

          {/* ── Step 0: Personal Info ── */}
          {step === 0 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField label="First Name" required error={errors.first_name}>
                  <input value={form.first_name} onChange={set('first_name')} placeholder="Kaveesha" style={inputStyle(errors.first_name)} />
                </InputField>
                <InputField label="Last Name" required error={errors.last_name}>
                  <input value={form.last_name} onChange={set('last_name')} placeholder="Perera" style={inputStyle(errors.last_name)} />
                </InputField>
              </div>
              <InputField label="Email Address" required error={errors.email}>
                <input type="email" value={form.email} onChange={set('email')} placeholder="doctor@example.com" style={inputStyle(errors.email)} />
              </InputField>
              <InputField label="Phone Number" required error={errors.phone}>
                <input value={form.phone} onChange={set('phone')} placeholder="+94 71 234 5678" style={inputStyle(errors.phone)} />
              </InputField>
            </div>
          )}

          {/* ── Step 1: Professional Info ── */}
          {step === 1 && (
            <div>
              <InputField label="Specialty" required error={errors.specialty}>
                <select value={form.specialty} onChange={set('specialty')} style={{ ...inputStyle(errors.specialty), appearance: 'none' }}>
                  <option value="">Select specialty...</option>
                  {SPECIALTIES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </InputField>
              <InputField label="Sub-Specialty (optional)" error={errors.sub_specialty}>
                <input value={form.sub_specialty} onChange={set('sub_specialty')} placeholder="e.g. Interventional Cardiology" style={inputStyle()} />
              </InputField>
              <InputField label="Hospital / Clinic" required error={errors.hospital}>
                <input value={form.hospital} onChange={set('hospital')} placeholder="e.g. Colombo National Hospital" style={inputStyle(errors.hospital)} />
              </InputField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField label="Medical License No." required error={errors.medical_license_number}>
                  <input value={form.medical_license_number} onChange={set('medical_license_number')} placeholder="SLMC-XXXXX" style={inputStyle(errors.medical_license_number)} />
                </InputField>
                <InputField label="Years of Experience" required error={errors.years_of_experience}>
                  <input type="number" min="0" max="60" value={form.years_of_experience} onChange={set('years_of_experience')} placeholder="5" style={inputStyle(errors.years_of_experience)} />
                </InputField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <InputField label="Online Consultation Fee (LKR)">
                  <input type="number" min="0" value={form.consultation_fee_online} onChange={set('consultation_fee_online')} placeholder="1500" style={inputStyle()} />
                </InputField>
                <InputField label="Physical Visit Fee (LKR)">
                  <input type="number" min="0" value={form.consultation_fee_physical} onChange={set('consultation_fee_physical')} placeholder="2000" style={inputStyle()} />
                </InputField>
              </div>
              <InputField label="Short Bio (optional)">
                <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell patients about your experience and approach..." style={{ ...inputStyle(), resize: 'vertical', minHeight: 80 }} />
              </InputField>
            </div>
          )}

          {/* ── Step 2: Documents ── */}
          {step === 2 && (
            <div>
              <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Upload clear photos or scanned PDFs. Files must be under 5MB each. Accepted: JPG, PNG, PDF.
              </p>
              {[
                { key: 'profile_photo', label: 'Profile Photo', icon: '👤', hint: 'Clear headshot, professional attire' },
                { key: 'id_card', label: 'National Identity Card', icon: '🪪', hint: 'Both sides or single-side NIC' },
                { key: 'medical_license', label: 'Medical License (SLMC)', icon: '📋', hint: 'Valid SLMC registration document' },
                { key: 'medical_id', label: 'Hospital / Medical ID', icon: '🏥', hint: 'Your current hospital staff ID' },
              ].map(({ key, label, icon, hint }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>
                    {label} <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <label htmlFor={key} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    border: `1.5px dashed ${errors[key] ? '#FCA5A5' : files[key] ? '#67C090' : '#D1D5DB'}`,
                    borderRadius: 12, cursor: 'pointer', background: files[key] ? '#F0FDF4' : '#FAFAFA',
                    transition: 'all 0.2s',
                  }}>
                    {filePreviews[key] && filePreviews[key] !== 'pdf' ? (
                      <img src={filePreviews[key]} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: files[key] ? '#D1FAE5' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: files[key] ? '#059669' : '#374151' }}>
                        {files[key] ? files[key].name : `Choose ${label}`}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#9CA3AF' }}>{hint}</p>
                    </div>
                    {files[key] && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </label>
                  <input type="file" id={key} accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile(key)} />
                  {errors[key] && <p style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors[key]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div>
              <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#124170' }}>Personal Details</h3>
                {[['Name', `${form.first_name} ${form.last_name}`], ['Email', form.email], ['Phone', form.phone]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                    <span style={{ color: '#6B7280' }}>{l}</span>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '20px 22px', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: '#124170' }}>Professional Details</h3>
                {[
                  ['Specialty', form.specialty], ['Hospital', form.hospital],
                  ['License No.', form.medical_license_number], ['Experience', `${form.years_of_experience} years`],
                  ['Online Fee', form.consultation_fee_online ? `LKR ${form.consultation_fee_online}` : '—'],
                  ['Physical Fee', form.consultation_fee_physical ? `LKR ${form.consultation_fee_physical}` : '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                    <span style={{ color: '#6B7280' }}>{l}</span>
                    <span style={{ fontWeight: 500, color: '#111827' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F0FDF4', borderRadius: 14, padding: '16px 20px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: '#059669' }}>Documents</h3>
                {Object.entries(files).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 13 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ color: '#065F46' }}>{k.replace(/_/g, ' ')}: {v?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={back} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '1.5px solid #34A0A4', background: 'white', color: '#184E77', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                ← Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button onClick={next} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #184E77, #34A0A4, #76C893)', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: '12px 0', borderRadius: 12, border: 'none', background: loading ? '#34A0A4' : 'linear-gradient(135deg, #184E77, #76C893)', color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Submitting...' : 'Submit Registration ✓'}
              </button>
            )}
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#34A0A4' }}>
            Already registered? <Link to="/login" style={{ color: '#184E77', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}