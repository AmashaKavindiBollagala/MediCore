import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPE_CONFIG = {
  online:   { label: '🎥 Online', bg: '#e8f8f8', color: '#1a6b6e', border: '#34a0a4', icon: '🎥' },
  physical: { label: '🏥 In-person', bg: '#edfaf2', color: '#1a5c36', border: '#76c893', icon: '🏥' },
  both:     { label: '⚡ Both', bg: '#fff0f4', color: '#8c2040', border: '#ffb3c6', icon: '⚡' },
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap');

  .kda-root {
    font-family: 'Inter', sans-serif;
    background: linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #f0f4f8 100%);
    min-height: 100vh;
    padding: 32px 24px;
    box-sizing: border-box;
    position: relative;
    overflow-x: hidden;
  }

  .kda-root::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
    pointer-events: none;
  }

  .kda-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px 36px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
    position: relative;
    z-index: 1;
  }

  .kda-header-left h2 {
    margin: 0 0 8px;
    font-family: 'Poppins', sans-serif;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }

  .kda-header-left p {
    margin: 0;
    font-size: 15px;
    color: #64748b;
    font-weight: 400;
  }

  .kda-header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .kda-btn-block {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    border: none;
    border-radius: 14px;
    padding: 12px 24px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.2px;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25);
  }
  .kda-btn-block:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
  }

  .kda-btn-add {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border: none;
    border-radius: 14px;
    padding: 12px 28px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.2px;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
  }
  .kda-btn-add:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
  }

  .kda-alert-success {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 24px;
    color: #065f46;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .kda-alert-error {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 16px;
    padding: 16px 24px;
    margin-bottom: 24px;
    color: #991b1b;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    z-index: 1;
  }

  .kda-form-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px 36px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
    position: relative;
    z-index: 1;
  }

  .kda-form-card h3 {
    margin: 0 0 24px;
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
  }

  .kda-block-card {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px 36px;
    margin-bottom: 32px;
    box-shadow: 0 4px 20px rgba(239, 68, 68, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(239, 68, 68, 0.2);
    position: relative;
    z-index: 1;
  }

  .kda-block-card h3 {
    margin: 0 0 24px;
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 600;
    color: #dc2626;
  }

  .kda-grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
  }

  .kda-grid-2 {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
  }

  .kda-field label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    display: block;
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }

  .kda-field select,
  .kda-field input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: #1e293b;
    background: #f8fafc;
    box-sizing: border-box;
    outline: none;
    transition: all 0.2s;
  }

  .kda-field select:focus,
  .kda-field input:focus {
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  }

  .kda-form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .kda-btn-submit {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
  .kda-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35); }

  .kda-btn-submit-warn {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
  }
  .kda-btn-submit-warn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35); }

  .kda-btn-cancel {
    background: #f1f5f9;
    color: #64748b;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
  }
  .kda-btn-cancel:hover { background: #e2e8f0; }

  /* Weekly calendar grid */
  .kda-week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 12px;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }

  .kda-day-col {
    border-radius: 20px;
    padding: 16px 12px;
    min-height: 140px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kda-day-col.has-slots {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  }
  .kda-day-col.has-slots:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  }

  .kda-day-col.empty {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    border: 2px dashed #cbd5e1;
  }

  .kda-day-label {
    margin: 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  .kda-day-label.active { color: #1e293b; }
  .kda-day-label.inactive { color: #94a3b8; }

  .kda-day-empty-text {
    font-size: 20px;
    text-align: center;
    margin-top: 28px;
    opacity: 0.3;
  }

  .kda-slot-chip {
    border-radius: 10px;
    padding: 8px 10px;
    margin-bottom: 8px;
    position: relative;
    transition: all 0.2s;
  }
  .kda-slot-chip:hover {
    transform: scale(1.02);
  }

  .kda-slot-chip p { margin: 0; }
  .kda-slot-time { font-size: 12px; font-weight: 700; line-height: 1.4; }
  .kda-slot-meta { font-size: 10px; opacity: 0.75; margin-top: 2px !important; }

  .kda-slot-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    background: rgba(255,255,255,0.9);
    border: none;
    cursor: pointer;
    color: #ef4444;
    font-size: 14px;
    line-height: 1;
    padding: 2px 5px;
    border-radius: 6px;
    font-weight: 700;
    transition: all 0.2s;
  }
  .kda-slot-remove:hover { background: #fee2e2; transform: scale(1.1); }

  /* Bottom panels */
  .kda-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    position: relative;
    z-index: 1;
  }

  .kda-panel {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 32px 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .kda-panel h3 {
    margin: 0 0 24px;
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .kda-panel-badge {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 12px;
    border-radius: 20px;
    font-family: 'Inter', sans-serif;
  }

  .kda-slot-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
  }
  .kda-slot-row:last-child { border-bottom: none; }
  .kda-slot-row:hover {
    background: rgba(59, 130, 246, 0.03);
    margin: 0 -16px;
    padding: 16px;
    border-radius: 12px;
  }

  .kda-slot-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .kda-slot-info { flex: 1; }
  .kda-slot-info p { margin: 0; }
  .kda-slot-day { font-size: 15px; font-weight: 700; color: #1e293b; }
  .kda-slot-hours { font-size: 13px; color: #64748b; margin-top: 3px !important; }

  .kda-type-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 6px 14px;
    border-radius: 20px;
  }

  .kda-remove-btn {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
    border: none;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.2s;
    letter-spacing: 0.2px;
  }
  .kda-remove-btn:hover { 
    background: linear-gradient(135deg, #fecaca, #fca5a5);
    transform: scale(1.05);
  }

  .kda-empty-state {
    text-align: center;
    padding: 40px 0 20px;
  }
  .kda-empty-state p { color: #94a3b8; font-size: 15px; margin: 0 0 16px; }

  .kda-empty-add-btn {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
  }
  .kda-empty-add-btn:hover { 
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
  }

  .kda-blocked-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s;
  }
  .kda-blocked-row:last-child { border-bottom: none; }
  .kda-blocked-row:hover {
    background: rgba(239, 68, 68, 0.03);
    margin: 0 -16px;
    padding: 16px;
    border-radius: 12px;
  }

  .kda-blocked-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #ef4444, #dc2626);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  }

  .kda-blocked-date { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
  .kda-blocked-reason { font-size: 13px; color: #64748b; margin: 3px 0 0; }

  /* Pulse animation for blocked date icon */
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.6);
    }
  }
`;

export default function KaveeshaDoctorAvailability({ token }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const authToken = token || localStorage.getItem('token');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Use user data from localStorage to populate doctor info
      setDoctor({
        first_name: userData.first_name || userData.name?.split(' ')[0] || 'Doctor',
        last_name: userData.last_name || userData.name?.split(' ')[1] || '',
        specialty: userData.specialty || 'General Physician',
        verification_status: userData.verification_status || 'approved',
      });
    }
  }, []);

  const fetchProfile = async () => {
    try {
      console.log('Fetching doctor profile...');
      const res = await fetch('/api/doctors/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Doctor data:', data);
        setDoctor(data);
      } else {
        console.error('Failed to fetch profile, status:', res.status);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const initials = doctor ? `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase() : 'D';

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
        headers: { Authorization: `Bearer ${authToken}` },
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
        headers: { Authorization: `Bearer ${authToken}` },
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
    
    // Check if the selected date is blocked
    const selectedDate = form.week_start_date;
    const isDateBlocked = exceptions.some(ex => {
      const exDate = ex.exception_date.includes('T') ? ex.exception_date.split('T')[0] : ex.exception_date;
      return exDate === selectedDate;
    });
    
    if (isDateBlocked) {
      setError('Cannot add time slots on a blocked date. Please remove the block first or select a different date.');
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
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${authToken}` },
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
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${authToken}` },
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
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 78, minHeight: '100vh',
        background: COLORS.navy,
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '4px 0 24px rgba(24,78,119,0.15)',
      }}>
        {/* Logo */}
        <div style={{
          padding: sidebarOpen ? '28px 22px 22px' : '28px 16px 22px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: COLORS.teal,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && (
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', letterSpacing: '-0.5px' }}>
              Medi<span style={{ color: COLORS.mint }}>Core</span>
            </span>
          )}
        </div>

        {/* Doctor info */}
        {sidebarOpen && doctor && (
          <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: '50%',
                background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 16, fontWeight: 700, flexShrink: 0,
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                {initials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.mintLight }}>{doctor.specialty}</p>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '5px 12px', width: 'fit-content' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: doctor.verification_status === 'approved' ? COLORS.mint : '#F59E0B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: doctor.verification_status === 'approved' ? COLORS.mintLight : '#FCD34D', fontWeight: 500 }}>
                {doctor.verification_status === 'approved' ? 'Verified Doctor' : 'Pending Verification'}
              </span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map(({ id, label, route, icon }) => {
            const active = id === 'availability';
            return (
              <button key={id} onClick={() => navigate(route)} style={{
                display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: active ? COLORS.teal : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                marginBottom: 4, fontWeight: active ? 700 : 400,
                fontSize: 15, textAlign: 'left', transition: 'all 0.18s',
              }}>
                <span style={{ flexShrink: 0, opacity: active ? 1 : 0.8 }}>{icon}</span>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                {active && sidebarOpen && (
                  <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: COLORS.mint }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '12px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'transparent', color: COLORS.blush, fontSize: 15, fontWeight: 500,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
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
                  // Parse date components directly to avoid timezone issues
                  const [year, month, day] = newDate.split('-').map(Number);
                  const selectedDate = new Date(year, month - 1, day); // month is 0-indexed
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
            // Check if this date is blocked
            const blockedException = exceptions.find(ex => {
              const exDate = ex.exception_date.includes('T') ? ex.exception_date.split('T')[0] : ex.exception_date;
              return exDate === dayInfo.dateStr;
            });
            const isBlocked = !!blockedException;
            
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
            console.log(`Date ${dayInfo.dateStr} has ${daySlots.length} slots, blocked: ${isBlocked}`);
            const hasSlots = daySlots.length > 0;
            const isToday = dayInfo.dateStr === new Date().toISOString().split('T')[0];
            
            return (
              <div key={dayInfo.dateStr} className={`kda-day-col ${isBlocked ? 'blocked' : (hasSlots ? 'has-slots' : 'empty')}`} style={isBlocked ? {
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
                border: '2px solid #dc2626',
                borderLeft: '5px solid #b91c1c',
                borderRadius: 16,
                padding: 0,
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 120,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              } : hasSlots ? {
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
                border: '2px solid #0ea5e9',
                borderLeft: '5px solid #0284c7',
                borderRadius: 16,
                padding: 0,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 120,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              } : {
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '2px solid #cbd5e1',
                borderLeft: '5px solid #94a3b8',
                borderRadius: 16,
                padding: 0,
                boxShadow: '0 2px 8px rgba(148, 163, 184, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                minHeight: 120,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
                {/* Decorative background pattern */}
                {isBlocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 60,
                    height: 60,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)',
                  }} />
                )}
                {hasSlots && !isBlocked && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 50,
                    height: 50,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                    borderRadius: '50%',
                    transform: 'translate(25%, -25%)',
                  }} />
                )}
                
                <p className={`kda-day-label ${isBlocked ? 'blocked' : (hasSlots ? 'active' : 'inactive')}`} style={isBlocked ? { 
                  color: '#991b1b',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '10px 12px 8px',
                  margin: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
                  borderBottom: '1px solid rgba(185, 28, 28, 0.2)',
                } : hasSlots ? {
                  color: '#0c4a6e',
                  fontWeight: 700,
                  fontSize: 13,
                  padding: '10px 12px 8px',
                  margin: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4), transparent)',
                  borderBottom: '1px solid rgba(14, 165, 233, 0.2)',
                } : {
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: 13,
                  padding: '10px 12px 8px',
                  margin: 0,
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5), transparent)',
                  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                }}>
                  {dayInfo.dayShort}
                  <span style={{ display: 'block', fontSize: 11, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>
                    {dayInfo.month} {dayInfo.dayNum}
                  </span>
                </p>
                {isBlocked ? (
                  // Show blocked date card - beautiful design
                  <div style={{ 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 'calc(100% - 45px)',
                    gap: 8,
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ffffff, #fee2e2)',
                      border: '3px solid #dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}>🚫</div>
                    <span style={{ 
                      fontSize: 13, 
                      fontWeight: 800, 
                      color: '#b91c1c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      textShadow: '0 1px 2px rgba(255,255,255,0.5)',
                    }}>Blocked</span>
                    {blockedException.reason && (
                      <div style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: 8,
                        border: '1px solid rgba(185, 28, 28, 0.3)',
                        marginTop: 2,
                      }}>
                        <p style={{ 
                          fontSize: 11, 
                          color: '#991b1b', 
                          margin: 0, 
                          lineHeight: 1.4, 
                          fontWeight: 600,
                          textAlign: 'center',
                          fontStyle: 'italic',
                        }}>
                          "{blockedException.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : daySlots.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 'calc(100% - 45px)',
                    padding: '12px',
                  }}>
                    <p style={{
                      fontSize: 32,
                      color: '#cbd5e1',
                      margin: 0,
                      lineHeight: 1,
                    }}>○</p>
                    <p style={{
                      fontSize: 11,
                      color: '#94a3b8',
                      margin: '8px 0 0',
                      fontWeight: 500,
                    }}>No slots</p>
                  </div>
                ) : (
                  <div style={{
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 'calc(100% - 45px)',
                    overflowY: 'auto',
                  }}>
                    {daySlots.map((slot) => {
                      const tc = TYPE_CONFIG[slot.consultation_type] || TYPE_CONFIG.online;
                      return (
                        <div key={slot.id} className="kda-slot-chip" style={{ 
                          background: tc.bg, 
                          border: `2px solid ${tc.border}`,
                          borderRadius: 10,
                          padding: '8px 10px',
                          position: 'relative',
                          boxShadow: `0 2px 6px ${tc.border}30`,
                          transition: 'all 0.2s ease',
                        }}>
                          <p className="kda-slot-time" style={{ color: tc.color, fontSize: 12, fontWeight: 700, margin: '0 0 3px' }}>
                            {slot.start_time?.slice(0,5)} – {slot.end_time?.slice(0,5)}
                          </p>
                          <p className="kda-slot-meta" style={{ color: tc.color, fontSize: 10, margin: 0, fontWeight: 600 }}>
                            {tc.label} · {slot.slot_duration_minutes}min
                          </p>
                          <button className="kda-slot-edit" onClick={() => startEditSlot(slot)} style={{
                            position: 'absolute',
                            top: 4,
                            right: 26,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(0,0,0,0.08)',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: 10,
                            lineHeight: '18px',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                          }}>✏️</button>
                          <button className="kda-slot-remove" onClick={() => removeSlot(slot.id)} style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(220, 38, 38, 0.15)',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: 14,
                            lineHeight: '18px',
                            textAlign: 'center',
                            fontWeight: 700,
                            transition: 'all 0.2s ease',
                          }}>×</button>
                        </div>
                      );
                    })}
                  </div>
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
    </div>
    </div>
  );
}