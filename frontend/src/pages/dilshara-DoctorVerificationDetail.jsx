// dilshara-DoctorVerificationDetail.jsx
// Full doctor application review page with AI-powered license analysis

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, verifyDoctor } from '../services/dilshara-adminApi';

const Field = ({ label, value }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 14, color: value ? '#fff' : 'rgba(255,255,255,0.25)', fontWeight: value ? 500 : 400 }}>
      {value || 'Not provided'}
    </div>
  </div>
);

const DocViewer = ({ label, url }) => {
  if (!url) return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
      {label} — Not uploaded
    </div>
  );
  const isPdf = url.toLowerCase().endsWith('.pdf');
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
      <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
        {isPdf ? (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px 20px', textAlign: 'center', color: '#67C090' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Click to view PDF</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Opens in new tab</div>
          </div>
        ) : (
          <img src={url} alt={label} style={{ width: '100%', display: 'block', maxHeight: 300, objectFit: 'contain', background: 'rgba(0,0,0,0.3)' }} />
        )}
      </a>
    </div>
  );
};



export default function DilsharaDoctorVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [note, setNote]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(null); // 'approved' | 'rejected'



  useEffect(() => {
    getDoctorById(id)
      .then(setDoctor)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async (status) => {
    // If rejecting, ensure a reason is provided
    if (status === 'rejected' && !note.trim()) {
      alert('Please provide a rejection reason. This will be sent to the doctor.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to ${status} this doctor?${status === 'rejected' ? '\n\nRejection reason will be sent to the doctor.' : ''}`)) return;
    
    console.log('=== VERIFY DOCTOR ===');
    console.log('Doctor ID:', id);
    console.log('Status:', status);
    console.log('Note:', note);
    
    setSubmitting(true);
    try {
      const result = await verifyDoctor(id, status, note);
      console.log('Verification successful:', result);
      setDone(status);
    } catch (err) {
      console.error('Verification failed:', err);
      alert(`Failed to ${status} doctor: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
      Loading application…
    </div>
  );

  if (!doctor) return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontFamily: "'DM Sans', sans-serif" }}>
      Doctor not found.
    </div>
  );

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0A0F1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>{done === 'approved' ? '✅' : '❌'}</div>
        <h2 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 28, marginBottom: 12 }}>
          Doctor {done === 'approved' ? 'Approved' : 'Rejected'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: 32 }}>
          {doctor.full_name} has been {done}. The notification service will send them an email.
        </p>
        <button onClick={() => navigate('/admin/doctors')} style={{
          background: 'linear-gradient(135deg, #124170, #67C090)',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Back to List
        </button>
      </div>
    </div>
  );

  const isPending = doctor.verification_status === 'pending';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Sticky header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/admin/doctors')} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '7px 14px', color: 'rgba(255,255,255,0.6)',
            fontSize: 13, cursor: 'pointer',
          }}>← Back</button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
              {doctor.full_name}
            </h2>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 700,
              background: doctor.verification_status === 'pending' ? 'rgba(245,158,11,0.15)' : doctor.verification_status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: doctor.verification_status === 'pending' ? '#F59E0B' : doctor.verification_status === 'approved' ? '#10B981' : '#EF4444',
            }}>
              {doctor.verification_status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>

          {/* LEFT: Doctor info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Personal Info */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 18, overflow: 'hidden',
                  background: 'linear-gradient(135deg, #124170, #67C090)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {doctor.profile_photo_url
                    ? <img src={doctor.profile_photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : doctor.first_name?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{doctor.full_name}</div>
                  <div style={{ fontSize: 13, color: '#67C090', marginTop: 2 }}>{doctor.specialty}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <Field label="Email" value={doctor.email} />
                <Field label="Phone" value={doctor.phone} />
                <Field label="Hospital / Clinic" value={doctor.hospital} />
                <Field label="Sub-Specialty" value={doctor.sub_specialty} />
                <Field label="License Number" value={doctor.medical_license_number} />
                <Field label="Experience" value={doctor.years_of_experience ? `${doctor.years_of_experience} years` : null} />
                <Field label="Online Fee" value={doctor.consultation_fee_online ? `LKR ${doctor.consultation_fee_online}` : null} />
                <Field label="Physical Fee" value={doctor.consultation_fee_physical ? `LKR ${doctor.consultation_fee_physical}` : null} />
              </div>

              {doctor.rejection_reason && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Previous Rejection Reason</div>
                  <div style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.7, background: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                    {doctor.rejection_reason}
                  </div>
                </div>
              )}

              {doctor.bio && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Bio</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{doctor.bio}</div>
                </div>
              )}
            </div>

            {/* Documents */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>Uploaded Documents</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DocViewer label="Profile Photo" url={doctor.profile_photo_url} />
                <DocViewer label="National ID Card" url={doctor.id_card_url} />
                <DocViewer label="Medical License (SLMC)" url={doctor.medical_license_url} />
                <DocViewer label="Hospital / Medical ID" url={doctor.medical_id_url} />
              </div>
            </div>
          </div>

          {/* RIGHT: Decision Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Decision Panel */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 24,
            }}>
              <h3 style={{ margin: '0 0 16px', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                Verification Decision
              </h3>

              {!isPending ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                  This application has already been <strong style={{ color: doctor.verification_status === 'approved' ? '#10B981' : '#EF4444' }}>{doctor.verification_status}</strong>.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
                      {note.includes('reject') || note.includes('Reject') ? 'Rejection Reason (Required)' : 'Admin Note (Optional)'}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={doctor.verification_status === 'pending' ? 'Enter reason for rejection (this will be sent to the doctor via email)' : 'e.g. License verified manually. Approved.'}
                      rows={4}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff', resize: 'vertical', outline: 'none',
                        boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <button
                      onClick={() => handleVerify('approved')}
                      disabled={submitting}
                      style={{
                        width: '100%', padding: '13px 0', borderRadius: 12, border: 'none',
                        background: submitting ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg, #059669, #10B981)',
                        color: '#fff', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s',
                      }}>
                      ✅ Approve Doctor
                    </button>
                    <button
                      onClick={() => handleVerify('rejected')}
                      disabled={submitting}
                      style={{
                        width: '100%', padding: '13px 0', borderRadius: 12, border: '1px solid rgba(239,68,68,0.4)',
                        background: 'rgba(239,68,68,0.08)',
                        color: '#EF4444', fontSize: 14, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                      }}>
                      ❌ Reject Application
                    </button>
                  </div>

                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 14, lineHeight: 1.6 }}>
                    The notification service will automatically email the doctor with the outcome once you confirm.
                  </p>
                </>
              )}
            </div>

            {/* Application metadata */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Application Info</div>
              <Field label="Applied On" value={doctor.created_at ? new Date(doctor.created_at).toLocaleString() : null} />
              <Field label="Doctor ID" value={doctor.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}