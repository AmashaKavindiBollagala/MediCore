import React, { useState, useEffect } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPE_CONFIG = {
  online:   { label: '🎥 Online', bg: '#e8f8f8', color: '#1a6b6e', border: '#34a0a4', icon: '🎥' },
  physical: { label: '🏥 In-person', bg: '#edfaf2', color: '#1a5c36', border: '#76c893', icon: '🏥' },
  both:     { label: '⚡ Both', bg: '#fff0f4', color: '#8c2040', border: '#ffb3c6', icon: '⚡' },
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .kda-root {
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg, #f1faee 0%, #e8f8f8 50%, #f1faee 100%);
    min-height: 100vh;
    padding: 36px 32px;
    box-sizing: border-box;
  }

  .kda-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 36px;
    background: white;
    border-radius: 20px;
    padding: 28px 32px;
    box-shadow: 0 4px 24px rgba(24, 78, 119, 0.08);
    border: 1.5px solid rgba(52, 160, 164, 0.15);
  }

  .kda-header-left h2 {
    margin: 0 0 6px;
    font-family: 'Fraunces', serif;
    font-size: 26px;
    font-weight: 700;
    color: #184e77;
    letter-spacing: -0.3px;
  }

  .kda-header-left p {
    margin: 0;
    font-size: 15px;
    color: #5a8fa8;
    font-weight: 400;
  }

  .kda-header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .kda-btn-block {
    background: linear-gradient(135deg, #fff0f4, #ffe5ec);
    border: 1.5px solid #ffb3c6;
    border-radius: 12px;
    padding: 11px 20px;
    color: #8c2040;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s ease;
    letter-spacing: 0.1px;
  }
  .kda-btn-block:hover {
    background: #ffe5ec;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 107, 139, 0.2);
  }

  .kda-btn-add {
    background: linear-gradient(135deg, #184e77, #34a0a4);
    border: none;
    border-radius: 12px;
    padding: 11px 22px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s ease;
    letter-spacing: 0.1px;
    box-shadow: 0 4px 14px rgba(24, 78, 119, 0.25);
  }
  .kda-btn-add:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(24, 78, 119, 0.35);
  }

  .kda-alert-success {
    background: linear-gradient(135deg, #edfaf2, #d4f5e2);
    border: 1.5px solid #76c893;
    border-radius: 12px;
    padding: 13px 20px;
    margin-bottom: 20px;
    color: #1a5c36;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kda-alert-error {
    background: linear-gradient(135deg, #fff0f4, #ffe5ec);
    border: 1.5px solid #ffb3c6;
    border-radius: 12px;
    padding: 13px 20px;
    margin-bottom: 20px;
    color: #8c2040;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kda-form-card {
    background: white;
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 28px;
    box-shadow: 0 4px 24px rgba(24, 78, 119, 0.08);
    border: 1.5px solid rgba(52, 160, 164, 0.2);
  }

  .kda-form-card h3 {
    margin: 0 0 22px;
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 600;
    color: #184e77;
  }

  .kda-block-card {
    background: white;
    border-radius: 20px;
    padding: 28px 32px;
    margin-bottom: 28px;
    box-shadow: 0 4px 24px rgba(255, 107, 139, 0.08);
    border: 1.5px solid #ffb3c6;
  }

  .kda-block-card h3 {
    margin: 0 0 22px;
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 600;
    color: #8c2040;
  }

  .kda-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 18px;
  }

  .kda-grid-2 {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 18px;
  }

  .kda-field label {
    font-size: 12px;
    font-weight: 700;
    color: #184e77;
    display: block;
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }

  .kda-field select,
  .kda-field input {
    width: 100%;
    padding: 11px 14px;
    border-radius: 10px;
    border: 1.5px solid #cce8ea;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #184e77;
    background: #f7fcfc;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
  }

  .kda-field select:focus,
  .kda-field input:focus {
    border-color: #34a0a4;
    background: white;
    box-shadow: 0 0 0 3px rgba(52, 160, 164, 0.1);
  }

  .kda-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 22px;
  }

  .kda-btn-submit {
    background: linear-gradient(135deg, #184e77, #34a0a4);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 11px 26px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(24, 78, 119, 0.2);
  }
  .kda-btn-submit:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(24, 78, 119, 0.3); }

  .kda-btn-submit-warn {
    background: linear-gradient(135deg, #ff6b8b, #e05577);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 11px 26px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 3px 10px rgba(255, 107, 139, 0.25);
  }
  .kda-btn-submit-warn:hover { transform: translateY(-1px); }

  .kda-btn-cancel {
    background: #f1faee;
    color: #5a8fa8;
    border: 1.5px solid #cce8ea;
    border-radius: 10px;
    padding: 11px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .kda-btn-cancel:hover { background: #e8f4ea; }

  /* Weekly calendar grid */
  .kda-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }

  .kda-day-col {
    border-radius: 16px;
    padding: 14px 10px 12px;
    min-height: 120px;
    transition: all 0.2s;
  }

  .kda-day-col.has-slots {
    background: white;
    border: 1.5px solid rgba(52, 160, 164, 0.25);
    box-shadow: 0 2px 12px rgba(24, 78, 119, 0.06);
  }

  .kda-day-col.empty {
    background: rgba(241, 250, 238, 0.6);
    border: 1.5px dashed #c8e6d0;
  }

  .kda-day-label {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .kda-day-label.active { color: #184e77; }
  .kda-day-label.inactive { color: #b0c8b8; }

  .kda-day-empty-text {
    font-size: 18px;
    text-align: center;
    margin-top: 24px;
    opacity: 0.25;
  }

  .kda-slot-chip {
    border-radius: 9px;
    padding: 6px 8px;
    margin-bottom: 6px;
    position: relative;
  }

  .kda-slot-chip p { margin: 0; }
  .kda-slot-time { font-size: 11px; font-weight: 700; line-height: 1.4; }
  .kda-slot-meta { font-size: 9px; opacity: 0.75; margin-top: 1px !important; }

  .kda-slot-remove {
    position: absolute;
    top: 3px;
    right: 3px;
    background: rgba(255,255,255,0.7);
    border: none;
    cursor: pointer;
    color: #e53935;
    font-size: 13px;
    line-height: 1;
    padding: 1px 4px;
    border-radius: 5px;
    font-weight: 700;
  }
  .kda-slot-remove:hover { background: #ffe5ec; }

  /* Bottom panels */
  .kda-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .kda-panel {
    background: white;
    border-radius: 20px;
    padding: 26px 28px;
    box-shadow: 0 4px 20px rgba(24, 78, 119, 0.06);
    border: 1.5px solid rgba(52, 160, 164, 0.12);
  }

  .kda-panel h3 {
    margin: 0 0 20px;
    font-family: 'Fraunces', serif;
    font-size: 17px;
    font-weight: 700;
    color: #184e77;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .kda-panel-badge {
    background: linear-gradient(135deg, #184e77, #34a0a4);
    color: white;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 20px;
    font-family: 'DM Sans', sans-serif;
  }

  .kda-slot-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 0;
    border-bottom: 1px solid #f1faee;
    transition: background 0.15s;
  }
  .kda-slot-row:last-child { border-bottom: none; }

  .kda-slot-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .kda-slot-info { flex: 1; }
  .kda-slot-info p { margin: 0; }
  .kda-slot-day { font-size: 15px; font-weight: 700; color: #184e77; }
  .kda-slot-hours { font-size: 13px; color: #5a8fa8; margin-top: 2px !important; }

  .kda-type-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
  }

  .kda-remove-btn {
    background: #ffe5ec;
    color: #c0304f;
    border: none;
    border-radius: 9px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    letter-spacing: 0.2px;
  }
  .kda-remove-btn:hover { background: #ffb3c6; }

  .kda-empty-state {
    text-align: center;
    padding: 32px 0 16px;
  }
  .kda-empty-state p { color: #a0bec8; font-size: 15px; margin: 0 0 12px; }

  .kda-empty-add-btn {
    background: linear-gradient(135deg, #f1faee, #e8f8f8);
    color: #184e77;
    border: 1.5px solid #cce8ea;
    border-radius: 10px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .kda-empty-add-btn:hover { background: #d4f0ee; }

  .kda-blocked-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 13px 0;
    border-bottom: 1px solid #f1faee;
  }
  .kda-blocked-row:last-child { border-bottom: none; }

  .kda-blocked-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ffe5ec, #ffccd8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }

  .kda-blocked-date { font-size: 15px; font-weight: 700; color: #184e77; margin: 0; }
  .kda-blocked-reason { font-size: 13px; color: #a07080; margin: 2px 0 0; }
`;

export default function KaveeshaDoctorAvailability({ token }) {
  const [slots, setSlots] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate tomorrow's date and its day of week
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Format in local timezone to avoid date shift
  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowDateStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
  const tomorrowDayOfWeek = tomorrow.getDay().toString();
  
  const [form, setForm] = useState({
    week_start_date: tomorrowDateStr, // Auto-set to tomorrow
    day_of_week: tomorrowDayOfWeek, // Auto-set to tomorrow's day of week
    start_time: '09:00',
    end_time: '17:00',
    slot_duration_minutes: '30',
    consultation_type: 'online',
  });

  const [blockForm, setBlockForm] = useState({ exception_date: '', reason: '' });
  const [editingSlot, setEditingSlot] = useState(null);
  const [editingException, setEditingException] = useState(null);

  useEffect(() => {
    fetchSlots();
    fetchExceptions();
    
    // Auto-refresh every minute for real-time updates
    const interval = setInterval(() => {
      fetchSlots();
      fetchExceptions();
    }, 60000); // 60 seconds
    
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
      clearInterval(interval);
    };
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors/me/availability', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched slots:', data);
        console.log('First slot date:', data[0]?.slot_date);
        setSlots(data);
      }
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
    
    // Validate week start date
    if (!form.week_start_date) {
      setError('Please select a week start date');
      return;
    }
    
    // The week_start_date IS the actual slot date (no need to add day_of_week)
    // Just use it directly
    const slotDate = form.week_start_date;
    
    try {
      const requestBody = { ...form, day_of_week: parseInt(form.day_of_week), slot_duration_minutes: parseInt(form.slot_duration_minutes), slot_date: slotDate };
      console.log('Sending slot data:', requestBody);
      
      const res = await fetch('/api/doctors/me/availability', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      console.log('Response:', res.status, data);
      if (!res.ok) { setError(data.error || (data.errors && data.errors.join(', ')) || 'Failed'); return; }
      setSuccess('Slot added!');
      setShowForm(false);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
  };

  const removeSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    
    try {
      const res = await fetch(`/api/doctors/me/availability/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to remove slot'); return; }
      setSuccess('Slot removed!');
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to remove slot'); }
  };

  const startEditSlot = (slot) => {
    setEditingSlot(slot);
    setForm({
      week_start_date: slot.slot_date || '',
      day_of_week: slot.day_of_week.toString(),
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      slot_duration_minutes: slot.slot_duration_minutes.toString(),
      consultation_type: slot.consultation_type,
    });
    setShowForm(true);
    setShowBlockForm(false);
  };

  const updateSlot = async () => {
    setError('');
    try {
      const res = await fetch(`/api/doctors/me/availability/${editingSlot.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, day_of_week: parseInt(form.day_of_week), slot_duration_minutes: parseInt(form.slot_duration_minutes) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update'); return; }
      setSuccess('Slot updated!');
      setEditingSlot(null);
      setShowForm(false);
      // Reset to tomorrow with correct day of week
      const resetTomorrow = new Date();
      resetTomorrow.setDate(resetTomorrow.getDate() + 1);
      setForm({
        week_start_date: resetTomorrow.toISOString().split('T')[0],
        day_of_week: resetTomorrow.getDay().toString(),
        start_time: '09:00',
        end_time: '17:00',
        slot_duration_minutes: '30',
        consultation_type: 'online',
      });
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Network error'); }
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

  const removeException = async (id) => {
    if (!window.confirm('Are you sure you want to remove this blocked date?')) return;
    
    try {
      const res = await fetch(`/api/doctors/me/availability/exceptions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to remove blocked date'); return; }
      setSuccess('Blocked date removed!');
      fetchExceptions();
      setTimeout(() => setSuccess(''), 3000);
    } catch { setError('Failed to remove blocked date'); }
  };

  const startEditException = (ex) => {
    setEditingException(ex);
    setBlockForm({
      exception_date: ex.exception_date.slice(0, 10),
      reason: ex.reason || '',
    });
    setShowBlockForm(true);
    setShowForm(false);
  };

  const updateException = async () => {
    setError('');
    try {
      const res = await fetch(`/api/doctors/me/availability/exceptions/${editingException.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(blockForm),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to update'); return; }
      setSuccess('Blocked date updated!');
      setEditingException(null);
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

  return (
    <div className="kda-root">
      {/* Header */}
      <div className="kda-header">
        <div className="kda-header-left">
          <h2>Manage Availability</h2>
          <p>Set your weekly schedule for online and in-person consultations</p>
        </div>
        <div className="kda-header-actions">
          <button className="kda-btn-block" onClick={() => { setShowBlockForm(!showBlockForm); setShowForm(false); }}>
            🚫 Block a Date
          </button>
          <button className="kda-btn-add" onClick={() => { setShowForm(!showForm); setShowBlockForm(false); }}>
            + Add Slot
          </button>
        </div>
      </div>

      {success && (
        <div className="kda-alert-success">
          <span>✅</span> {success}
        </div>
      )}
      {error && (
        <div className="kda-alert-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Add/Edit Slot Form */}
      {showForm && (
        <div className="kda-form-card">
          <h3>{editingSlot ? '✏️ Edit Availability Slot' : '✦ New Availability Slot'}</h3>
          <div className="kda-grid-3">
            <div className="kda-field">
              <label>Slot Date</label>
              <input 
                type="date" 
                value={form.week_start_date} 
                min={(() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  const year = tomorrow.getFullYear();
                  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
                  const day = String(tomorrow.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                max={(() => {
                  const endDate = new Date();
                  endDate.setDate(endDate.getDate() + 7);
                  const year = endDate.getFullYear();
                  const month = String(endDate.getMonth() + 1).padStart(2, '0');
                  const day = String(endDate.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                })()}
                onChange={(e) => {
                  const newDate = e.target.value;
                  // Auto-update day of week to match the selected date
                  const selectedDate = new Date(newDate + 'T00:00:00');
                  const dayOfWeek = selectedDate.getDay().toString();
                  setForm(f => ({ ...f, week_start_date: newDate, day_of_week: dayOfWeek }));
                }} 
                style={{ cursor: 'pointer' }}
              />
              {!editingSlot && (
                <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  📅 This week only: {(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const endOfWeek = new Date(tomorrow);
                    endOfWeek.setDate(tomorrow.getDate() + 6);
                    return `${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                  })()}
                </p>
              )}
            </div>
            <div className="kda-field">
              <label>Day of Week</label>
              <select value={form.day_of_week} onChange={(e) => setForm(f => ({ ...f, day_of_week: e.target.value }))}>
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              {!editingSlot && form.week_start_date && (
                <p style={{ fontSize: 12, color: '#34a0a4', marginTop: 4, fontWeight: 500 }}>
                  📍 {new Date(form.week_start_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            <div className="kda-field">
              <label>Start Time</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm(f => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div className="kda-field">
              <label>End Time</label>
              <input type="time" value={form.end_time} onChange={(e) => setForm(f => ({ ...f, end_time: e.target.value }))} />
            </div>
            <div className="kda-field">
              <label>Slot Duration</label>
              <select value={form.slot_duration_minutes} onChange={(e) => setForm(f => ({ ...f, slot_duration_minutes: e.target.value }))}>
                {[15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} minutes</option>)}
              </select>
            </div>
            <div className="kda-field">
              <label>Consultation Type</label>
              <select value={form.consultation_type} onChange={(e) => setForm(f => ({ ...f, consultation_type: e.target.value }))}>
                <option value="online">🎥 Online (Telemedicine)</option>
                <option value="physical">🏥 In-person (Physical)</option>
                <option value="both">⚡ Both</option>
              </select>
            </div>
          </div>
          <div className="kda-form-actions">
            <button className="kda-btn-submit" onClick={editingSlot ? updateSlot : addSlot}>
              {editingSlot ? 'Update Slot' : 'Add Slot'}
            </button>
            <button className="kda-btn-cancel" onClick={() => { setShowForm(false); setEditingSlot(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Block/Edit Date Form */}
      {showBlockForm && (
        <div className="kda-block-card">
          <h3>{editingException ? '✏️ Edit Blocked Date' : '🚫 Block a Date — Day Off / Leave'}</h3>
          <div className="kda-grid-2">
            <div className="kda-field">
              <label>Date</label>
              <input 
                type="date" 
                value={blockForm.exception_date} 
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setBlockForm(f => ({ ...f, exception_date: e.target.value }))} 
              />
              {!editingException && (
                <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  ⚠️ Cannot block past dates
                </p>
              )}
            </div>
            <div className="kda-field">
              <label>Reason (optional)</label>
              <input value={blockForm.reason} onChange={(e) => setBlockForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Medical conference, Personal leave" />
            </div>
          </div>
          <div className="kda-form-actions">
            <button className="kda-btn-submit-warn" onClick={editingException ? updateException : blockDate}>
              {editingException ? 'Update Blocked Date' : 'Block Date'}
            </button>
            <button className="kda-btn-cancel" onClick={() => { setShowBlockForm(false); setEditingException(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Weekly Calendar */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#184e77', fontFamily: 'Fraunces, serif' }}>
          📅 Weekly Schedule
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: '#5a8fa8' }}>
          Showing: {(() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const end = new Date(tomorrow);
            end.setDate(tomorrow.getDate() + 6);
            return `${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
          })()}
          {slots.length > 0 && <span style={{ marginLeft: 12 }}>· {slots.length} slot{slots.length !== 1 ? 's' : ''}</span>}
        </p>
      </div>
      <div className="kda-week-grid">
        {(() => {
          // Calculate the 7 days starting from tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const weekDays = [];
          for (let i = 0; i < 7; i++) {
            const day = new Date(tomorrow);
            day.setDate(tomorrow.getDate() + i);
            // Format date consistently in local timezone
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const dateNum = String(day.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dateNum}`;
            
            weekDays.push({
              date: day,
              dateStr: dateStr,
              dayOfWeek: day.getDay(),
              dayName: DAYS[day.getDay()],
              dayShort: DAY_SHORT[day.getDay()],
              dayNum: day.getDate(),
              month: day.toLocaleDateString('en-US', { month: 'short' }),
            });
          }
          
          console.log('Week days:', weekDays.map(d => d.dateStr));
          console.log('All slots:', slots.map(s => ({ id: s.id, date: s.slot_date, day: s.day_of_week })));
          
          return weekDays.map((dayInfo) => {
            // Filter slots: show date-specific slots OR recurring weekly slots matching the day of week
            const daySlots = slots.filter(s => {
              // If slot has a specific date, match by date
              if (s.slot_date) {
                // Extract just the date part (YYYY-MM-DD) from ISO string if needed
                const slotDateStr = s.slot_date.includes('T') ? s.slot_date.split('T')[0] : s.slot_date;
                return slotDateStr === dayInfo.dateStr;
              }
              // If slot is recurring (no date), match by day of week
              return s.day_of_week === dayInfo.dayOfWeek;
            });
            console.log(`Date ${dayInfo.dateStr} has ${daySlots.length} slots`);
            const hasSlots = daySlots.length > 0;
            const isToday = dayInfo.dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <div key={dayInfo.dateStr} className={`kda-day-col ${hasSlots ? 'has-slots' : 'empty'}`}>
                <p className={`kda-day-label ${hasSlots ? 'active' : 'inactive'}`}>
                  {dayInfo.dayShort}
                  <span style={{ display: 'block', fontSize: 10, fontWeight: 400, marginTop: 2, opacity: 0.8 }}>
                    {dayInfo.month} {dayInfo.dayNum}
                  </span>
                </p>
                {daySlots.length === 0 ? (
                  <p className="kda-day-empty-text">○</p>
                ) : (
                  daySlots.map((slot) => {
                    const tc = TYPE_CONFIG[slot.consultation_type] || TYPE_CONFIG.online;
                    return (
                      <div key={slot.id} className="kda-slot-chip" style={{ background: tc.bg, border: `1.5px solid ${tc.border}` }}>
                        <p className="kda-slot-time" style={{ color: tc.color }}>{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}</p>
                        <p className="kda-slot-meta" style={{ color: tc.color }}>{tc.label} · {slot.slot_duration_minutes}min</p>
                        <button className="kda-slot-edit" onClick={() => startEditSlot(slot)} style={{
                          position: 'absolute',
                          top: 4,
                          right: 24,
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(0,0,0,0.1)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: 12,
                          lineHeight: '20px',
                          textAlign: 'center',
                        }}>✏️</button>
                        <button className="kda-slot-remove" onClick={() => removeSlot(slot.id)}>×</button>
                      </div>
                    );
                  })
                )}
              </div>
            );
          });
        })()}
      </div>

      {/* Bottom Panels */}
      <div className="kda-panels">
        {/* Active Slots */}
        <div className="kda-panel">
          <h3>
            Active Slots
            <span className="kda-panel-badge">{slots.length}</span>
          </h3>
          {loading ? (
            <p style={{ color: '#a0bec8', fontSize: 15 }}>Loading...</p>
          ) : slots.length === 0 ? (
            <div className="kda-empty-state">
              <p>No availability slots yet.</p>
              <button className="kda-empty-add-btn" onClick={() => setShowForm(true)}>+ Add your first slot</button>
            </div>
          ) : (
            slots.map((slot) => {
              const tc = TYPE_CONFIG[slot.consultation_type] || TYPE_CONFIG.online;
              return (
                <div key={slot.id} className="kda-slot-row">
                  <div className="kda-slot-icon" style={{ background: tc.bg }}>
                    {tc.icon}
                  </div>
                  <div className="kda-slot-info">
                    <p className="kda-slot-day">
                      {DAYS[slot.day_of_week]}
                      {slot.slot_date && (
                        <span style={{ marginLeft: 8, fontSize: 13, color: '#5a8fa8', fontWeight: 500 }}>
                          📅 {new Date(slot.slot_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </p>
                    <p className="kda-slot-hours">{slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)} · {slot.slot_duration_minutes}min slots</p>
                  </div>
                  <span className="kda-type-badge" style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                    {tc.label.replace(/^\S+\s/, '')}
                  </span>
                  <button className="kda-edit-btn" onClick={() => startEditSlot(slot)} style={{
                    padding: '6px 12px',
                    background: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: 13,
                    marginRight: 8,
                  }}>Edit</button>
                  <button className="kda-remove-btn" onClick={() => removeSlot(slot.id)}>Remove</button>
                </div>
              );
            })
          )}
        </div>

        {/* Blocked Dates */}
        <div className="kda-panel">
          <h3>
            Blocked Dates
            <span className="kda-panel-badge" style={{ background: 'linear-gradient(135deg, #c0304f, #e05577)' }}>{exceptions.length}</span>
          </h3>
          {exceptions.length === 0 ? (
            <div className="kda-empty-state">
              <p>No dates blocked.</p>
            </div>
          ) : (
            exceptions.map((ex) => (
              <div key={ex.id} className="kda-blocked-row">
                <div className="kda-blocked-icon">🚫</div>
                <div style={{ flex: 1 }}>
                  <p className="kda-blocked-date">
                    {new Date(ex.exception_date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  {ex.reason && <p className="kda-blocked-reason">{ex.reason}</p>}
                </div>
                <button className="kda-edit-btn" onClick={() => startEditException(ex)} style={{
                  padding: '6px 12px',
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  marginRight: 8,
                }}>Edit</button>
                <button className="kda-remove-btn" onClick={() => removeException(ex.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}