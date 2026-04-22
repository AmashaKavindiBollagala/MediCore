import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export default function RegisterDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [fieldErrors, setFieldErrors]   = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const validateName = (value) => {
    if (!value.trim()) return 'Full name is required.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name can only contain letters, spaces, hyphens, or apostrophes.';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address.';
    if (!value.toLowerCase().endsWith('@gmail.com')) return 'Only Gmail addresses (@gmail.com) are accepted.';
    return '';
  };

  const validatePhone = (value) => {
    if (!value) return '';
    // Strip non-digit characters for length check
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 10) return 'Phone number cannot exceed 10 digits.';
    if (digitsOnly.length > 0 && !/^\+?[\d\s\-().]{7,20}$/.test(value)) return 'Enter a valid phone number.';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password.';
    if (value !== form.password) return 'Passwords do not match.';
    return '';
  };

  const getValidator = (name) => {
    switch (name) {
      case 'name':            return validateName;
      case 'email':           return validateEmail;
      case 'phone':           return validatePhone;
      case 'password':        return validatePassword;
      case 'confirmPassword': return validateConfirmPassword;
      default:                return () => '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'password' && form.confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: value !== form.confirmPassword ? 'Passwords do not match.' : '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = getValidator(name)(value);
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
  };

  // ── Email: block characters that can't lead to @gmail.com ──────────────────
  const handleEmailKeyDown = (e) => {
    const value = e.target.value;
    const atIndex = value.indexOf('@');

    if (atIndex !== -1) {
      const domain = value.slice(atIndex + 1).toLowerCase();
      const isPrintable = e.key.length === 1 && !e.ctrlKey && !e.metaKey;

      if (isPrintable) {
        const gmailPrefix = 'gmail.com';
        const couldStillBeGmail = gmailPrefix.startsWith(domain + e.key);
        if (domain.length > 0 && !couldStillBeGmail && !domain.startsWith('gmail')) {
          e.preventDefault();
          setFieldErrors((prev) => ({ ...prev, email: 'Only Gmail addresses (@gmail.com) are accepted.' }));
          return;
        }
      }
    }

    if (e.key === 'Enter') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  // ── Phone: block the 11th digit from being typed ───────────────────────────
  const handlePhoneKeyDown = (e) => {
    const value = e.target.value;
    const digitsOnly = value.replace(/\D/g, '');
    const isDigit = /^[0-9]$/.test(e.key);

    if (isDigit && digitsOnly.length >= 10) {
      e.preventDefault();
      setFieldErrors((prev) => ({ ...prev, phone: 'Phone number cannot exceed 10 digits.' }));
      return;
    }

    if (e.key === 'Enter') {
      setFieldErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const { name, value } = e.target;
      const msg = getValidator(name)(value);
      setFieldErrors((prev) => ({ ...prev, [name]: msg }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {
      name:            validateName(form.name),
      email:           validateEmail(form.email),
      phone:           validatePhone(form.phone),
      password:        validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.confirmPassword),
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response');
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    border: fieldErrors[fieldName] ? '1.5px solid #B91C1C' : '1.5px solid #DDF4E7',
    background: '#F8FFFE',
    color: '#124170',
    fontFamily: "'DM Sans', sans-serif",
  });

  const inlineErrorStyle = {
    color: '#B91C1C',
    fontSize: '12px',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'DM Sans', sans-serif",
  };

  const ErrorMsg = ({ field }) => fieldErrors[field] ? (
    <p style={inlineErrorStyle}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#B91C1C" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/></svg>
      {fieldErrors[field]}
    </p>
  ) : null;

  const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke="#67C090" strokeWidth="1.8"/>
    </svg>
  );
  const EyeOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="1" y1="1" x2="23" y2="23" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #124170 0%, #26667F 50%, #67C090 100%)' }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border-2 border-white"
              style={{ width: `${120 + i * 80}px`, height: `${120 + i * 80}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 - i * 0.04 }} />
          ))}
        </div>
        <div className="relative z-10 text-white text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="1.8"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}>
            MediCore
          </h1>
          <p className="text-xl opacity-80 mb-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Registering as a <span className="font-semibold capitalize">{role}</span>
          </p>
          <div className="space-y-4 text-left">
            {[
              { step: '01', title: 'Choose your role', done: true },
              { step: '02', title: 'Fill in your details', done: false, active: true },
              { step: '03', title: 'Start your journey', done: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: item.active ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: item.done ? '#67C090' : item.active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)', color: 'white' }}>
                  {item.done ? '✓' : item.step}
                </div>
                <p className="font-semibold text-white">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8 lg:p-10" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>

            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#124170' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>MediCore</span>
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-bold mb-1" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
                Your details
              </h2>
              <p className="text-sm" style={{ color: '#67C090', fontFamily: "'DM Sans', sans-serif" }}>
                Almost there — fill in your information
              </p>
            </div>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: '#FEE2E2', color: '#B91C1C' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#B91C1C" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#124170' }}>Full name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4" stroke="#67C090" strokeWidth="1.8"/>
                    </svg>
                  </div>
                  <input type="text" name="name" value={form.name} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown}
                    placeholder="John Silva" required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle('name')}
                    onFocus={e => { if (!fieldErrors.name) e.target.style.borderColor = '#67C090'; }}
                    onBlurCapture={e => { if (!fieldErrors.name) e.target.style.borderColor = '#DDF4E7'; }}
                  />
                </div>
                <ErrorMsg field="name" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#124170' }}>
                  Email address <span style={{ color: '#67C090', fontSize: '11px', fontWeight: 400 }}>(@gmail.com only)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                      <polyline points="22,6 12,13 2,6" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="you@gmail.com"
                    required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle('email')}
                    onFocus={e => { if (!fieldErrors.email) e.target.style.borderColor = '#67C090'; }}
                    onBlurCapture={e => { if (!fieldErrors.email) e.target.style.borderColor = '#DDF4E7'; }}
                  />
                </div>
                <ErrorMsg field="email" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#124170' }}>
                  Phone number <span style={{ color: '#67C090', fontSize: '11px', fontWeight: 400 }}>(max 10 digits)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.72A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="0 77 123 456"
                    maxLength={15}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle('phone')}
                    onFocus={e => { if (!fieldErrors.phone) e.target.style.borderColor = '#67C090'; }}
                    onBlurCapture={e => { if (!fieldErrors.phone) e.target.style.borderColor = '#DDF4E7'; }}
                  />
                </div>
                <ErrorMsg field="phone" />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#124170' }}>Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#67C090" strokeWidth="1.8"/>
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown}
                    placeholder="Min. 8 characters" required minLength={8}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle('password')}
                    onFocus={e => { if (!fieldErrors.password) e.target.style.borderColor = '#67C090'; }}
                    onBlurCapture={e => { if (!fieldErrors.password) e.target.style.borderColor = '#DDF4E7'; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
                <ErrorMsg field="password" />
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#124170' }}>Confirm password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#67C090" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} onBlur={handleBlur} onKeyDown={handleKeyDown}
                    placeholder="Re-enter your password" required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle('confirmPassword')}
                    onFocus={e => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = '#67C090'; }}
                    onBlurCapture={e => { if (!fieldErrors.confirmPassword) e.target.style.borderColor = '#DDF4E7'; }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
                <ErrorMsg field="confirmPassword" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-xl font-semibold text-white text-sm tracking-wide mt-2"
                style={{
                  background: loading ? '#67C090' : 'linear-gradient(135deg, #124170 0%, #26667F 60%, #67C090 100%)',
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 010 20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Creating account...
                  </span>
                ) : `Create ${role} account →`}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: '#26667F', fontFamily: "'DM Sans', sans-serif" }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#124170' }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}