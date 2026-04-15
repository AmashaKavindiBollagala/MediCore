import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ROLES = [
  {
    value: 'patient',
    label: 'Patient',
    desc: 'Book & manage appointments',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: 'doctor',
    label: 'Doctor',
    desc: 'Manage patients & schedule',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('patient');

  const handleContinue = () => {
    // Pass selected role forward however your app needs
    navigate(`/register/details?role=${selectedRole}`);
  };

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
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M22 8v8M18 12h8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M22 4C12.06 4 4 12.06 4 22s8.06 18 18 18 18-8.06 18-18S31.94 4 22 4zm0 4a14 14 0 110 28A14 14 0 0122 8z" fill="white" opacity="0.5"/>
              </svg>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", letterSpacing: '-1px' }}>Join MediCore</h1>
          <p className="text-lg opacity-80 mb-12" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your health, our priority</p>

          <div className="space-y-4 text-left">
            {[
              { step: '01', title: 'Choose your role', desc: 'Patient or doctor' },
              { step: '02', title: 'Secure your account', desc: 'Strong password protection' },
              { step: '03', title: 'Start your journey', desc: 'Access all platform features' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>{item.step}</div>
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-xs opacity-70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-3xl p-8 lg:p-10" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)' }}>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#124170' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <span className="text-xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>MediCore</span>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-1" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
                Who are you?
              </h2>
              <p className="text-sm" style={{ color: '#67C090' }}>
                Select your role to get started
              </p>
            </div>

            {/* Role Cards */}
            <div className="flex flex-col gap-4 mb-8">
              {ROLES.map((r) => {
                const isSelected = selectedRole === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className="flex items-center gap-5 p-5 rounded-2xl transition-all text-left w-full"
                    style={{
                      border: isSelected ? '2px solid #26667F' : '1.5px solid #DDF4E7',
                      background: isSelected ? '#DDF4E7' : '#F8FFFE',
                      color: isSelected ? '#124170' : '#26667F',
                      boxShadow: isSelected ? '0 4px 20px rgba(18,65,112,0.10)' : 'none',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        background: isSelected ? '#124170' : '#DDF4E7',
                        color: isSelected ? 'white' : '#67C090',
                      }}
                    >
                      {r.icon}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <p className="font-bold text-base mb-0.5" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
                        {r.label}
                      </p>
                      <p className="text-xs" style={{ color: '#26667F' }}>{r.desc}</p>
                    </div>

                    {/* Selected checkmark */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all"
                      style={{
                        background: isSelected ? '#124170' : '#DDF4E7',
                      }}
                    >
                      {isSelected && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Continue Button */}
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-4 rounded-xl font-semibold text-white text-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #124170 0%, #26667F 60%, #67C090 100%)', fontFamily: "'DM Sans', sans-serif" }}
            >
              Continue as {ROLES.find(r => r.value === selectedRole)?.label} →
            </button>

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