import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PATIENT_API = import.meta.env.VITE_PATIENT_API_URL || 'http://localhost:3002';

export default function PatientProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '',
    address: '', blood_group: '', emergency_contact: ''
  });
  const [msg, setMsg]       = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    
    // Get user data from localStorage as fallback
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    fetch(`${PATIENT_API}/api/patients/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { 
        if (data && !data.message) {
          setForm(prev => ({ ...prev, ...data }));
        } else if (userData) {
          // Fallback to localStorage user data
          setForm(prev => ({ 
            ...prev, 
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone
          }));
        }
      })
      .catch(() => {
        // On error, use localStorage data
        if (userData) {
          setForm(prev => ({ 
            ...prev, 
            name: userData.name || prev.name,
            email: userData.email || prev.email,
            phone: userData.phone || prev.phone
          }));
        }
      })
      .finally(() => setFetching(false));
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${PATIENT_API}/api/patients/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save');
      setMsg({ text: 'Profile saved successfully!', type: 'success' });
    } catch {
      setMsg({ text: 'Failed to save profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const inputStyle = {
    border: '1.5px solid #DDF4E7',
    background: '#F8FFFE',
    color: '#124170',
    fontFamily: "'DM Sans', sans-serif",
  };

  const fields = [
    { label: 'Full name',         key: 'name',              type: 'text',  placeholder: 'John Silva' },
    { label: 'Email address',     key: 'email',             type: 'email', placeholder: 'john@example.com' },
    { label: 'Phone number',      key: 'phone',             type: 'tel',   placeholder: '+94 77 123 4567' },
    { label: 'Date of birth',     key: 'dob',               type: 'date',  placeholder: '' },
    { label: 'Blood group',       key: 'blood_group',       type: 'text',  placeholder: 'A+' },
    { label: 'Emergency contact', key: 'emergency_contact', type: 'text',  placeholder: 'Name & phone number' },
  ];

  if (fetching) return (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#F1FAEE' }}>
      <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#DDF4E7" strokeWidth="3"/>
        <path d="M12 2a10 10 0 010 20" stroke="#124170" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    </div>
  );

  return (
    <div className="flex-1 p-8 min-h-screen" style={{ background: '#F1FAEE' }}>
      <div className="max-w-2xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
            My Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: '#26667F', fontFamily: "'DM Sans', sans-serif" }}>
            Keep your health information accurate and up to date.
          </p>
        </div>

        {msg.text && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              background: msg.type === 'success' ? '#DDF4E7' : '#FEE2E2',
              color: msg.type === 'success' ? '#124170' : '#B91C1C',
              border: `1px solid ${msg.type === 'success' ? '#67C090' : '#FECACA'}`,
            }}>
            {msg.type === 'success'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#124170" strokeWidth="2" strokeLinecap="round"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91C1C" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/></svg>
            }
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8" style={{ border: '1px solid #DDF4E7' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {fields.map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#124170' }}>{label}</label>
                <input
                  type={type}
                  value={form[key] || ''}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#67C090'}
                  onBlur={e => e.target.style.borderColor = '#DDF4E7'}
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#124170' }}>Address</label>
              <textarea
                rows={3}
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St, Colombo 03"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#67C090'}
                onBlur={e => e.target.style.borderColor = '#DDF4E7'}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="mt-6 px-8 py-3.5 rounded-xl font-semibold text-white text-sm"
            style={{
              background: loading ? '#67C090' : 'linear-gradient(135deg, #124170 0%, #26667F 60%, #67C090 100%)',
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}