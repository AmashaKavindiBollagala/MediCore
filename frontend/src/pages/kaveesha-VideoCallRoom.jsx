// kaveesha-VideoCallRoom.jsx
// Main telemedicine video consultation room
// Beautiful, comprehensive UI for both doctor and patient

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAgoraCall } from '../hooks/kaveesha-useAgoraCall';
import { useTelemedicineSocket } from '../hooks/kaveesha-useTelemedicineSocket';

const API_BASE = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:3007/telemedicine';
const MAIN_API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const COLORS = {
  navy: '#0A1628',
  navyMid: '#112240',
  navyLight: '#1B3461',
  teal: '#00D4D8',
  tealDark: '#00A8AC',
  mint: '#4FFFB0',
  mintDark: '#00C97B',
  coral: '#FF6B6B',
  amber: '#FFB347',
  white: '#FFFFFF',
  ghost: 'rgba(255,255,255,0.06)',
  ghostHover: 'rgba(255,255,255,0.12)',
};

// ── Utility ──────────────────────────────────────────────────────────────────
function formatTime(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
}

// ── Control Button ────────────────────────────────────────────────────────────
function ControlBtn({ onClick, active = true, danger = false, label, children, large = false }) {
  const [hovered, setHovered] = useState(false);

  const bg = danger
    ? (active ? COLORS.coral : COLORS.ghost)
    : active
    ? COLORS.ghost
    : 'rgba(255,107,107,0.25)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={label}
        style={{
          width: large ? 64 : 52,
          height: large ? 64 : 52,
          borderRadius: '50%',
          border: `1.5px solid ${active ? 'rgba(255,255,255,0.15)' : 'rgba(255,107,107,0.5)'}`,
          background: hovered
            ? (danger ? (active ? '#FF5252' : COLORS.ghost) : COLORS.ghostHover)
            : bg,
          color: active ? COLORS.white : '#FF6B6B',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          boxShadow: danger && active
            ? '0 0 20px rgba(255,107,107,0.4)'
            : hovered ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
        }}
      >
        {children}
      </button>
      {label && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: 0.3 }}>
          {label}
        </span>
      )}
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ messages, onSend, currentUserId, participantName }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: COLORS.navyMid,
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: COLORS.mint,
          boxShadow: `0 0 8px ${COLORS.mint}`,
          animation: 'pulse 2s infinite',
        }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, letterSpacing: 0.5 }}>
          SECURE CHAT
        </span>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            Start the conversation...
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
              {!isMine && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: COLORS.navy,
                }}>
                  {msg.sender_name?.[0] || '?'}
                </div>
              )}
              <div style={{
                maxWidth: '75%',
                background: isMine
                  ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`
                  : COLORS.ghost,
                borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '10px 14px',
                border: isMine ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
                {!isMine && (
                  <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {msg.sender_name || msg.sender_role}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: 13, color: COLORS.white, lineHeight: 1.5 }}>{msg.message}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', gap: 10,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          style={{
            flex: 1, background: COLORS.ghost, border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 14px', color: COLORS.white,
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: input.trim()
              ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`
              : COLORS.ghost,
            color: COLORS.white, cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.18s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Notes Panel (doctor only) ─────────────────────────────────────────────────
function NotesPanel({ sessionId, userToken }) {
  const [notes, setNotes] = useState({ diagnosis: '', prescription: '', notes: '', follow_up_date: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/sessions/${resolvedSessionId}/notes`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(notes),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Save notes error:', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%',
    background: COLORS.ghost,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '10px 12px',
    color: COLORS.white,
    fontSize: 13,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    display: 'block',
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke={COLORS.teal} strokeWidth="1.8"/>
        </svg>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, letterSpacing: 0.5 }}>
          CLINICAL NOTES
        </span>
      </div>

      <div>
        <label style={labelStyle}>Diagnosis</label>
        <textarea
          rows={3}
          value={notes.diagnosis}
          onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })}
          placeholder="Primary diagnosis..."
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Prescription</label>
        <textarea
          rows={4}
          value={notes.prescription}
          onChange={(e) => setNotes({ ...notes, prescription: e.target.value })}
          placeholder="Medications, dosage, frequency..."
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Notes & Recommendations</label>
        <textarea
          rows={3}
          value={notes.notes}
          onChange={(e) => setNotes({ ...notes, notes: e.target.value })}
          placeholder="Additional notes..."
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Follow-up Date</label>
        <input
          type="date"
          value={notes.follow_up_date}
          onChange={(e) => setNotes({ ...notes, follow_up_date: e.target.value })}
          style={{ ...inputStyle, colorScheme: 'dark' }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 12,
          border: 'none',
          background: saved
            ? `linear-gradient(135deg, ${COLORS.mintDark}, ${COLORS.mint})`
            : `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
          color: saved ? COLORS.navy : COLORS.white,
          fontSize: 14,
          fontWeight: 700,
          cursor: saving ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {saving ? '⏳ Saving...' : saved ? '✓ Notes Saved!' : '💾 Save Notes'}
      </button>
    </div>
  );
}

// ── Waiting Screen ────────────────────────────────────────────────────────────
function WaitingScreen({ userRole, participantRole, onJoin, loading }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyMid} 100%)`,
      fontFamily: "'DM Sans', sans-serif", padding: 24,
    }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 40 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            border: `2px solid ${COLORS.teal}`,
            borderRadius: '50%',
            opacity: 0.2 - i * 0.05,
            animation: `ripple 2s ease-out ${i * 0.5}s infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: '20%',
          background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
      </div>

      <h1 style={{ margin: '0 0 8px', fontSize: 32, fontWeight: 800, color: COLORS.white, textAlign: 'center' }}>
        MediCore Telemedicine
      </h1>
      <p style={{ margin: '0 0 8px', fontSize: 16, color: COLORS.teal, fontWeight: 600 }}>
        {userRole === 'doctor' ? '👨‍⚕️ Doctor Portal' : '🏥 Patient Portal'}
      </p>
      <p style={{ margin: '0 0 40px', fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
        Waiting for {userRole === 'doctor' ? 'patient' : 'doctor'} to join...
      </p>

      {/* Connection checklist */}
      <div style={{
        background: COLORS.ghost,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '24px 32px',
        marginBottom: 32,
        width: '100%',
        maxWidth: 380,
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, color: COLORS.teal, textTransform: 'uppercase', letterSpacing: 1 }}>
          Before you join
        </p>
        {['Camera is working', 'Microphone is on', 'Stable internet connection', 'Private & quiet space'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.mintDark})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke={COLORS.navy} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onJoin}
        disabled={loading}
        style={{
          padding: '16px 48px',
          borderRadius: 16,
          border: 'none',
          background: loading
            ? COLORS.ghost
            : `linear-gradient(135deg, ${COLORS.teal} 0%, ${COLORS.mint} 100%)`,
          color: loading ? 'rgba(255,255,255,0.4)' : COLORS.navy,
          fontSize: 16,
          fontWeight: 800,
          cursor: loading ? 'wait' : 'pointer',
          letterSpacing: 0.5,
          boxShadow: loading ? 'none' : `0 8px 32px rgba(0,212,216,0.4)`,
          transition: 'all 0.2s',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        {loading ? (
          <>
            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            Connecting...
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Join Consultation
          </>
        )}
      </button>

      <style>{`
        @keyframes ripple { 0% { transform: scale(0.8); opacity: 0.3; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      `}</style>
    </div>
  );
}

// ── Main VideoCallRoom ─────────────────────────────────────────────────────────
export default function KaveeshaVideoCallRoom() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userToken = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const userRole = currentUser?.role || searchParams.get('role') || 'patient';
  const userId = currentUser?.id;

  const [sessionData, setSessionData] = useState(null);
  const [agoraCredentials, setAgoraCredentials] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [resolvedSessionId, setResolvedSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState('chat'); // 'chat' | 'notes' | 'participants'
  const [panelOpen, setPanelOpen] = useState(true);
  const [callEnded, setCallEnded] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);



  // Resolve session ID from appointment ID (with auto-creation)
  useEffect(() => {
    if (!appointmentId || resolvedSessionId) return;
    createAndResolveSession();
  }, [appointmentId, resolvedSessionId]);
  const [pageError, setPageError] = useState(null);
  const [messages, setMessages] = useState([]);

  const {
    joined, localTracks, remoteUsers,
    isAudioMuted, isVideoOff, isScreenSharing,
    connectionState, error,
    callDuration, localVideoRef, remoteVideoRef,
    joinCall, leaveCall, toggleAudio, toggleVideo, toggleScreenShare,
  } = useAgoraCall({ resolvedSessionId, token: agoraCredentials?.token, userToken });

  // Auto-play local video when track is ready
  useEffect(() => {
    if (localTracks.video && localVideoRef.current) {
      localTracks.video.play(localVideoRef.current);
    }
  }, [localTracks.video]);

  // Defensive retry: play local video if ref becomes available later
  useEffect(() => {
    const playIfReady = () => {
      if (localTracks.video && localVideoRef.current) {
        try {
                  localTracks.video.play(localVideoRef.current);
                } catch (err) {
                  console.warn('[VideoCallRoom] Local video play failed:', err);
                }
      }
    };
    playIfReady();
    const interval = setInterval(() => {
      if (localTracks.video && localVideoRef.current) {
        try {
          localTracks.video.play(localVideoRef.current);
          clearInterval(interval);
        } catch (err) {
          console.warn('[VideoCallRoom] Local video play failed:', err);
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [localTracks.video]);

  const {
    connected: socketConnected, participantStatus,
    emitVideoToggle, emitAudioToggle, emitEndSession, emitScreenShare,
  } = useTelemedicineSocket({
    resolvedSessionId,
    userToken,
    onParticipantJoined: (data) => console.log('Participant joined:', data),
    onParticipantLeft: (data) => console.log('Participant left:', data),
    onSessionEnded: () => setCallEnded(true),
  });



  // Resolve session ID from appointment ID (with auto-creation)
  useEffect(() => {
    if (!appointmentId || resolvedSessionId) return;
    createAndResolveSession();
  }, [appointmentId, resolvedSessionId]);

  const createAndResolveSession = async () => {
      console.log('[createAndResolveSession] Starting with appointmentId:', appointmentId, 'userToken:', !!userToken);
      try {
        // Step 1: Fetch appointment details
        const appointmentRes = await fetch(`${MAIN_API}/appointments/${appointmentId}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!appointmentRes.ok) {
          throw new Error(`Failed to fetch appointment: ${appointmentRes.status}`);
        }
        const appointmentData = await appointmentRes.json();
        if (!appointmentData.success) {
          throw new Error(appointmentData.error || 'Invalid appointment response');
        }

        const { doctor_id, patient_id, scheduled_at } = appointmentData.data;

        // Validate required fields
        if (!doctor_id || !patient_id || !scheduled_at) {
          console.error('Missing required appointment fields:', { doctor_id, patient_id, scheduled_at });
          throw new Error('Appointment data incomplete: doctor_id, patient_id, and scheduled_at are required');
        }

        // Step 2: Start telemedicine session
        const startRes = await fetch(`${MAIN_API}/appointments/${appointmentId}/start`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctor_id,
            patient_id,
            scheduled_at,
          }),
        });

        if (!startRes.ok) {
          console.error('Start request failed:', {
            status: startRes.status,
            statusText: startRes.statusText,
            url: startRes.url,
          });
          throw new Error(`Session start failed: ${startRes.status} ${startRes.statusText}`);
        }

        const startData = await startRes.json();
        console.log('Backend start response (full):', JSON.stringify(startData, null, 2));

        if (!startData.success || !startData.data?.id) {
          throw new Error(startData.error || `Failed to create session. Status: ${startRes.status}`);
        }

        // Step 3: Update state
        console.log('[createAndResolveSession] Got session ID:', startData.data.id);
        setResolvedSessionId(startData.data.id);
        setSessionData(startData.data);
        setPageError(null);
      } catch (err) {
        console.error('Failed to create/resume session:', err);
        setPageError(
          err.message.includes('404') 
            ? 'Appointment not found or expired' 
            : 'Unable to start consultation. Please try again.'
        );
      }
    };

    // Resolve session ID from appointment ID (with auto-creation)
    useEffect(() => {
      if (!appointmentId || !userToken || resolvedSessionId) return;
      createAndResolveSession();
    }, [appointmentId, resolvedSessionId, userToken]);

  // Poll for new chat messages
  useEffect(() => {
    if (!resolvedSessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${MAIN_API}/telemedicine/sessions/${resolvedSessionId}/chat`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setMessages(data.data);
          }
        }
      } catch (err) {
        console.warn('[VideoCallRoom] Chat polling error:', err.message);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [resolvedSessionId, userToken]);

  // Fetch Agora token
  const fetchToken = async () => {
    if (!resolvedSessionId) throw new Error('Session ID not resolved');
    const res = await fetch(`${MAIN_API}/telemedicine/sessions/${resolvedSessionId}/token`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.success) return data.data;
    throw new Error(data.error || 'Failed to get token');
  };

  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || 'doctor';
    } catch (e) {
      return 'doctor';
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim() || !resolvedSessionId) return;

    try {
      const res = await fetch(`${MAIN_API}/telemedicine/sessions/${resolvedSessionId}/chat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: getUserIdFromToken(userToken),
          message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Optimistic UI update
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sessionId: resolvedSessionId,
              senderId: 'doctor',
              message,
              timestamp: new Date().toISOString(),
              role: 'doctor',
            },
          ]);
        }
      }
    } catch (err) {
      console.error('[VideoCallRoom] Failed to send message:', err);
      setPageError('Failed to send message. Please try again.');
    }
  };

  // Handle join
  const handleJoin = async () => {
    console.log('appointmentId:', appointmentId);
    setLoading(true);
    try {
      if (!resolvedSessionId) {
        setPageError('Consultation session not ready. Please wait...');
        return;
      }
      const creds = await fetchToken();
      setAgoraCredentials(creds);
      await joinCall({
        appId: creds.appId,
        channelName: creds.channelName,
        agoraToken: creds.token,
        uid: creds.uid,
        sessionId: resolvedSessionId,
      });
      setInCall(true);
    } catch (err) {
      console.error('Join failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle end call
  const handleEndCall = async () => {
    emitEndSession();
    await leaveCall();
    if (userRole === 'doctor') {
      try {
        await fetch(`${MAIN_API}/telemedicine/sessions/${resolvedSessionId}/end`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
        });
      } catch {}
    }
    setCallEnded(true);
  };

  // Wrapped toggles
  const handleToggleAudio = () => {
    toggleAudio();
    emitAudioToggle(isAudioMuted); // toggling: if muted->unmute
  };
  const handleToggleVideo = () => {
    toggleVideo();
    emitVideoToggle(isVideoOff);
  };
  const handleToggleScreen = () => {
    toggleScreenShare();
    emitScreenShare(!isScreenSharing);
  };

  // ── Call Ended Screen ──────────────────────────────────────────────────────
  if (callEnded) {
    return (
      <div style={{
        minHeight: '100vh', background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.navyMid})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif", padding: 24, textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `linear-gradient(135deg, ${COLORS.mint}, ${COLORS.mintDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24,
          boxShadow: `0 0 40px rgba(79,255,176,0.3)`,
        }}>✓</div>
        <h1 style={{ color: COLORS.white, fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>
          Consultation Complete
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: '0 0 32px' }}>
          Duration: {callDuration} · Session #{resolvedSessionId?.substring(0, 8) || '—'}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate(userRole === 'doctor' ? '/doctor-dashboard' : '/appointments')}
            style={{
              padding: '14px 28px', borderRadius: 14, border: 'none',
              background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`,
              color: COLORS.white, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {userRole === 'doctor' ? '← Dashboard' : '← My Appointments'}
          </button>
        </div>
      </div>
    );
  }

  // ── Waiting Screen ─────────────────────────────────────────────────────────
  if (!inCall) {
    return (
      <WaitingScreen
        userRole={userRole}
        participantRole={userRole === 'doctor' ? 'patient' : 'doctor'}
        onJoin={handleJoin}
        loading={loading}
      />
    );
  }

  // ── End Screen ─────────────────────────────────────────────────────────────
  if (callEnded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: COLORS.navy, color: COLORS.white, fontFamily: "'DM Sans', sans-serif", textAlign: 'center', padding: 24 }}>
        <h2 style={{ fontSize: '2rem', marginBottom: 16 }}>Call Ended</h2>
        <p style={{ fontSize: '1.25rem', marginBottom: 24 }}>Duration: {callDuration}</p>
        <button
          onClick={() => navigate('/telemedicine')}
          style={{
            background: COLORS.teal,
            color: COLORS.white,
            border: 'none',
            borderRadius: 8,
            padding: '12px 32px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = COLORS.tealDark}
          onMouseLeave={(e) => e.currentTarget.style.background = COLORS.teal}
        >
          Return to Consultations
        </button>
      </div>
    );
  }

  // ── Main Call UI ───────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', height: '100vh', background: COLORS.navy,
      fontFamily: "'DM Sans', sans-serif", overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        input, textarea { outline: none; }
        input:focus, textarea:focus { border-color: rgba(0,212,216,0.5) !important; }
      `}</style>

      {/* ── Video Area ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>

        {/* Top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
          background: 'linear-gradient(to bottom, rgba(10,22,40,0.95), transparent)',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.mint})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: COLORS.white }}>
                Medi<span style={{ color: COLORS.mint }}>Core</span>
              </span>
            </div>

            {/* Live badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,107,107,0.2)',
              border: '1px solid rgba(255,107,107,0.4)',
              borderRadius: 20, padding: '4px 12px',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B6B', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6B6B', letterSpacing: 0.5 }}>LIVE</span>
            </div>

            {/* Timer */}
            <div style={{
              background: COLORS.ghost, border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '5px 14px',
            }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, fontVariantNumeric: 'tabular-nums', letterSpacing: 1 }}>
                {callDuration}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Connection state */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: COLORS.ghost, borderRadius: 20, padding: '5px 12px',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: connectionState === 'CONNECTED' ? COLORS.mint : COLORS.amber,
                animation: 'pulse 2s infinite',
              }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {connectionState}
              </span>
            </div>

            {/* Role badge */}
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.teal}30, ${COLORS.mint}20)`,
              border: `1px solid ${COLORS.teal}40`,
              borderRadius: 20, padding: '5px 14px',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.teal, letterSpacing: 0.5 }}>
                {userRole === 'doctor' ? '👨‍⚕️ DOCTOR' : '🏥 PATIENT'}
              </span>
            </div>

            {/* Panel toggle */}
            <button
              onClick={() => setPanelOpen((p) => !p)}
              style={{
                background: COLORS.ghost, border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10, padding: '8px 12px', color: COLORS.white,
                cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {panelOpen ? '→ Hide Panel' : '← Show Panel'}
            </button>
          </div>
        </div>

        {/* Remote video (main) */}
        <div style={{ flex: 1, background: '#050D1A', position: 'relative', overflow: 'hidden' }}>
          <div
            ref={remoteVideoRef}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Remote offline placeholder */}
          {remoteUsers.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `radial-gradient(ellipse at center, ${COLORS.navyLight}40 0%, ${COLORS.navy} 100%)`,
            }}>
              {/* Animated circles */}
              <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 24 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    position: 'absolute', inset: 0,
                    borderRadius: '50%', border: `1px solid ${COLORS.teal}`,
                    opacity: 0.15 + i * 0.05,
                    animation: `ripple 2.5s ease-out ${i * 0.7}s infinite`,
                  }} />
                ))}
                <div style={{
                  position: 'absolute', inset: '25%',
                  background: COLORS.ghost, borderRadius: '50%',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28,
                }}>
                  {userRole === 'doctor' ? '🏥' : '👨‍⚕️'}
                </div>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, margin: 0, fontWeight: 500 }}>
                Waiting for {userRole === 'doctor' ? 'patient' : 'doctor'} to join...
              </p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, margin: '6px 0 0' }}>
                Your session is ready
              </p>
            </div>
          )}

          {/* Local video (PiP) */}
          <div style={{
            position: 'absolute', bottom: 24, right: 24,
            width: 200, height: 130,
            borderRadius: 16, overflow: 'hidden',
            border: `2px solid ${COLORS.teal}50`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            background: '#050D1A',
            zIndex: 5,
          }}>
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
            {isVideoOff && (
              <div style={{
                position: 'absolute', inset: 0,
                background: COLORS.navyMid,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 6,
              }}>
                <div style={{ fontSize: 20 }}>{userRole === 'doctor' ? '👨‍⚕️' : '👤'}</div>
                <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Camera off</p>
              </div>
            )}
            <div style={{
              position: 'absolute', bottom: 6, left: 8,
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.6)',
              background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 6px',
            }}>
              You {isAudioMuted && '🔇'}
            </div>
          </div>
        </div>

        {/* ── Controls bar ──────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(to top, rgba(10,22,40,0.98), rgba(10,22,40,0.85))',
          backdropFilter: 'blur(12px)',
          padding: '20px 32px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <ControlBtn onClick={handleToggleAudio} active={!isAudioMuted} label={isAudioMuted ? 'Unmute' : 'Mute'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {isAudioMuted ? (
                <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M9 3.5a3 3 0 016 0v8a3 3 0 01-6 0V3.5zM3 3l18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3zM19 11a7 7 0 01-14 0M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              )}
            </svg>
          </ControlBtn>

          <ControlBtn onClick={handleToggleVideo} active={!isVideoOff} label={isVideoOff ? 'Start Video' : 'Stop Video'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              {isVideoOff ? (
                <path d="M3.27 3.27L3 4a2 2 0 01-1 1.72M21 21L3 3m18 0l-4-2m4 2v12l-4-2M3 4v12a2 2 0 002 2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <path d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.259a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
              )}
            </svg>
          </ControlBtn>

          <ControlBtn onClick={handleToggleScreen} active={!isScreenSharing} label={isScreenSharing ? 'Stop Share' : 'Share Screen'}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M2 3a1 1 0 011-1h18a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V3zM8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              {isScreenSharing && <path d="M8 10l4-4 4 4M12 6v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>}
            </svg>
          </ControlBtn>

          {/* Panel toggles */}
          <div style={{ height: 48, width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {['chat', ...(userRole === 'doctor' ? ['notes'] : [])].map((panel) => (
            <ControlBtn
              key={panel}
              onClick={() => { setActivePanel(panel); setPanelOpen(true); }}
              active={activePanel === panel && panelOpen}
              label={panel.charAt(0).toUpperCase() + panel.slice(1)}
            >
              {panel === 'chat' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              )}
            </ControlBtn>
          ))}

          <div style={{ height: 48, width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />

          {/* End call */}
          <ControlBtn onClick={handleEndCall} danger active label="End Call" large>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </ControlBtn>
        </div>
      </div>

      {/* ── Side Panel ────────────────────────────────────────────────────────── */}
      {panelOpen && (
        <div style={{
          width: 340,
          background: COLORS.navyMid,
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Panel tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            {['chat', ...(userRole === 'doctor' ? ['notes'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePanel(tab)}
                style={{
                  flex: 1, padding: '14px 0',
                  border: 'none', background: 'transparent',
                  color: activePanel === tab ? COLORS.teal : 'rgba(255,255,255,0.35)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: 0.8,
                  borderBottom: `2px solid ${activePanel === tab ? COLORS.teal : 'transparent'}`,
                  transition: 'all 0.18s',
                  fontFamily: 'inherit',
                }}
              >
                {tab}
                {tab === 'chat' && messages.length > 0 && (
                  <span style={{
                    marginLeft: 6, background: COLORS.coral, color: 'white',
                    borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800,
                  }}>
                    {messages.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Panel content */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {activePanel === 'chat' && (
              <ChatPanel
                messages={messages}
                onSend={sendMessage}
                currentUserId={userId}
              />
            )}
            {activePanel === 'notes' && userRole === 'doctor' && (
              <NotesPanel sessionId={resolvedSessionId} userToken={userToken} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}