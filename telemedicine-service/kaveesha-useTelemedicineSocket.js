// kaveesha-useTelemedicineSocket.js
// Socket.io hook for real-time telemedicine features (chat, signals, participant events)

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_TELEMEDICINE_URL || 'http://localhost:4000';

export function useTelemedicineSocket({ sessionId, userToken, onParticipantJoined, onParticipantLeft, onSessionEnded }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [participantStatus, setParticipantStatus] = useState({
    doctor: { joined: false, videoEnabled: true, audioEnabled: true },
    patient: { joined: false, videoEnabled: true, audioEnabled: true },
  });

  useEffect(() => {
    if (!sessionId || !userToken) return;

    const socket = io(SOCKET_URL, {
      auth: { token: userToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_session', { sessionId });
      console.log('[Socket] Connected:', socket.id);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('chat_history', (history) => {
      setMessages(history || []);
    });

    socket.on('new_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('participant_joined', (data) => {
      setParticipantStatus((prev) => ({
        ...prev,
        [data.userRole]: { ...prev[data.userRole], joined: true },
      }));
      onParticipantJoined?.(data);
    });

    socket.on('participant_left', (data) => {
      setParticipantStatus((prev) => ({
        ...prev,
        [data.userRole]: { ...prev[data.userRole], joined: false },
      }));
      onParticipantLeft?.(data);
    });

    socket.on('participant_video_toggle', ({ userRole, enabled }) => {
      setParticipantStatus((prev) => ({
        ...prev,
        [userRole]: { ...prev[userRole], videoEnabled: enabled },
      }));
    });

    socket.on('participant_audio_toggle', ({ userRole, enabled }) => {
      setParticipantStatus((prev) => ({
        ...prev,
        [userRole]: { ...prev[userRole], audioEnabled: enabled },
      }));
    });

    socket.on('session_ended', (data) => {
      onSessionEnded?.(data);
    });

    socket.on('error', (err) => {
      console.error('[Socket] Error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, userToken]);

  const sendMessage = useCallback((message, messageType = 'text', fileUrl = null) => {
    socketRef.current?.emit('send_message', { sessionId, message, messageType, fileUrl });
  }, [sessionId]);

  const emitVideoToggle = useCallback((enabled) => {
    socketRef.current?.emit('toggle_video', { sessionId, enabled });
  }, [sessionId]);

  const emitAudioToggle = useCallback((enabled) => {
    socketRef.current?.emit('toggle_audio', { sessionId, enabled });
  }, [sessionId]);

  const emitEndSession = useCallback(() => {
    socketRef.current?.emit('end_session', { sessionId });
  }, [sessionId]);

  const emitScreenShare = useCallback((started) => {
    socketRef.current?.emit(started ? 'screen_share_started' : 'screen_share_stopped', { sessionId });
  }, [sessionId]);

  return {
    connected,
    messages,
    participantStatus,
    sendMessage,
    emitVideoToggle,
    emitAudioToggle,
    emitEndSession,
    emitScreenShare,
  };
}

export default useTelemedicineSocket;