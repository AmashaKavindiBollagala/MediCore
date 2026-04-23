// kaveesha-VideoCallPage.jsx
// Video consultation page using Agora SDK for telemedicine
// Accessible only for confirmed video appointments

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC from 'agora-rtc-sdk-ng';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const COLORS = {
  primary: '#184E77',
  secondary: '#34A0A4',
  success: '#76C893',
  danger: '#E74C3C',
  dark: '#1a1a1a',
};

const DushaniVideoCallPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState('initializing'); // initializing, connecting, connected, ended
  
  // Agora state
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const clientRef = useRef(null);
  const isJoiningRef = useRef(false);  // Guard against double initialization
  const isInitializingRef = useRef(false);  // Guard against double session initialization

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    initializeTelemedicineSession();
    
    return () => {
      // Cleanup on unmount
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [appointmentId]);

  // Initialize telemedicine session
  const initializeTelemedicineSession = async () => {
    // Prevent double initialization
    if (isInitializingRef.current) {
      console.warn('Already initializing, skipping...');
      return;
    }
    isInitializingRef.current = true;

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      const userRole = user?.role;

      // Step 1: Check appointment eligibility
      const eligibilityResponse = await fetch(
        `${API_BASE}/appointments/${appointmentId}/telemedicine-eligibility`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const eligibilityData = await eligibilityResponse.json();

      if (!eligibilityData.success || !eligibilityData.data.eligible) {
        setError(
          eligibilityData.data?.reason || 'This appointment is not eligible for video consultation'
        );
        setLoading(false);
        return;
      }

      setAppointment(eligibilityData.data);

      // Check if appointment has expired (1 hour after scheduled time)
      const appointmentTime = new Date(eligibilityData.data.scheduled_at);
      const now = new Date();
      const oneHourAfter = new Date(appointmentTime.getTime() + 60 * 60 * 1000);
      
      if (now > oneHourAfter) {
        setError(
          'This video call link has expired. It is only valid up to 1 hour after the appointment time.'
        );
        setLoading(false);
        return;
      }

      // Step 2: For patients, check if doctor has started the call or if it's within 10 minutes of appointment time
      if (userRole === 'patient') {
        const appointmentTime = new Date(eligibilityData.data.scheduled_at);
        const now = new Date();
        const tenMinutesBefore = new Date(appointmentTime.getTime() - 10 * 60 * 1000);
        
        // Check if session exists and if doctor has joined
        let sessionResponse = await fetch(
          `${API_BASE}/telemedicine/appointment/${appointmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        let sessionData = await sessionResponse.json();
        
        const doctorHasStarted = sessionData.success && sessionData.data?.status === 'active';
        const canJoinEarly = now >= tenMinutesBefore;
        
        if (!doctorHasStarted && !canJoinEarly) {
          // Doctor hasn't started yet and it's not within 10 minutes
          const formattedTime = appointmentTime.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          setError(
            `Video call will start at ${formattedTime}. Please join on time.`
          );
          setLoading(false);
          return;
        }
      }

      // Step 3: Get or create telemedicine session
      let sessionResponse = await fetch(
        `${API_BASE}/telemedicine/appointment/${appointmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      let sessionData = await sessionResponse.json();

      // If no session exists, create one using the start endpoint
      if (!sessionData.success && sessionData.needsCreation) {
        // Use the start endpoint which works for both doctor and patient
        const startResponse = await fetch(
          `${API_BASE}/telemedicine/appointment/${appointmentId}/start`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              doctor_id: eligibilityData.data.doctor_id,
              patient_id: eligibilityData.data.patient_id,
              scheduled_at: eligibilityData.data.scheduled_at,
            }),
          }
        );
        sessionData = await startResponse.json();
        
        if (!sessionData.success) {
          throw new Error(sessionData.error || 'Failed to start telemedicine session');
        }
      }

      setSession(sessionData.data);
      setCallStatus('connecting');

      // Step 4: Generate Agora token
      const tokenResponse = await fetch(
        `${API_BASE}/telemedicine/sessions/${sessionData.data.id}/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const tokenData = await tokenResponse.json();

      if (!tokenData.success) {
        throw new Error('Failed to generate video token');
      }

      // Debug: Log token data
      console.log('Token data received:', {
        appId: tokenData.data?.appId,
        uid: tokenData.data?.uid,
        channelName: tokenData.data?.channelName,
        hasToken: !!tokenData.data?.token
      });

      // Step 5: Join Agora channel
      await joinAgoraChannel(tokenData.data, sessionData.data);

    } catch (err) {
      console.error('Initialize session error:', err);
      let errorMessage = 'Failed to initialize video consultation';
      
      if (err.message.includes('NOT_READABLE')) {
        errorMessage = 'Camera or microphone is already in use by another application. Please close all other apps using your camera (Zoom, Teams, other browser tabs) and try again.';
      } else if (err.message.includes('NotAllowedError') || err.message.includes('Permission denied')) {
        errorMessage = 'Camera/microphone permission denied. Please allow camera and microphone access in your browser settings and try again.';
      } else if (err.message.includes('NotFoundError')) {
        errorMessage = 'No camera or microphone found on your device. Please connect a camera/microphone and try again.';
      } else if (err.message.includes('OPERATION_ABORTED') || err.message.includes('canceled')) {
        errorMessage = 'Connection was canceled. Please try again.';
      } else if (err.message.includes('invalid token')) {
        errorMessage = 'Video call authentication failed. Please refresh the page and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setCallStatus('ended');
    } finally {
      setLoading(false);
      isInitializingRef.current = false;
    }
  };

  // Join Agora channel
  const joinAgoraChannel = async (tokenData, sessionData) => {
    // Guard against double initialization
    if (isJoiningRef.current) {
      console.warn('Already joining, skipping...');
      return;
    }
    isJoiningRef.current = true;

    try {
      // Aggressively clean up ALL existing tracks and client
      if (clientRef.current) {
        try {
          // Unpublish all tracks first
          try {
            await clientRef.current.unpublish();
          } catch (e) {}
          
          // Stop and close ALL local tracks
          if (localVideoTrack) {
            try {
              localVideoTrack.stop();
              localVideoTrack.close();
            } catch (e) {}
          }
          if (localAudioTrack) {
            try {
              localAudioTrack.stop();
              localAudioTrack.close();
            } catch (e) {}
          }
          
          // Clear state
          setLocalVideoTrack(null);
          setLocalAudioTrack(null);
          
          // Leave the channel
          await clientRef.current.leave();
          clientRef.current = null;
        } catch (e) {
          console.warn('Error during cleanup:', e);
        }
      }

      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to force release camera - but don't fail if it doesn't work
      try {
        console.log('Checking camera availability...');
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        console.log('Available video devices:', videoDevices.length);
        
        if (videoDevices.length === 0) {
          throw new Error('No camera detected on your device');
        }
      } catch (e) {
        console.warn('Device enumeration warning:', e.message);
      }

      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Join the channel with the EXACT UID from the token
      // UID MUST match the one used to generate the token
      console.log('Joining channel:', tokenData.channelName, 'with UID:', tokenData.uid);
      const uid = await client.join(
        tokenData.appId,
        tokenData.channelName,
        tokenData.token,
        tokenData.uid  // Use the UID from backend token response
      );

      console.log('Successfully joined channel with UID:', uid);

      // Small delay before creating tracks
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create tracks - try with camera/mic, but fallback to no media if it fails
      let videoTrack, audioTrack;
      
      try {
        console.log('Attempting to create camera and microphone tracks...');
        [videoTrack, audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks({
          encoderConfig: 'high_quality',
        });
        console.log('Camera and microphone tracks created successfully');
      } catch (mediaError) {
        console.warn('Could not create camera/microphone tracks:', mediaError.message);
        console.log('Joining with audio-only mode...');
        
        // Try to create audio only
        try {
          audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          console.log('Audio track created successfully');
        } catch (audioError) {
          console.warn('Could not create audio track either:', audioError.message);
          console.log('Joining without any media tracks (text-only mode)');
        }
      }
      
      setLocalVideoTrack(videoTrack || null);
      setLocalAudioTrack(audioTrack || null);

      // Publish tracks (even if some are null)
      const tracksToPublish = [];
      if (videoTrack) tracksToPublish.push(videoTrack);
      if (audioTrack) tracksToPublish.push(audioTrack);
      
      if (tracksToPublish.length > 0) {
        await client.publish(tracksToPublish);
        console.log(`Published ${tracksToPublish.length} track(s)`);
      } else {
        console.log('No media tracks to publish (text-only mode)');
      }

      // Play local video if available
      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Handle remote users
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        
        if (mediaType === 'video') {
          setRemoteUsers((prev) => [...prev, remoteUser]);
        }
        
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (remoteUser, mediaType) => {
        if (mediaType === 'video') {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
        }
      });

      client.on('user-left', (remoteUser) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== remoteUser.uid));
      });

      // Notify backend that user joined
      const token = localStorage.getItem('token');
      const sessionId = sessionData?.id;
      
      if (sessionId) {
        await fetch(
          `${API_BASE}/telemedicine/sessions/${sessionId}/join`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Notified backend of join for session:', sessionId);
      } else {
        console.warn('No session ID available to notify backend');
      }

      setCallStatus('connected');
    } catch (err) {
      console.error('Join Agora channel error:', err);
      throw new Error('Failed to join video call');
    } finally {
      // Reset the guard
      isJoiningRef.current = false;
    }
  };

  // Toggle microphone
  const toggleMute = async () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  // Toggle camera
  const toggleVideo = async () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  // Leave the call
  const leaveCall = async () => {
    try {
      const token = localStorage.getItem('token');

      // Notify backend
      if (session?.id) {
        await fetch(
          `${API_BASE}/telemedicine/sessions/${session.id}/leave`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Leave Agora channel
      if (clientRef.current) {
        await clientRef.current.leave();
      }

      // Close local tracks
      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }

      setCallStatus('ended');
      // Navigate back to doctor's consultation page
      if (user?.role === 'doctor') {
        navigate('/doctor-telemedicine', { state: { refresh: true } });
      } else {
        navigate('/telemedicine', { state: { refresh: true } });
      }
    } catch (err) {
      console.error('Leave call error:', err);
    }
  };

  // End session (doctor only)
  const endSession = async () => {
    if (user?.role !== 'doctor') return;

    try {
      const token = localStorage.getItem('token');
      const sessionId = session?.id;

      // End the telemedicine session
      if (sessionId) {
        await fetch(
          `${API_BASE}/telemedicine/sessions/${sessionId}/end`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Automatically mark appointment as completed
      if (appointmentId) {
        try {
          await fetch(`${API_BASE}/appointments/${appointmentId}/complete`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('Appointment automatically marked as completed');
        } catch (err) {
          console.error('Failed to auto-complete appointment:', err);
          // Continue with leave call even if this fails
        }
      }

      leaveCall();
    } catch (err) {
      console.error('End session error:', err);
      leaveCall(); // Still navigate even if end session fails
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#184E77] to-[#34A0A4] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#34A0A4] border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-[#184E77]">Initializing Video Consultation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#184E77] to-[#34A0A4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-[#184E77] mb-3">Connection Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/appointments/my')}
            className="bg-[#184E77] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#124170] transition"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (callStatus === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#184E77] to-[#34A0A4] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-[#184E77] mb-3">Consultation Ended</h2>
          <p className="text-gray-600 mb-6">
            {user?.role === 'doctor'
              ? 'The video consultation has been ended successfully.'
              : 'The doctor has ended the consultation.'}
          </p>
          <button
            onClick={() => navigate('/appointments/my', { state: { refresh: true } })}
            className="bg-[#184E77] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#124170] transition"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col">
      {/* Header */}
      <div className="bg-[#184E77] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Video Consultation</h1>
          <p className="text-white/70 text-sm">
            {user?.role === 'doctor' ? 'Patient' : 'Doctor'} Consultation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-white text-sm font-semibold">Connected</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Local Video */}
        <div className="relative bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
          <div ref={localVideoRef} className="w-full h-full min-h-[300px] object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg">
            <p className="text-white text-sm font-semibold">
              You ({user?.role === 'doctor' ? 'Doctor' : 'Patient'})
            </p>
          </div>
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#2a2a2a]">
              <div className="text-6xl">👤</div>
            </div>
          )}
        </div>

        {/* Remote Video */}
        {remoteUsers.length > 0 ? (
          remoteUsers.map((remoteUser) => (
            <div key={remoteUser.uid} className="relative bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
              <RemoteVideoPlayer user={remoteUser} />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg">
                <p className="text-white text-sm font-semibold">
                  {user?.role === 'doctor' ? 'Patient' : 'Doctor'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="relative bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-4">👤</div>
              <p className="text-white/70 text-lg">
                Waiting for {user?.role === 'doctor' ? 'patient' : 'doctor'} to join...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#184E77] px-6 py-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>

        {user?.role === 'doctor' ? (
          <button
            onClick={endSession}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-2xl transition shadow-lg"
          >
            📞
          </button>
        ) : (
          <button
            onClick={leaveCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-2xl transition shadow-lg"
          >
            📞
          </button>
        )}
      </div>
    </div>
  );
};

// Remote video player component
const RemoteVideoPlayer = ({ user }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }

    return () => {
      if (user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user.videoTrack]);

  return <div ref={videoRef} className="w-full h-full min-h-[300px]" />;
};

export default DushaniVideoCallPage;
