// dilshara-DoctorVerificationDetail.jsx
// Full doctor application review page with AI-powered license analysis

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDoctorById, verifyDoctor, analyseLicenseWithAI } from '../services/dilshara-adminApi';

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
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', textAlign: 'center', color: '#67C090', fontSize: 13, fontWeight: 600 }}>
            📄 View PDF
          </div>
        ) : (
          <img src={url} alt={label} style={{ width: '100%', display: 'block', maxHeight: 200, objectFit: 'cover' }} />
        )}
      </a>
    </div>
  );
};

const AIResultRow = ({ label, value, flag }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
    <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
    <span style={{ color: flag ? '#EF4444' : '#10B981', fontWeight: 600 }}>{value || '—'}</span>
  </div>
);

export default function DilsharaDoctorVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [note, setNote]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(null); // 'approved' | 'rejected'

  // AI state
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiResult, setAiResult]     = useState(null);
  const [aiError, setAiError]       = useState('');

  useEffect(() => {
    getDoctorById(id)
      .then(setDoctor)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async (status) => {
    if (!window.confirm(`Are you sure you want to ${status} this doctor?`)) return;
    setSubmitting(true);
    try {
      await verifyDoctor(id, status, note);
      setDone(status);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!doctor?.medical_license_url) {
      setAiError('No medical license uploaded by this doctor.');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    setAiError('');
    try {
      const result = await analyseLicenseWithAI(id, doctor.medical_license_url);
      if (result.error) setAiError(result.error);
      else setAiResult(result);
    } catch (err) {
      setAiError('AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
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

        {/* AI Analyse button */}
        <button onClick={handleAIAnalysis} disabled={aiLoading} style={{
          background: aiLoading ? 'rgba(103,192,144,0.1)' : 'linear-gradient(135deg, rgba(103,192,144,0.2), rgba(18,65,112,0.3))',
          border: '1px solid rgba(103,192,144,0.4)',
          borderRadius: 12, padding: '10px 20px', color: '#67C090',
          fontSize: 13, fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {aiLoading ? (
            <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span> Analysing…</>
          ) : (
            <><span>🤖</span> AI Analyse License</>
          )}
        </button>
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

          {/* RIGHT: AI Panel + Decision */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* AI Result Panel */}
            <div style={{
              background: 'rgba(103,192,144,0.05)',
              border: `1px solid ${aiResult ? 'rgba(103,192,144,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20, padding: 24,
              minHeight: 200,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 20 }}>🤖</span>
                <h3 style={{ margin: 0, color: '#67C090', fontSize: 14, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
                  AI License Analysis
                </h3>
              </div>

              {!aiResult && !aiLoading && !aiError && (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, lineHeight: 1.7 }}>
                  Click <strong style={{ color: '#67C090' }}>"AI Analyse License"</strong> above to automatically extract and verify details from the uploaded medical license document.
                </p>
              )}

              {aiLoading && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', paddingTop: 20 }}>
                  Reading license document…
                </div>
              )}

              {aiError && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 14, color: '#EF4444', fontSize: 13 }}>
                  {aiError}
                </div>
              )}

              {aiResult && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: aiResult.confidence === 'high' ? 'rgba(16,185,129,0.15)' : aiResult.confidence === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                      color: aiResult.confidence === 'high' ? '#10B981' : aiResult.confidence === 'medium' ? '#F59E0B' : '#EF4444',
                    }}>
                      Confidence: {aiResult.confidence?.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, color: aiResult.is_valid_format ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                      {aiResult.is_valid_format ? '✓ Valid format' : '✗ Invalid format'}
                    </span>
                  </div>

                  <AIResultRow label="License Number" value={aiResult.license_number} flag={aiResult.license_number !== doctor.medical_license_number} />
                  <AIResultRow label="Doctor Name" value={aiResult.doctor_name} />
                  <AIResultRow label="Specialty" value={aiResult.specialty} />
                  <AIResultRow label="Issuing Authority" value={aiResult.issuing_authority} />
                  <AIResultRow label="Issue Date" value={aiResult.issue_date} />
                  <AIResultRow label="Expiry Date" value={aiResult.expiry_date} flag={false} />

                  {/* Cross-check note */}
                  {aiResult.license_number && aiResult.license_number !== doctor.medical_license_number && (
                    <div style={{ marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 10, fontSize: 12, color: '#EF4444' }}>
                      ⚠️ License number on document doesn't match submitted value: <strong>{doctor.medical_license_number}</strong>
                    </div>
                  )}

                  {aiResult.flags?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Flags</div>
                      {aiResult.flags.map((f, i) => (
                        <div key={i} style={{ fontSize: 12, color: '#F59E0B', marginBottom: 3 }}>• {f}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

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
                      Admin Note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. License verified manually. Approved."
                      rows={3}
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

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}