// frontend/src/components/dilshara-AdminRoute.jsx
// Route guard — protects all /admin/* routes
// TEMPORARILY DISABLED for development - bypasses authentication

import React from 'react';

export default function DilsharaAdminRoute({ children }) {
  // TEMPORARY: Skip authentication for development
  // TODO: Re-enable authentication when admin login is ready
  
  // Simulate admin user for development
  const mockAdminUser = {
    id: 'temp-admin-id',
    email: 'admin@medicore.dev',
    role: 'admin'
  };
  
  // Store mock user in localStorage for API calls
  if (!localStorage.getItem('token')) {
    localStorage.setItem('token', 'dev-temp-token');
    localStorage.setItem('user', JSON.stringify(mockAdminUser));
  }
  
  return children;
}