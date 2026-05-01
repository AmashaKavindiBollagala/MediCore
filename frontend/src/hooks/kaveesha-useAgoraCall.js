// kaveesha-useAgoraCall.js
// Custom React hook for managing Agora RTC video call state

import { useState, useEffect, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const MAIN_API = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export function useAgoraCall({ sessionId, token, userToken }) {
  const [localTracks, setLocalTracks] = useState({ audio: null, video: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [joined, setJoined] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState('DISCONNECTED');
  const [error, setError] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const clientRef = useRef(null);
  const screenTrackRef = useRef(null);
  const timerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize Agora client
  useEffect(() => {
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    const client = clientRef.current;

    client.on('connection-state-change', (state) => {
      setConnectionState(state);
    });

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === 'video') {
        setRemoteUsers((prev) => {
          const exists = prev.find((u) => u.uid === user.uid);
          if (!exists) return [...prev, user];
          return prev.map((u) => (u.uid === user.uid ? user : u));
        });
        // Play in remote container
        setTimeout(() => {
          if (remoteVideoRef.current) {
            user.videoTrack?.play(remoteVideoRef.current);
          }
        }, 100);
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      }
    });

    client.on('user-left', (user) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    return () => {
      leaveCall();
    };
  }, []);

  // Join channel
  const joinCall = useCallback(async ({ appId, channelName, agoraToken, uid, sessionId }) => {
    try {
      if (!sessionId) return;
      if (joined) return; // ✅ prevent duplicate join
      setError(null);
      const client = clientRef.current;

      await client.join(appId, channelName, agoraToken, uid);

      let audioTrack = null;
      let videoTrack = null;

      // Try A/V first
      try {
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: 'music_standard' },
          { encoderConfig: { width: 1280, height: 720, frameRate: 30, bitrateMax: 1000 } }
        );
      } catch (avErr) {
        console.warn('[useAgoraCall] A/V track creation failed, falling back to audio-only:', avErr);
        try {
          [audioTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { encoderConfig: 'music_standard' },
            undefined
          );
        } catch (audioErr) {
          throw new Error(`Audio track failed too: ${audioErr.message}`);
        }
      }

      setLocalTracks({ audio: audioTrack, video: videoTrack });

      // Play local video only if available
      if (videoTrack && localVideoRef.current) {
        videoTrack.play(localVideoRef.current);
      }

      // Publish audio (and video if available)
      const tracksToPublish = [audioTrack];
      if (videoTrack) tracksToPublish.push(videoTrack);
      await client.publish(tracksToPublish);

      setJoined(true);

      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setCallDuration(seconds);
      }, 1000);

      // Notify backend via API gateway
      await fetch(`${MAIN_API}/telemedicine/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('[useAgoraCall] joinCall error:', err);
      setError(err.message || 'Failed to join call');
    }
  }, [joined, sessionId, userToken]);

  // Leave channel
  const leaveCall = useCallback(async () => {
    console.log('[useAgoraCall] leaveCall called with sessionId:', sessionId);
    if (!sessionId) return;
    try {
      clearInterval(timerRef.current);
      timerRef.current = null;

      localTracks.audio?.setEnabled(false);
      localTracks.video?.setEnabled(false);

      localTracks.audio?.close();
      localTracks.video?.close();
      screenTrackRef.current?.close();

      if (clientRef.current?.connectionState !== 'DISCONNECTED') {
        await clientRef.current?.leave();
      }

      setJoined(false);
      setLocalTracks({ audio: null, video: null });
      setRemoteUsers([]);
      setIsScreenSharing(false);

      await fetch(`${MAIN_API}/telemedicine/sessions/${sessionId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}`, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('[useAgoraCall] leaveCall error:', err);
    }
  }, [localTracks, sessionId, userToken]);

  // Toggle audio
  const toggleAudio = useCallback(async () => {
    if (localTracks.audio) {
      await localTracks.audio.setEnabled(isAudioMuted);
      setIsAudioMuted((prev) => !prev);
    }
  }, [localTracks.audio, isAudioMuted]);

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localTracks.video) {
      await localTracks.video.setEnabled(isVideoOff);
      setIsVideoOff((prev) => !prev);
    }
  }, [localTracks.video, isVideoOff]);

  // Screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenTrackRef.current?.close();
      screenTrackRef.current = null;
      if (localTracks.video) {
        if (screenTrackRef.current) await clientRef.current?.unpublish([screenTrackRef.current]);
        await clientRef.current?.publish([localTracks.video]);
        localTracks.video.play(localVideoRef.current);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: '1080p_1' }, 'disable');
        screenTrackRef.current = screenTrack;
        if (localTracks.video) await clientRef.current?.unpublish([localTracks.video]);
        await clientRef.current?.publish([screenTrack]);
        screenTrack.play(localVideoRef.current);
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    }
  }, [isScreenSharing, localTracks.video]);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return {
    joined,
    localTracks,
    remoteUsers,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    connectionState,
    error,
    callDuration: formatDuration(callDuration),
    localVideoRef,
    remoteVideoRef,
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
  };
}

export default useAgoraCall;