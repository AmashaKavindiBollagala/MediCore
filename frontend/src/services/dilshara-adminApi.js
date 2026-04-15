// frontend/src/services/dilshara-adminApi.js
// All API calls used by the admin dashboard frontend
// BASE points to your api-gateway which proxies /api/admin/* → admin-service

const BASE = '/api';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});

// ── Generic request helper ────────────────────────────────────────────────────
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Dashboard stats ───────────────────────────────────────────────────────────
export const getStats = () => request('/admin/stats');

// ── Doctor verification ───────────────────────────────────────────────────────
// status: 'all' | 'pending' | 'approved' | 'rejected'
export const getDoctors = (status = 'all') =>
  request(`/admin/doctors?status=${status}`);

export const getDoctorById = (id) =>
  request(`/admin/doctors/${id}`);

// status: 'approved' | 'rejected'
export const verifyDoctor = (id, status, note = '') =>
  request(`/admin/doctors/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });

// ── Users (read-only) ─────────────────────────────────────────────────────────
export const getUsers = (role = 'all') =>
  request(`/admin/users?role=${role}`);

// ── AI License Analysis ───────────────────────────────────────────────────────
// Uploads the license image to the backend which calls Claude Vision API.
// The backend handles the AI analysis and persists the results.
export const analyseLicenseWithAI = async (doctorId, imageUrl) => {
  // Fetch the image from URL and convert to blob for upload
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('license', blob, 'license.jpg');
  
  // Upload to backend AI endpoint
  const uploadResponse = await fetch(`${BASE}/admin/doctors/${doctorId}/ai-analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      // Don't set Content-Type - browser will set it with boundary for FormData
    },
    body: formData,
  });

  const data = await uploadResponse.json();
  if (!uploadResponse.ok) throw new Error(data.error || 'AI analysis failed');
  
  // Transform backend response to match frontend expectations
  const analysis = data.analysis;
  return {
    license_number: analysis.license_number,
    doctor_name: analysis.doctor_name,
    specialty: analysis.specialty,
    issuing_authority: analysis.issuing_authority,
    issue_date: analysis.issue_date,
    expiry_date: analysis.expiry_date,
    is_valid_format: analysis.is_valid_document,
    confidence: analysis.confidence > 0.8 ? 'high' : analysis.confidence > 0.5 ? 'medium' : 'low',
    flags: analysis.notes ? [analysis.notes] : [],
  };
};