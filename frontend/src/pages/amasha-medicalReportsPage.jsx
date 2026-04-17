import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function MedicalReports() {
  const navigate = useNavigate();
  const [reports, setReports]       = useState([]);
  const [file, setFile]             = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading]   = useState(false);
  const [msg, setMsg]               = useState({ text: '', type: '' });
  const [dragging, setDragging]     = useState(false);

  const token = localStorage.getItem('token');

  const fetchReports = () => {
    fetch(`${API_URL}/api/patients/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setReports).catch(() => {});
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchReports();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('description', description);
    try {
      const res = await fetch(`${API_URL}/api/patients/reports`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      setMsg({ text: 'Report uploaded successfully!', type: 'success' });
      setFile(null);
      setDescription('');
      fetchReports();
    } catch {
      setMsg({ text: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMsg({ text: '', type: '' }), 3000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const inputStyle = { border: '1.5px solid #DDF4E7', background: '#F8FFFE', color: '#124170', fontFamily: "'DM Sans', sans-serif" };

  return (
    <div className="flex-1 p-8 min-h-screen" style={{ background: '#F1FAEE' }}>
      <div className="mb-7">
        <h1 className="text-3xl font-bold" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>Medical Reports</h1>
        <p className="text-sm mt-1" style={{ color: '#26667F' }}>Upload and manage your medical documents securely.</p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl p-6 mb-6" style={{ border: '1px solid #DDF4E7' }}>
        <h2 className="text-lg font-semibold mb-5" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
          Upload new report
        </h2>

        {msg.text && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: msg.type === 'success' ? '#DDF4E7' : '#FEE2E2', color: msg.type === 'success' ? '#124170' : '#B91C1C' }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#124170' }}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Blood test results — April 2026"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#67C090'}
              onBlur={e => e.target.style.borderColor = '#DDF4E7'}
            />
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
            className="rounded-2xl p-10 text-center cursor-pointer transition-all"
            style={{
              border: `2px dashed ${dragging ? '#124170' : file ? '#67C090' : '#76C893'}`,
              background: dragging ? '#F1FAEE' : file ? '#DDF4E7' : '#F8FFFE',
            }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: file ? '#DDF4E7' : '#F1FAEE' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  stroke={file ? '#124170' : '#76C893'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {file ? (
              <div>
                <p className="text-sm font-semibold" style={{ color: '#124170' }}>{file.name}</p>
                <p className="text-xs mt-1" style={{ color: '#26667F' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium" style={{ color: '#124170' }}>
                  Drag & drop or click to select
                </p>
                <p className="text-xs mt-1" style={{ color: '#26667F' }}>PDF, JPG, PNG — max 10MB</p>
              </div>
            )}
            <input id="file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
          </div>

          <button type="submit" disabled={!file || uploading}
            className="px-8 py-3.5 rounded-xl font-semibold text-white text-sm transition-opacity"
            style={{
              background: !file || uploading ? '#76C893' : 'linear-gradient(135deg, #124170 0%, #26667F 60%, #67C090 100%)',
              fontFamily: "'DM Sans', sans-serif",
              cursor: !file || uploading ? 'not-allowed' : 'pointer',
            }}>
            {uploading ? 'Uploading...' : 'Upload report'}
          </button>
        </form>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #DDF4E7' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#124170', fontFamily: "'Playfair Display', serif" }}>
          Your reports ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm" style={{ color: '#26667F' }}>No reports uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 rounded-xl transition-all"
                style={{ background: '#F8FFFE', border: '1px solid #DDF4E7' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#67C090'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#DDF4E7'}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F1FAEE' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        stroke="#124170" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#124170' }}>{r.file_name}</p>
                    <p className="text-xs" style={{ color: '#26667F' }}>{r.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: '#DDF4E7', color: '#124170' }}>
                    {r.file_name.split('.').pop().toUpperCase()}
                  </span>
                  <span className="text-xs" style={{ color: '#26667F' }}>
                    {new Date(r.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <a href={`${r.report_url}`} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: '#124170', color: 'white' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#26667F'}
                    onMouseLeave={e => e.currentTarget.style.background = '#124170'}>
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}