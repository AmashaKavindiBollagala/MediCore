// kaveesha-DoctorTelemedicinePage.jsx
// Doctor's telemedicine dashboard showing confirmed appointments
// Separated by video/physical with upcoming and past sections

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KaveeshaDoctorAvailability from './kaveesha-DoctorAvailability';
import KaveeshaDoctorProfile from './kaveesha-doctorProfile';
import KaveeshaPrescriptions from './Kaveesha-prescriptions';
import KaveeshaPatientReports from './Kaveesha-patientreports';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

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

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'appointments', label: 'Appointments', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'telemedicine', label: 'My Consultations', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'availability', label: 'Availability', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> },
  { id: 'prescriptions', label: 'Prescriptions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'reports', label: 'Patient Reports', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/></svg> },
  { id: 'profile', label: 'My Profile', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/></svg> },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');

  :root {
    --navy: #0B2D48;
    --navy-mid: #143D5C;
    --navy-light: #1A5276;
    --teal: #0E9E9E;
    --teal-bright: #17B8B8;
    --teal-glow: rgba(14,158,158,0.25);
    --mint: #2ECC8B;
    --mint-soft: rgba(46,204,139,0.15);
    --blue-accent: #3B82F6;
    --blue-glow: rgba(59,130,246,0.25);
    --surface: #F5F8FC;
    --surface-2: #EBF1F8;
    --white: #FFFFFF;
    --text-primary: #0B2D48;
    --text-secondary: #4A6280;
    --text-muted: #8BA4BC;
    --border: rgba(11,45,72,0.08);
    --border-strong: rgba(11,45,72,0.14);
    --shadow-sm: 0 2px 8px rgba(11,45,72,0.06);
    --shadow-md: 0 8px 32px rgba(11,45,72,0.10);
    --shadow-lg: 0 20px 60px rgba(11,45,72,0.14);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 22px;
    --radius-xl: 28px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .tele-root {
    display: flex;
    min-height: 100vh;
    background: var(--surface);
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ── Sidebar ── */
  .sidebar {
    min-height: 100vh;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    transition: width 0.32s cubic-bezier(.4,0,.2,1);
    overflow: hidden;
    flex-shrink: 0;
    position: relative;
    box-shadow: 4px 0 40px rgba(11,45,72,0.25);
  }

  /* Decorative mesh background on sidebar */
  .sidebar::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 200px 300px at 20% 15%, rgba(14,158,158,0.20) 0%, transparent 70%),
      radial-gradient(ellipse 180px 260px at 85% 75%, rgba(46,204,139,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 150px 200px at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Subtle dot grid */
  .sidebar::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 20px 20px;
    pointer-events: none;
  }

  .sidebar-logo {
    padding: 26px 20px 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
    z-index: 1;
  }

  .logo-icon {
    width: 42px; height: 42px;
    border-radius: 13px;
    background: linear-gradient(135deg, var(--teal), var(--mint));
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 6px 20px rgba(14,158,158,0.45), inset 0 1px 0 rgba(255,255,255,0.2);
  }

  .logo-text {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 21px; font-weight: 800;
    color: white; white-space: nowrap;
    letter-spacing: -0.5px;
  }
  .logo-text span { color: var(--teal-bright); }

  .doctor-card {
    padding: 16px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    position: relative;
    z-index: 1;
  }

  .doctor-avatar {
    width: 44px; height: 44px; border-radius: 50%;
    background: linear-gradient(135deg, var(--teal), var(--mint));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px; font-weight: 700; flex-shrink: 0;
    border: 2px solid rgba(255,255,255,0.18);
    box-shadow: 0 4px 16px rgba(14,158,158,0.3);
  }

  .doctor-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 13.5px; font-weight: 700;
    color: white; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .doctor-spec { font-size: 11.5px; color: rgba(14,158,158,0.9); margin-top: 2px; }

  .verified-badge {
    margin-top: 10px;
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(46,204,139,0.10);
    border: 1px solid rgba(46,204,139,0.22);
    border-radius: 30px;
    padding: 4px 11px;
    font-size: 10.5px;
    color: rgba(46,204,139,0.9);
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  .verified-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); flex-shrink: 0; box-shadow: 0 0 6px var(--mint); }

  /* Nav */
  .sidebar-nav { flex: 1; padding: 12px 10px; position: relative; z-index: 1; overflow-y: auto; }

  .nav-btn {
    display: flex; align-items: center; gap: 12px; width: 100%;
    padding: 10px 13px; border-radius: 11px; border: none; cursor: pointer;
    background: transparent;
    color: rgba(255,255,255,0.45);
    margin-bottom: 2px; font-weight: 400;
    font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif;
    text-align: left; transition: all 0.18s ease;
    position: relative; overflow: hidden;
    letter-spacing: -0.1px;
  }
  .nav-btn:hover {
    background: rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.8);
    transform: translateX(2px);
  }
  .nav-btn.active {
    background: rgba(14,158,158,0.18);
    color: white; font-weight: 600;
    border: 1px solid rgba(14,158,158,0.3);
    box-shadow: 0 4px 20px rgba(14,158,158,0.12), inset 0 1px 0 rgba(255,255,255,0.06);
  }
  .nav-btn.active::before {
    content: '';
    position: absolute; left: 0; top: 18%; bottom: 18%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: linear-gradient(180deg, var(--teal-bright), var(--mint));
    box-shadow: 0 0 8px var(--teal-glow);
  }
  .nav-dot { margin-left: auto; width: 6px; height: 6px; border-radius: 50%; background: var(--mint); box-shadow: 0 0 6px var(--mint); }

  .logout-btn {
    display: flex; align-items: center; gap: 12px; width: 100%;
    padding: 11px 13px; border-radius: 11px; border: none; cursor: pointer;
    background: rgba(239,68,68,0.08);
    color: rgba(252,165,165,0.8); font-size: 13.5px; font-weight: 500;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.18s ease;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.15); color: #FCA5A5; }

  /* ── Main ── */
  .main-content { flex: 1; overflow: auto; min-width: 0; }

  /* Hero Header */
  .hero-header {
    position: relative; overflow: hidden;
    background: var(--navy);
    padding: 0;
  }

  /* Layered geometric background */
  .hero-header::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 500px 400px at 80% -20%, rgba(14,158,158,0.22) 0%, transparent 60%),
      radial-gradient(ellipse 400px 350px at -10% 110%, rgba(59,130,246,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 300px 300px at 50% 50%, rgba(46,204,139,0.06) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-header::after {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  .hero-inner {
    max-width: 1200px; margin: 0 auto;
    position: relative; z-index: 1;
    padding: 36px 40px 40px;
  }

  .hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }

  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 7px;
    background: rgba(14,158,158,0.15);
    border: 1px solid rgba(14,158,158,0.25);
    border-radius: 30px; padding: 5px 13px;
    font-size: 11px; font-weight: 700;
    color: var(--teal-bright); letter-spacing: 0.8px;
    text-transform: uppercase; margin-bottom: 12px;
  }
  .eyebrow-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--teal-bright); animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(0.7); } }

  .hero-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 34px; font-weight: 800;
    color: white; letter-spacing: -1px;
    line-height: 1.12;
  }
  .hero-title-accent {
    background: linear-gradient(135deg, var(--teal-bright), var(--mint));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub { color: rgba(255,255,255,0.5); font-size: 13.5px; margin-top: 8px; font-weight: 400; }

  .hero-back-btn {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.14);
    color: rgba(255,255,255,0.85); padding: 11px 20px;
    border-radius: var(--radius-sm); font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
    backdrop-filter: blur(12px);
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap; display: flex; align-items: center; gap: 7px;
  }
  .hero-back-btn:hover {
    background: rgba(255,255,255,0.13);
    border-color: rgba(255,255,255,0.24);
    transform: translateX(-2px);
  }

  /* Stats */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 28px; }
  .stat-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: var(--radius-md); padding: 16px 18px;
    backdrop-filter: blur(10px);
    transition: all 0.22s ease;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
  }
  .stat-card:hover { background: rgba(255,255,255,0.10); transform: translateY(-2px); }
  .stat-icon { font-size: 20px; margin-bottom: 10px; }
  .stat-num {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 28px; font-weight: 800;
    color: white; line-height: 1;
  }
  .stat-label { font-size: 11.5px; color: rgba(255,255,255,0.5); margin-top: 5px; font-weight: 500; }

  /* Divider wave between hero and body */
  .hero-wave {
    position: relative; height: 32px;
    background: var(--navy);
    margin-bottom: -1px;
  }
  .hero-wave::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0;
    height: 32px;
    background: var(--surface);
    border-radius: 32px 32px 0 0;
  }

  /* Body */
  .body-area { max-width: 1200px; margin: 0 auto; padding: 32px 40px 56px; }

  /* Error */
  .error-bar {
    background: #FFF5F5; border: 1.5px solid #FECACA;
    color: #B91C1C; border-radius: var(--radius-md);
    padding: 14px 18px; margin-bottom: 24px; font-size: 13.5px;
    display: flex; align-items: center; gap: 8px;
  }

  /* Tab switcher */
  .tab-switcher {
    display: inline-flex;
    background: white;
    border-radius: var(--radius-xl);
    padding: 5px;
    margin-bottom: 32px;
    box-shadow: var(--shadow-md), 0 0 0 1px var(--border);
  }

  .tab-btn {
    padding: 12px 26px;
    border-radius: calc(var(--radius-xl) - 5px);
    border: none;
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: all 0.25s cubic-bezier(.4,0,.2,1);
    font-family: 'Plus Jakarta Sans', sans-serif;
    display: flex; align-items: center; gap: 8px;
    color: var(--text-muted); background: transparent;
    letter-spacing: -0.2px;
  }
  .tab-btn.active-video {
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: white;
    box-shadow: 0 6px 22px rgba(37,99,235,0.35), 0 2px 8px rgba(37,99,235,0.2);
    transform: translateY(-1px);
  }
  .tab-btn.active-physical {
    background: linear-gradient(135deg, var(--navy-mid), var(--teal));
    color: white;
    box-shadow: 0 6px 22px rgba(20,61,92,0.35), 0 2px 8px rgba(14,158,158,0.2);
    transform: translateY(-1px);
  }
  .tab-btn:not(.active-video):not(.active-physical):hover {
    background: var(--surface);
    color: var(--text-secondary);
  }

  /* Section */
  .section { margin-bottom: 38px; }

  .section-header { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; }

  .section-bar-video {
    width: 4px; height: 28px; border-radius: 4px;
    background: linear-gradient(180deg, #2563EB, #60A5FA); flex-shrink: 0;
    box-shadow: 0 0 10px rgba(37,99,235,0.3);
  }
  .section-bar-physical {
    width: 4px; height: 28px; border-radius: 4px;
    background: linear-gradient(180deg, var(--navy-mid), var(--teal)); flex-shrink: 0;
    box-shadow: 0 0 10px var(--teal-glow);
  }
  .section-bar-past {
    width: 4px; height: 28px; border-radius: 4px;
    background: linear-gradient(180deg, #94A3B8, #CBD5E1); flex-shrink: 0;
  }
  .section-bar-completed {
    width: 4px; height: 28px; border-radius: 4px;
    background: linear-gradient(180deg, #059669, #34D399); flex-shrink: 0;
    box-shadow: 0 0 10px rgba(5,150,105,0.3);
  }

  .section-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 20px; font-weight: 700;
    color: var(--text-primary); letter-spacing: -0.4px;
  }

  .count-pill {
    padding: 4px 12px; border-radius: 30px;
    font-size: 11.5px; font-weight: 700;
    letter-spacing: 0.2px;
  }
  .count-teal { background: #DBEAFE; color: #1D4ED8; }
  .count-navy { background: #EFF6FF; color: #1D4ED8; }
  .count-purple { background: rgba(14,158,158,0.12); color: var(--navy-light); border: 1px solid rgba(14,158,158,0.2); }
  .count-gray { background: var(--surface-2); color: var(--text-secondary); }
  .count-completed { background: #D1FAE5; color: #065F46; }

  /* Empty State */
  .empty-state {
    background: white;
    border-radius: var(--radius-xl);
    padding: 52px 32px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    border: 1.5px dashed var(--border-strong);
  }
  .empty-emoji { font-size: 48px; margin-bottom: 14px; display: block; }
  .empty-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 16px; font-weight: 700;
    color: var(--navy-mid); margin-bottom: 6px;
  }
  .empty-sub { font-size: 13px; color: var(--text-muted); }

  /* Appointment Cards */
  .appt-grid { display: flex; flex-direction: column; gap: 14px; }

  .appt-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 22px 24px;
    box-shadow: var(--shadow-sm);
    border: 1.5px solid var(--border);
    transition: all 0.24s cubic-bezier(.4,0,.2,1);
    display: flex; align-items: flex-start; gap: 20px;
    position: relative; overflow: hidden;
  }

  /* Accent left border */
  .appt-card::before {
    content: '';
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 4px; border-radius: 4px 0 0 4px;
  }

  /* Subtle top highlight line */
  .appt-card::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 40%, transparent 100%);
    pointer-events: none;
  }

  .appt-card.video-card::before { background: linear-gradient(180deg, #2563EB, #60A5FA); }
  .appt-card.physical-card::before { background: linear-gradient(180deg, var(--navy-mid), var(--teal)); }
  .appt-card.past-card::before { background: linear-gradient(180deg, #CBD5E1, #94A3B8); }
  .appt-card.completed-card::before { background: linear-gradient(180deg, #059669, #34D399); }

  .appt-card.completed-card {
    background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
    border: 1.5px solid #A7F3D0;
  }

  .appt-card:not(.past-card):not(.completed-card):hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
    border-color: rgba(14,158,158,0.2);
  }
  .appt-card.past-card { opacity: 0.68; }

  /* Date badge */
  .date-badge {
    border-radius: var(--radius-md); padding: 14px 16px;
    text-align: center; flex-shrink: 0; min-width: 70px;
    position: relative; overflow: hidden;
  }
  .date-badge::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 50%;
    background: rgba(255,255,255,0.12);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .date-badge-video {
    background: linear-gradient(160deg, #2563EB 0%, #3B82F6 100%);
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
  }
  .date-badge-physical {
    background: linear-gradient(160deg, var(--navy-mid) 0%, var(--teal) 100%);
    box-shadow: 0 6px 20px rgba(14,158,158,0.3);
  }
  .date-badge-past { background: linear-gradient(160deg, #94A3B8 0%, #CBD5E1 100%); }
  .date-badge-completed {
    background: linear-gradient(160deg, #059669 0%, #10B981 100%);
    box-shadow: 0 6px 18px rgba(5,150,105,0.3);
  }

  .date-day {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 27px; font-weight: 800;
    color: white; line-height: 1;
    position: relative; z-index: 1;
  }
  .date-month {
    font-size: 10px; color: rgba(255,255,255,0.82);
    text-transform: uppercase; margin-top: 4px;
    font-weight: 700; letter-spacing: 0.8px;
    position: relative; z-index: 1;
  }

  /* Card Body */
  .card-body { flex: 1; min-width: 0; }

  .patient-name {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 17px; font-weight: 700;
    color: var(--text-primary); margin-bottom: 10px;
    letter-spacing: -0.3px;
  }
  .patient-name.past { color: var(--text-muted); }
  .patient-name.completed { color: #065F46; }

  .card-meta { display: flex; align-items: center; gap: 18px; margin-bottom: 10px; flex-wrap: wrap; }

  .meta-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: var(--text-secondary);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px; padding: 4px 10px;
    font-weight: 500;
  }
  .meta-icon { font-size: 13px; }

  .symptoms-text { font-size: 13px; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.55; }
  .symptoms-label { font-weight: 700; color: var(--text-primary); }

  /* Action row */
  .card-actions { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; margin-top: 14px; }

  .btn-video {
    background: linear-gradient(135deg, #2563EB, #3B82F6);
    color: white; border: none; cursor: pointer;
    padding: 10px 20px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 700;
    display: flex; align-items: center; gap: 7px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 4px 16px rgba(37,99,235,0.35);
    transition: all 0.2s ease;
    letter-spacing: -0.1px;
  }
  .btn-video:hover {
    box-shadow: 0 8px 24px rgba(37,99,235,0.5);
    transform: translateY(-2px);
  }

  .btn-cancel {
    background: white;
    color: #EF4444; border: 1.5px solid rgba(239,68,68,0.25); cursor: pointer;
    padding: 10px 18px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all 0.2s ease;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-cancel:hover {
    background: #FEF2F2;
    border-color: rgba(239,68,68,0.45);
    transform: translateY(-2px);
    box-shadow: 0 4px 14px rgba(239,68,68,0.15);
  }

  .btn-complete {
    background: linear-gradient(135deg, #059669, #10B981);
    color: white; border: none; cursor: pointer;
    padding: 10px 18px; border-radius: var(--radius-sm);
    font-size: 13px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    box-shadow: 0 4px 16px rgba(5,150,105,0.3);
    transition: all 0.2s ease;
    display: flex; align-items: center; gap: 6px;
  }
  .btn-complete:hover {
    box-shadow: 0 8px 24px rgba(5,150,105,0.45);
    transform: translateY(-2px);
  }

  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 11px; border-radius: 8px;
    font-size: 11.5px; font-weight: 700;
    letter-spacing: 0.1px;
  }
  .badge-confirmed {
    background: #ECFDF5; color: #065F46;
    border: 1px solid #A7F3D0;
  }
  .badge-inperson {
    background: #FFF7ED; color: #92400E;
    border: 1px solid #FED7AA;
  }
  .badge-completed {
    background: #D1FAE5; color: #065F46;
    border: 1px solid #6EE7B7;
  }

  /* Loading */
  .loading-screen {
    min-height: 100vh;
    background: var(--surface);
    display: flex; align-items: center; justify-content: center;
  }
  .loading-card {
    background: white; border-radius: var(--radius-xl);
    padding: 52px; box-shadow: var(--shadow-lg);
    text-align: center; border: 1px solid var(--border);
    position: relative; overflow: hidden;
  }
  .loading-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, var(--teal), var(--mint), var(--blue-accent));
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
  .spinner {
    width: 52px; height: 52px;
    border: 3px solid var(--surface-2);
    border-top-color: var(--teal);
    border-right-color: var(--mint);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 17px; font-weight: 700; color: var(--text-primary);
  }
  .loading-sub { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

  /* Scrollbar styling */
  .sidebar-nav::-webkit-scrollbar { width: 4px; }
  .sidebar-nav::-webkit-scrollbar-track { background: transparent; }
  .sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
`;

const DushaniDoctorTelemedicinePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('video');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => { 
    fetchProfile();
    fetchDoctorAppointments();
  }, []);

  // Refresh when navigating back with refresh state
  useEffect(() => {
    if (location.state?.refresh) {
      fetchDoctorAppointments();
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctors/me/profile', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDoctor(data);
        setUser(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = doctor 
    ? `${doctor.first_name?.[0] || ''}${doctor.last_name?.[0] || ''}`.toUpperCase()
    : 'D';

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/doctor/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Fetch both CONFIRMED and COMPLETED appointments
        const relevant = (data.data || []).filter(appt => 
          appt.status === 'CONFIRMED' || appt.status === 'COMPLETED'
        );
        setAppointments(relevant);
      } else {
        setError(data.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinVideoCall = (appointmentId) => {
    navigate(`/telemedicine/${appointmentId}`);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Cancelled by doctor' }),
      });
      const data = await response.json();
      if (data.success || data.message) {
        // Refresh the appointments list
        fetchDoctorAppointments();
      } else {
        setError(data.error || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleMarkComplete = async (appointmentId) => {
    if (!window.confirm('Mark this appointment as completed?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        fetchDoctorAppointments();
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  };

  const videoAppointments = appointments.filter(
    appt => appt.consultation_type === 'video' || appt.consultation_type === 'online'
  );
  const physicalAppointments = appointments.filter(
    appt => appt.consultation_type === 'physical'
  );

  const now = new Date();
  
  // Separate by status and time
  const upcomingVideo = videoAppointments.filter(appt => 
    appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) >= now
  );
  const completedVideo = videoAppointments.filter(appt => 
    appt.status === 'COMPLETED' || (appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) < now)
  );
  const upcomingPhysical = physicalAppointments.filter(appt => 
    appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) >= now
  );
  const completedPhysical = physicalAppointments.filter(appt => 
    appt.status === 'COMPLETED' || (appt.status === 'CONFIRMED' && new Date(appt.scheduled_at) < now)
  );

  const sortByDate = (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at);
  upcomingVideo.sort(sortByDate);
  completedVideo.sort(sortByDate).reverse();
  upcomingPhysical.sort(sortByDate);
  completedPhysical.sort(sortByDate).reverse();

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const timeMatch = dateTimeStr.match(/T(\d{2}:\d{2})/);
    if (timeMatch) {
      const [hours, minutes] = timeMatch[1].split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return dateTimeStr;
  };

  const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const getDateObject = (dateTimeStr) => {
    if (!dateTimeStr) return new Date();
    const datePart = dateTimeStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="loading-screen">
          <div className="loading-card">
            <div className="spinner" />
            <p className="loading-text">Loading your consultations</p>
            <p className="loading-sub">Please wait a moment…</p>
          </div>
        </div>
      </>
    );
  }

  const AppointmentCard = ({ appt, type, isCompleted }) => {
    const date = getDateObject(appt.scheduled_at);
    const cardClass = isCompleted 
      ? 'appt-card completed-card' 
      : type === 'video' 
        ? 'appt-card video-card' 
        : 'appt-card physical-card';
    const badgeClass = type === 'video' ? 'date-badge date-badge-video' : 'date-badge date-badge-physical';
    return (
      <div className={cardClass}>
        <div className={isCompleted ? 'date-badge date-badge-completed' : badgeClass}>
          <div className="date-day">{date.getDate()}</div>
          <div className="date-month">{date.toLocaleString('default', { month: 'short' })}</div>
        </div>
        <div className="card-body">
          <div className={`patient-name${isCompleted ? ' completed' : ''}`}>
            {appt.patient_name}
          </div>
          <div className="card-meta">
            <span className="meta-item"><span className="meta-icon">🕒</span>{formatTime(appt.scheduled_at)}</span>
            <span className="meta-item"><span className="meta-icon">📅</span>{formatDate(appt.scheduled_at)}</span>
          </div>
          {appt.symptoms && (
            <p className="symptoms-text">
              <span className="symptoms-label">Symptoms: </span>{appt.symptoms}
            </p>
          )}
          {!isCompleted && (
            <div className="card-actions">
              {type === 'video' && (
                <>
                  <button className="btn-video" onClick={() => handleJoinVideoCall(appt.id)}>
                    🎥 Start Video Call
                  </button>
                  <button className="btn-cancel" onClick={() => handleCancelAppointment(appt.id)}>
                    ✕ Cancel
                  </button>
                </>
              )}
              {type === 'physical' && (
                <>
                  <button className="btn-complete" onClick={() => handleMarkComplete(appt.id)}>
                    ✓ Mark Complete
                  </button>
                  <span className="badge badge-inperson">🏥 In-Person</span>
                </>
              )}
              <span className="badge badge-confirmed">✅ Confirmed</span>
            </div>
          )}
          {isCompleted && (
            <div className="card-actions">
              <span className="badge badge-completed">✓ Completed</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="tele-root">
        {/* ── Sidebar ── */}
        <aside className="sidebar" style={{ width: sidebarOpen ? 260 : 76 }}>
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            {sidebarOpen && (
              <span className="logo-text">Medi<span>Core</span></span>
            )}
          </div>

          {/* Doctor info */}
          {sidebarOpen && doctor && (
            <div className="doctor-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="doctor-avatar">{initials}</div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="doctor-name">Dr. {doctor.first_name} {doctor.last_name}</div>
                  <div className="doctor-spec">{doctor.specialty}</div>
                </div>
              </div>
              <div className="verified-badge">
                <div className="verified-dot" style={{ background: doctor.verification_status === 'approved' ? '#2ECC8B' : '#F59E0B', boxShadow: doctor.verification_status === 'approved' ? '0 0 6px #2ECC8B' : '0 0 6px #F59E0B' }} />
                <span style={{ color: doctor.verification_status === 'approved' ? 'rgba(46,204,139,0.9)' : '#FCD34D' }}>
                  {doctor.verification_status === 'approved' ? 'Verified Doctor' : 'Pending Verification'}
                </span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ id, label, icon }) => {
              const active = id === 'telemedicine';
              const handleClick = id === 'overview'
                ? () => navigate('/doctor-dashboard')
                : id === 'appointments'
                ? () => navigate('/doctor-appointments')
                : id === 'telemedicine'
                ? () => navigate('/doctor-telemedicine')
                : id === 'availability'
                ? () => navigate('/doctor-availability')
                : id === 'prescriptions'
                ? () => navigate('/doctor-prescriptions')
                : id === 'reports'
                ? () => navigate('/doctor-reports')
                : id === 'profile'
                ? () => navigate('/doctor-profile')
                : () => {};
              return (
                <button key={id} onClick={handleClick} className={`nav-btn${active ? ' active' : ''}`}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
                  {active && sidebarOpen && <div className="nav-dot" />}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}>
            <button onClick={logout} className="logout-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main-content">
          {/* Hero Header */}
          <div className="hero-header">
            <div className="hero-inner">
              <div className="hero-top">
                <div>
                  <div className="hero-eyebrow">
                    <div className="eyebrow-dot" />
                    Doctor Portal
                  </div>
                  <h1 className="hero-title">
                    My <span className="hero-title-accent">Consultations</span>
                  </h1>
                  <p className="hero-sub">Manage and track your patient consultations</p>
                </div>
                <button className="hero-back-btn" onClick={() => navigate('/doctor-appointments')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  All Appointments
                </button>
              </div>
            </div>
          </div>

          {/* Wave divider */}
          <div className="hero-wave" />

          {/* Body */}
          <div className="body-area">
            {error && <div className="error-bar">⚠️ {error}</div>}

            {/* Tab Switcher */}
            <div className="tab-switcher">
              <button
                onClick={() => setActiveTab('video')}
                className={`tab-btn${activeTab === 'video' ? ' active-video' : ''}`}
              >
                🎥 Video Consultations
              </button>
              <button
                onClick={() => setActiveTab('physical')}
                className={`tab-btn${activeTab === 'physical' ? ' active-physical' : ''}`}
              >
                🏥 Physical Visits
              </button>
            </div>

            {/* Video Tab */}
            {activeTab === 'video' && (
              <div>
                {/* Upcoming Video */}
                <div className="section">
                  <div className="section-header">
                    <div className="section-bar-video" />
                    <h2 className="section-title">Upcoming Video Calls</h2>
                    <span className={`count-pill count-teal`}>{upcomingVideo.length}</span>
                  </div>
                  {upcomingVideo.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-emoji">📅</span>
                      <p className="empty-title">No upcoming video calls</p>
                      <p className="empty-sub">Your scheduled video consultations will appear here</p>
                    </div>
                  ) : (
                    <div className="appt-grid">
                      {upcomingVideo.map(appt => (
                        <AppointmentCard key={appt.id} appt={appt} type="video" isCompleted={false} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Video */}
                <div className="section">
                  <div className="section-header">
                    <div className="section-bar-completed" />
                    <h2 className="section-title">Completed Video Calls</h2>
                    <span className="count-pill count-completed">{completedVideo.length}</span>
                  </div>
                  {completedVideo.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-emoji">✓</span>
                      <p className="empty-title">No completed video calls</p>
                      <p className="empty-sub">Your completed consultation history will appear here</p>
                    </div>
                  ) : (
                    <div className="appt-grid">
                      {completedVideo.map(appt => (
                        <AppointmentCard key={appt.id} appt={appt} type="video" isCompleted={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Physical Tab */}
            {activeTab === 'physical' && (
              <div>
                {/* Upcoming Physical */}
                <div className="section">
                  <div className="section-header">
                    <div className="section-bar-physical" />
                    <h2 className="section-title">Upcoming Physical Visits</h2>
                    <span className="count-pill count-purple">{upcomingPhysical.length}</span>
                  </div>
                  {upcomingPhysical.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-emoji">🏥</span>
                      <p className="empty-title">No upcoming physical visits</p>
                      <p className="empty-sub">Your scheduled in-person appointments will appear here</p>
                    </div>
                  ) : (
                    <div className="appt-grid">
                      {upcomingPhysical.map(appt => (
                        <AppointmentCard key={appt.id} appt={appt} type="physical" isCompleted={false} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Physical */}
                <div className="section">
                  <div className="section-header">
                    <div className="section-bar-completed" />
                    <h2 className="section-title">Completed Physical Visits</h2>
                    <span className="count-pill count-completed">{completedPhysical.length}</span>
                  </div>
                  {completedPhysical.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-emoji">✓</span>
                      <p className="empty-title">No completed physical visits</p>
                      <p className="empty-sub">Your completed visit history will appear here</p>
                    </div>
                  ) : (
                    <div className="appt-grid">
                      {completedPhysical.map(appt => (
                        <AppointmentCard key={appt.id} appt={appt} type="physical" isCompleted={true} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DushaniDoctorTelemedicinePage;