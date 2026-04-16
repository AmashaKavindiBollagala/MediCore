// frontend/src/components/dilshara-AdminRoute.jsx
// Route guard — protects all /admin/* routes
// Redirects to /login if no token, shows 403 if not admin role

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function DilsharaAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif", gap: 16,
      }}>
        <div style={{ fontSize: 56 }}>🔒</div>
        <h2 style={{ color: '#fff', fontFamily: "'Syne', sans-serif", fontSize: 24, margin: 0 }}>
          Access Denied
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: 0 }}>
          You need admin privileges to view this page.
        </p>
        <a href="/" style={{ color: '#67C090', fontSize: 14, marginTop: 8 }}>← Go back home</a>
      </div>
    );
  }

  return children;
}