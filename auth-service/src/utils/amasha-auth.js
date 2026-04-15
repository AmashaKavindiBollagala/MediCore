// src/utils/auth.js
// Helpers for storing and using the JWT token throughout the app

// --- Token Storage ---

export const getToken = () => localStorage.getItem('token');

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isLoggedIn = () => !!getToken();

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// --- Authenticated Fetch ---
// Use this instead of plain fetch() for any protected API calls.
// It automatically adds the Authorization header.

export const authFetch = async (path, options = {}) => {
  const token = getToken();
  const baseUrl = import.meta.env.VITE_API_URL;

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  // If token expired or invalid, redirect to login
  if (res.status === 401 || res.status === 403) {
    logout();
    return null;
  }

  return res;
};

// Usage example:
//
//   import { authFetch } from '../utils/auth';
//
//   const res = await authFetch('/api/appointments');
//   const data = await res.json();