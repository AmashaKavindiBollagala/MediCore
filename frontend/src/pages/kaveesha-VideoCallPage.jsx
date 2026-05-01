// kaveesha-VideoCallPage.jsx
// Video consultation page using Agora SDK for telemedicine
// Accessible only for confirmed video appointments
// REDESIGNED: Modern Zoom-like UI with camera bug fix

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Set Agora log level to reduce console noise in production
AgoraRTC.setLogLevel(process.env.NODE_ENV === 'production' ? 4 : 1); // 4 = ERROR only, 1 = DEBUG

const API_BASE = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:3007';

/* ─── Design tokens ─────────────────────────────────────────── */
const T = {
  bg: '#0E0F14',
  surface: '#16181f',
  surfaceUp: '#1e2130',
  border: 'rgba(255,255,255,0.07)',
  accent: '#2563EB',
  accentGlow: 'rgba(37,99,235,0.35)',
  success: '#22c55e',
  danger: '#ef4444',
  dangerGlow: 'rgba(239,68,68,0.4)',
  text: '#f1f5f9',
  muted: 'rgba(241,245,249,0.45)',
  glass: 'rgba(22,24,31,0.85)',
};

/* ─── Helpers ───────────────────────────────────────────────── */
function Avatar({ initials, size = 80, color = T.accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `radial-gradient(135deg, ${color}cc, ${color}55)`,
      border: `2px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#fff',
      letterSpacing: 1, flexShrink: 0,
      boxShadow: `0 0 0 4px ${color}22`,
    }}>
      {initials}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 40, height: 40,
      border: `3px solid ${T.border}`,
      borderTop: `3px solid ${T.accent}`,
      borderRadius: '50%',
      animation: 'spin 0.9s linear infinite',
    }} />
  );
}

/* ─── Control Button ────────────────────────────────────────── */
function CtrlBtn({ onClick, active = true, red = false, label, icon, large }) {
  const [hov, setHov] = useState(false);
  const sz = large ? 60 : 50;
  const bg = red
    ? (hov ? '#dc2626' : T.danger)
    : active
      ? (hov ? T.surfaceUp : T.surface)
      : (hov ? '#7f1d1d' : 'rgba(239,68,68,0.2)');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        title={label}
        style={{
          width: sz, height: sz, borderRadius: '50%',
          background: bg,
          border: `1.5px solid ${red ? T.danger : active ? T.border : 'rgba(239,68,68,0.4)'}`,
          color: active ? T.text : (red ? '#fff' : '#ef4444'),
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.18s ease',
          transform: hov ? 'translateY(-2px)' : 'none',
          boxShadow: red
            ? `0 8px 24px ${T.dangerGlow}`
            : hov ? '0 8px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {icon}
      </button>
      {label && (
        <span style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: 0.3, fontFamily: 'inherit' }}>
          {label}
        </span>
      )}
    </div>
  );
}

/* ─── Remote Video ──────────────────────────────────────────── */
const RemoteVideoPlayer = ({ user }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (user.videoTrack && ref.current) user.videoTrack.play(ref.current);
    return () => { if (user.videoTrack) user.videoTrack.stop(); };
  }, [user.videoTrack]);
  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

/* ─── Main Page ─────────────────────────────────────────────── */
const DushaniVideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState('initializing');

  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const isJoiningRef = useRef(false);
  const isInitializingRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    initializeTelemedicineSession();
    return () => {
      clearInterval(timerRef.current);
      cleanupTracks();
      if (clientRef.current) clientRef.current.leave().catch(() => {});
    };
  }, [appointmentId]);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };

  const cleanupTracks = async () => {
    try {
      if (localVideoRef._track) { localVideoRef._track.stop(); localVideoRef._track.close(); }
    } catch (e) {}
  };

  const releaseCamera = async () => {
    // Aggressively release all media streams before acquiring new ones
    try {
      const streams = await navigator.mediaDevices.enumerateDevices();
      // Try to stop any existing getUserMedia streams via a quick open-and-close
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .catch(() => null);
      if (tempStream) {
        tempStream.getTracks().forEach(t => t.stop());
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (e) {
      // Ignore errors — camera may not be accessible
    }
  };

  const initializeTelemedicineSession = async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = u?.role;

      const eligRes = await fetch(`${API_BASE}/appointments/${appointmentId}/telemedicine-eligibility`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eligData = await eligRes.json();

      if (!eligData.success || !eligData.data.eligible) {
        setError(eligData.data?.reason || 'This appointment is not eligible for video consultation');
        setLoading(false);
        return;
      }
      setAppointment(eligData.data);

      const apptTime = new Date(eligData.data.scheduled_at);
      const now = new Date();
      if (now > new Date(apptTime.getTime() + 60 * 60 * 1000)) {
        setError('This video call link has expired. It is only valid up to 1 hour after the appointment time.');
        setLoading(false);
        return;
      }

      if (userRole === 'patient') {
        const tenMinBefore = new Date(apptTime.getTime() - 10 * 60 * 1000);
        const sessCheckRes = await fetch(`${API_BASE}/telemedicine/appointment/${appointmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sessCheck = await sessCheckRes.json();
        const doctorStarted = sessCheck.success && sessCheck.data?.status === 'active';
        if (!doctorStarted && now < tenMinBefore) {
          const fmt = apptTime.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          setError(`Video call will start at ${fmt}. Please join on time.`);
          setLoading(false);
          return;
        }
      }

      let sessRes = await fetch(`${API_BASE}/telemedicine/appointment/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let sessData = await sessRes.json();

      if (!sessData.success && sessData.needsCreation) {
        const startRes = await fetch(`${API_BASE}/telemedicine/appointment/${appointmentId}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            doctor_id: eligData.data.doctor_id,
            patient_id: eligData.data.patient_id,
            scheduled_at: eligData.data.scheduled_at,
          }),
        });
        sessData = await startRes.json();
        if (!sessData.success) throw new Error(sessData.error || 'Failed to start session');
      }

      setSession(sessData.data);
      setCallStatus('connecting');

      const tokRes = await fetch(`${API_BASE}/telemedicine/sessions/${sessData.data.id}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const tokData = await tokRes.json();
      if (!tokData.success) throw new Error('Failed to generate video token');

      await joinAgoraChannel(tokData.data, sessData.data);
    } catch (err) {
      console.error('Init error:', err);
      setError(friendlyError(err.message));
      setCallStatus('ended');
    } finally {
      setLoading(false);
      isInitializingRef.current = false;
    }
  };

  const friendlyError = (msg = '') => {
    if (msg.includes('NOT_READABLE') || msg.includes('NotReadableError'))
      return 'Your camera is being used by another app (Zoom, Teams, etc.). Close those apps and refresh.';
    if (msg.includes('NotAllowedError') || msg.includes('Permission denied'))
      return 'Camera/microphone access denied. Please allow permissions in your browser settings.';
    if (msg.includes('NotFoundError'))
      return 'No camera or microphone detected. Please connect one and try again.';
    if (msg.includes('invalid token'))
      return 'Authentication failed. Please refresh the page.';
    return msg || 'Failed to initialize video consultation.';
  };

  const joinAgoraChannel = async (tokenData, sessionData) => {
    if (isJoiningRef.current) return;
    isJoiningRef.current = true;
    try {
      // Full cleanup before creating new client
      if (clientRef.current) {
        try { await clientRef.current.unpublish(); } catch {}
        if (localVideoTrack) { try { localVideoTrack.stop(); localVideoTrack.close(); } catch {} }
        if (localAudioTrack) { try { localAudioTrack.stop(); localAudioTrack.close(); } catch {} }
        setLocalVideoTrack(null);
        setLocalAudioTrack(null);
        try { await clientRef.current.leave(); } catch {}
        clientRef.current = null;
      }

      // Release camera before Agora tries to grab it
      await releaseCamera();
      await new Promise(r => setTimeout(r, 800));

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      const uid = await client.join(tokenData.appId, tokenData.channelName, tokenData.token, tokenData.uid);
      console.log('Joined channel uid:', uid);

      await new Promise(r => setTimeout(r, 300));

      // CAMERA FIX: Use getUserMedia directly, then create custom tracks from the stream
      // This avoids the NOT_READABLE error by controlling stream acquisition ourselves
      let videoTrack = null;
      let audioTrack = null;

      try {
        // First try: getUserMedia with fallback constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user',
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        const videoMediaTrack = stream.getVideoTracks()[0];
        const audioMediaTrack = stream.getAudioTracks()[0];

        if (videoMediaTrack) {
          videoTrack = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: videoMediaTrack });
        }
        if (audioMediaTrack) {
          audioTrack = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: audioMediaTrack });
        }
      } catch (mediaErr) {
        console.warn('getUserMedia failed:', mediaErr.message);
        // Fallback: try Agora native track creation with relaxed constraints
        try {
          [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { AEC: true, ANS: true },
            { encoderConfig: '480p' }
          );
        } catch (agoraErr) {
          console.warn('Agora track creation also failed:', agoraErr.message);
          // Try audio only
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          } catch {}
        }
      }

      setLocalVideoTrack(videoTrack || null);
      setLocalAudioTrack(audioTrack || null);

      // Play local video immediately using the track's own player
      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish tracks
      const toPublish = [videoTrack, audioTrack].filter(Boolean);
      if (toPublish.length > 0) await client.publish(toPublish);

      // Remote user handlers
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        if (mediaType === 'video') setRemoteUsers(prev => {
          const exists = prev.find(u => u.uid === remoteUser.uid);
          return exists ? prev.map(u => u.uid === remoteUser.uid ? remoteUser : u) : [...prev, remoteUser];
        });
        if (mediaType === 'audio') remoteUser.audioTrack?.play();
      });
      client.on('user-unpublished', (remoteUser, mediaType) => {
        if (mediaType === 'video') setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      });
      client.on('user-left', remoteUser => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== remoteUser.uid));
      });

      // Notify backend
      const token = localStorage.getItem('token');
      if (sessionData?.id) {
        await fetch(`${API_BASE}/telemedicine/sessions/${sessionData.id}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }

      setCallStatus('connected');
    } catch (err) {
      console.error('Join channel error:', err);
      throw new Error(friendlyError(err.message));
    } finally {
      isJoiningRef.current = false;
    }
  };

  const toggleMute = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = async () => {
    try {
      const token = localStorage.getItem('token');
      if (session?.id) {
        await fetch(`${API_BASE}/telemedicine/sessions/${session.id}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      if (clientRef.current) await clientRef.current.leave().catch(() => {});
      if (localVideoTrack) { localVideoTrack.stop(); localVideoTrack.close(); }
      if (localAudioTrack) { localAudioTrack.stop(); localAudioTrack.close(); }
      setCallStatus('ended');
      const u = user || JSON.parse(localStorage.getItem('user') || '{}');
      navigate(u?.role === 'doctor' ? '/doctor-telemedicine' : '/telemedicine', { state: { refresh: true } });
    } catch (err) {
      console.error('Leave error:', err);
    }
  };

  const endSession = async () => {
    if (user?.role !== 'doctor') return;
    try {
      const token = localStorage.getItem('token');
      if (session?.id) {
        await fetch(`${API_BASE}/telemedicine/sessions/${session.id}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
      if (appointmentId) {
        await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}
    leaveCall();
  };

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading) return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
          <Spinner />
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', boxShadow: `0 8px 32px ${T.accentGlow}`,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.55-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.45.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ color: T.text, fontSize: 17, fontWeight: 600, margin: 0 }}>Setting up your consultation…</p>
        <p style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>Securing connection</p>
      </div>
    </div>
  );

  /* ── Error ───────────────────────────────────────────────── */
  if (error) return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 24, padding: '48px 40px', maxWidth: 440, width: '100%',
        textAlign: 'center', animation: 'fadeIn 0.4s ease',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(239,68,68,0.15)', border: `1.5px solid rgba(239,68,68,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 28,
        }}>⚠️</div>
        <h2 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Can't Connect</h2>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.65, margin: '0 0 32px' }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', borderRadius: 12, border: 'none',
              background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              boxShadow: `0 8px 24px ${T.accentGlow}`,
            }}
          >Try Again</button>
          <button
            onClick={() => navigate('/appointments/my')}
            style={{
              padding: '12px 24px', borderRadius: 12,
              border: `1px solid ${T.border}`, background: T.surfaceUp,
              color: T.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >Back</button>
        </div>
      </div>
    </div>
  );

  /* ── Call Ended ──────────────────────────────────────────── */
  if (callStatus === 'ended') return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Sora', 'Segoe UI', sans-serif",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}`}</style>
      <div style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 24, padding: '56px 48px', maxWidth: 420, width: '100%',
        textAlign: 'center', animation: 'fadeIn 0.4s ease',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px', fontSize: 32,
        }}>✓</div>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: '0 0 10px' }}>Consultation Ended</h2>
        <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.65, margin: '0 0 10px' }}>
          {user?.role === 'doctor'
            ? 'Session ended successfully. All notes have been saved.'
            : 'Your consultation has ended. Get well soon!'}
        </p>
        <p style={{ color: T.muted, fontSize: 13, margin: '0 0 32px' }}>Duration: {formatDuration(callDuration)}</p>
        <button
          onClick={() => navigate('/appointments/my', { state: { refresh: true } })}
          style={{
            padding: '14px 32px', borderRadius: 12, border: 'none',
            background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
            color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: `0 8px 24px ${T.accentGlow}`,
          }}
        >Back to Appointments</button>
      </div>
    </div>
  );

  /* ── Main Call UI ─────────────────────────────────────────── */
  const roleLabel = user?.role === 'doctor' ? 'Doctor' : 'Patient';
  const remoteLabel = user?.role === 'doctor' ? 'Patient' : 'Doctor';

  return (
    <div style={{
      height: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      fontFamily: "'Sora', 'Segoe UI', sans-serif", overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:4px}
      `}</style>

      {/* ── Top Bar ──────────────────────────────────────────── */}
      <div style={{
        height: 56, background: T.surface, borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', padding: '0 20px',
        justifyContent: 'space-between', flexShrink: 0,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${T.accent}, #7c3aed)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 12px ${T.accentGlow}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.55-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.45.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{ color: T.text, fontSize: 15, fontWeight: 700 }}>MediCore</span>
          <span style={{ color: T.muted, fontSize: 13, marginLeft: 4 }}>· Video Consultation</span>
        </div>

        {/* Center: timer + live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 20, padding: '4px 10px',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.4s infinite' }} />
            <span style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>LIVE</span>
          </div>
          {callStatus === 'connected' && (
            <div style={{
              background: T.surfaceUp, border: `1px solid ${T.border}`,
              borderRadius: 20, padding: '4px 14px',
              color: T.text, fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
            }}>
              {formatDuration(callDuration)}
            </div>
          )}
        </div>

        {/* Right: connection status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.success, boxShadow: `0 0 0 2px rgba(34,197,94,0.2)` }} />
          <span style={{ color: T.muted, fontSize: 13 }}>Secure connection</span>
        </div>
      </div>

      {/* ── Video Grid ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden', background: '#080a0f' }}>

        {/* Remote (main) */}
        <div style={{ flex: 1, position: 'relative', background: '#080a0f' }}>
          {remoteUsers.length > 0 ? (
            remoteUsers.map(ru => (
              <div key={ru.uid} style={{ position: 'absolute', inset: 0 }}>
                <RemoteVideoPlayer user={ru} />
                {/* Name tag */}
                <div style={{
                  position: 'absolute', bottom: 20, left: 20,
                  background: 'rgba(8,10,15,0.75)', backdropFilter: 'blur(8px)',
                  border: `1px solid ${T.border}`, borderRadius: 10,
                  padding: '6px 14px', color: T.text, fontSize: 13, fontWeight: 600,
                }}>
                  {remoteLabel}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 20,
            }}>
              <Avatar initials={remoteLabel[0]} size={96} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: T.text, fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{remoteLabel}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, animation: 'pulse 1.5s infinite' }} />
                  <span style={{ color: T.muted, fontSize: 14 }}>Waiting to join…</span>
                </div>
              </div>
            </div>
          )}

          {/* Local video PiP */}
          <div style={{
            position: 'absolute', bottom: 20, right: 20,
            width: 220, height: 140, borderRadius: 16, overflow: 'hidden',
            border: `2px solid ${isVideoOff ? 'rgba(239,68,68,0.4)' : T.border}`,
            background: T.surfaceUp,
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            zIndex: 10, transition: 'all 0.2s',
          }}>
            <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
            {isVideoOff && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: T.surfaceUp, gap: 8,
              }}>
                <Avatar initials={roleLabel[0]} size={44} />
                <span style={{ color: T.muted, fontSize: 12 }}>Camera off</span>
              </div>
            )}
            {/* PiP label */}
            <div style={{
              position: 'absolute', bottom: 8, left: 10,
              background: 'rgba(8,10,15,0.75)', backdropFilter: 'blur(6px)',
              borderRadius: 7, padding: '3px 10px',
              color: T.text, fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              You {isMuted && <span style={{ color: '#ef4444' }}>🔇</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls Bar ─────────────────────────────────────── */}
      <div style={{
        height: 96, background: T.surface, borderTop: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '0 32px', flexShrink: 0,
      }}>
        {/* Mute */}
        <CtrlBtn
          onClick={toggleMute}
          active={!isMuted}
          label={isMuted ? 'Unmute' : 'Mute'}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {isMuted ? (
                <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6m-2.07 2.07L3 3m18 18-2.73-2.73M19 11a7 7 0 01-.11 1.27M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <path d="M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3zM19 11a7 7 0 01-14 0M12 19v4M8 23h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              )}
            </svg>
          }
        />

        {/* Camera */}
        <CtrlBtn
          onClick={toggleVideo}
          active={!isVideoOff}
          label={isVideoOff ? 'Start Video' : 'Stop Video'}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              {isVideoOff ? (
                <path d="M21 21L3 3m10.12 6.12L5 8a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 001.29-.48M15 10l4.55-2.07A1 1 0 0121 8.87v6.26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              ) : (
                <path d="M15 10l4.55-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.45.9L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="1.8"/>
              )}
            </svg>
          }
        />

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: T.border, margin: '0 4px' }} />

        {/* End Call */}
        {user?.role === 'doctor' ? (
          <CtrlBtn
            onClick={endSession}
            red
            large
            label="End Session"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" transform="rotate(135 12 12)"/>
              </svg>
            }
          />
        ) : (
          <CtrlBtn
            onClick={leaveCall}
            red
            large
            label="Leave"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" transform="rotate(135 12 12)"/>
              </svg>
            }
          />
        )}
      </div>
    </div>
  );
};

export default DushaniVideoCallPage;