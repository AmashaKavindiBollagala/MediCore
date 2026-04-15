// dilshara-AdminPlaceholders.jsx
// Read-only placeholder views for Payment and Availability sections
// These sections are owned by other team members — admin only views summaries here

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title, owner, description, icon, accent, comingSoonItems }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '18px 40px',
        display: 'flex', alignItems: 'center', gap: 14,
        background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate('/admin')} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '7px 14px', color: 'rgba(255,255,255,0.6)',
          fontSize: 13, cursor: 'pointer',
        }}>← Back</button>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{title}</h2>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Managed by {owner}</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '80px auto', padding: '0 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>{icon}</div>
        <h2 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.8, marginBottom: 36 }}>{description}</p>

        <div style={{ background: `${accent}0D`, border: `1px solid ${accent}33`, borderRadius: 16, padding: '24px 28px', textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
            What admin will see here (in progress)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {comingSoonItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.55)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 }}>
          This section will be wired up once the {owner} team's APIs are ready.
        </p>
      </div>
    </div>
  );
};

export function DilsharaAdminPayments() {
  return (
    <PlaceholderPage
      title="Payment Overview"
      owner="payments-service team"
      icon="💳"
      accent="#818CF8"
      description="This section will display payment transaction summaries, revenue stats, and dispute management once the payments service is integrated."
      comingSoonItems={[
        'Total revenue this month',
        'Transaction success / failure rate',
        'Recent payment list with patient & doctor details',
        'Flagged / disputed payments',
        'Refund status tracker',
      ]}
    />
  );
}

export function DilsharaAdminAvailability() {
  return (
    <PlaceholderPage
      title="Doctor Availability"
      owner="doctor-service team (Kaveesha)"
      icon="📅"
      accent="#34A0A4"
      description="This section will display a platform-wide view of doctor schedule coverage and slot utilisation once the availability APIs are exposed."
      comingSoonItems={[
        'Number of available slots today',
        'Doctors with zero availability set',
        'Peak appointment times across specialties',
        'Slot utilisation by doctor',
        'Blocked/exception dates overview',
      ]}
    />
  );
}