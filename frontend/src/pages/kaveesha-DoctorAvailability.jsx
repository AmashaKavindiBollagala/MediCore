import React, { useState, useEffect } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPE_CONFIG = {
  online:   { label: '🎥 Online', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  physical: { label: '🏥 In-person', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0' },
  both:     { label: '⚡ Both', bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
};

export default function KaveeshaDoctorAvailability({ token }) {
  const [slots, setSlots] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    day_of_week: '1',
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: '30',
    consultation_type: 'online',
  });

  const [blockForm, setBlockForm] = useState({ exception_date: '', reason: '' });

  useEffect(() => {
    fetchSlots();
    fetchExceptions();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors/me/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSlots(await res.json());
    } catch { }
    finally { setLoading(false); }
  };

  const fetchExceptions = async () => {
    try {
      const res = await fetch('/api/doctors/me/availability/exceptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setExceptions(await res.json());
    } catch { }
  };

  const addSlot = async () => {
    setError('');
    try {
      const res = await fetch('/api/doctors/me/availability', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, day_of_week: parseInt(form.day_of_week), slot_duration_minutes: parseInt(form.slot_duration_minutes) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || (data.errors && data.errors.join(', ')) || 'Failed'); return; }
      setSuccess('Slot added!');
      setShowForm(false);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const removeSlot = async (id) => {
    try {
      await fetch(`/api/doctors/me/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSlots();
    } catch { }
  };

  const blockDate = async () => {
    setError('');
    try {
      const res = await fetch('/api/doctors/me/availability/block', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed'); return; }
      setSuccess('Date blocked!');
      setShowBlockForm(false);
      setBlockForm({ exception_date: '', reason: '' });
      fetchExceptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  // Group slots by day
  const slotsByDay = DAYS.map((day, i) => ({
    day, dayIndex: i,
    slots: slots.filter((s) => s.day_of_week === i),
  })).filter((g) => g.slots.length > 0);

  const emptyDays = DAYS.map((day, i) => i).filter(i => !slotsByDay.find(g => g.dayIndex === i));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111827' }}>Manage Availability</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Set your weekly schedule for online and in-person consultations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setShowBlockForm(!showBlockForm); setShowForm(false); }}
            style={{ background: '#FEF3C7', border: 'none', borderRadius: 10, padding: '9px 16px', color: '#92400E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            🚫 Block a Date
          </button>
          <button onClick={() => { setShowForm(!showForm); setShowBlockForm(false); }}
            style={{ background: 'linear-gradient(135deg, #124170, #26667F)', border: 'none', borderRadius: 10, padding: '9px 18px', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Add Slot
          </button>
        </div>
      </div>

      {success && (
        <div style={{ background: '#D1FAE5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#065F46', fontSize: 13, fontWeight: 500 }}>
          ✓ {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#991B1B', fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Add Slot Form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #E0F2FE', padding: '22px 24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 600, color: '#124170' }}>New Availability Slot</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Day of Week</label>
              <select value={form.day_of_week} onChange={(e) => setForm(f => ({ ...f, day_of_week: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13 }}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Start Time</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>End Time</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Slot Duration (min)</label>
              <select value={form.slot_duration_minutes} onChange={(e) => setForm(f => ({ ...f, slot_duration_minutes: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13 }}>
                {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} minutes</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Consultation Type</label>
              <select value={form.consultation_type} onChange={(e) => setForm(f => ({ ...f, consultation_type: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13 }}>
                <option value="online">🎥 Online (Telemedicine)</option>
                <option value="physical">🏥 In-person (Physical)</option>
                <option value="both">⚡ Both</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button onClick={addSlot}
              style={{ background: 'linear-gradient(135deg, #124170, #67C090)', color: 'white', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Add Slot
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Block Date Form */}
      {showBlockForm && (
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #FEF3C7', padding: '22px 24px', marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#92400E' }}>🚫 Block a Date (Day Off / Leave)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Date</label>
              <input type="date" value={blockForm.exception_date} onChange={(e) => setBlockForm(f => ({ ...f, exception_date: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Reason (optional)</label>
              <input value={blockForm.reason} onChange={(e) => setBlockForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Medical conference, Personal leave"
                style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={blockDate}
              style={{ background: '#F59E0B', color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Block Date
            </button>
            <button onClick={() => setShowBlockForm(false)}
              style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Weekly slots view */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 24 }}>
            {DAYS.map((day, i) => {
              const daySlots = slots.filter(s => s.day_of_week === i);
              const hasSlots = daySlots.length > 0;
              return (
                <div key={i} style={{ background: hasSlots ? 'white' : '#F9FAFB', borderRadius: 12, border: `1.5px solid ${hasSlots ? '#E0F2FE' : '#F1F5F9'}`, padding: '12px 10px', minHeight: 100 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: hasSlots ? '#124170' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>{DAY_SHORT[i]}</p>
                  {daySlots.length === 0 ? (
                    <p style={{ fontSize: 11, color: '#D1D5DB', textAlign: 'center', marginTop: 20 }}>—</p>
                  ) : (
                    daySlots.map((slot) => {
                      const tc = TYPE_CONFIG[slot.consultation_type] || TYPE_CONFIG.online;
                      return (
                        <div key={slot.id} style={{ background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: 7, padding: '5px 7px', marginBottom: 5, position: 'relative' }}>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: tc.color }}>{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 9, color: tc.color, opacity: 0.8 }}>{tc.label} · {slot.slot_duration_minutes}min</p>
                          <button onClick={() => removeSlot(slot.id)}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, lineHeight: 1, padding: 2 }}>×</button>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Slots list */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Active Slots ({slots.length})</h3>
          {loading ? (
            <p style={{ color: '#9CA3AF', fontSize: 13 }}>Loading...</p>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>No availability slots yet.</p>
              <button onClick={() => setShowForm(true)} style={{ background: '#EFF6FF', color: '#124170', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                + Add your first slot
              </button>
            </div>
          ) : (
            slots.map((slot) => {
              const tc = TYPE_CONFIG[slot.consultation_type] || TYPE_CONFIG.online;
              return (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F9FAFB' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {slot.consultation_type === 'online' ? '🎥' : slot.consultation_type === 'physical' ? '🏥' : '⚡'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>{DAYS[slot.day_of_week]}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)} · {slot.slot_duration_minutes}min slots</p>
                  </div>
                  <span style={{ background: tc.bg, color: tc.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                    {tc.label.replace(/^\S+\s/, '')}
                  </span>
                  <button onClick={() => removeSlot(slot.id)}
                    style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Blocked dates */}
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #F1F5F9', padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#111827' }}>Blocked Dates ({exceptions.length})</h3>
          {exceptions.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>No dates blocked.</p>
          ) : (
            exceptions.map((ex) => (
              <div key={ex.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F9FAFB' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚫</div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {new Date(ex.exception_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  {ex.reason && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6B7280' }}>{ex.reason}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}