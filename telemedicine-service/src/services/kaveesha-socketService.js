// kaveesha-socketService.js
// Real-time signaling service using Socket.io for telemedicine

import { SessionModel, ChatModel } from '../models/kaveesha-sessionModel.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medicore_secret';

// Track connected users: { socketId -> { userId, userRole, sessionId, name } }
const connectedUsers = new Map();
// Track session rooms: { sessionId -> Set<socketId> }
const sessionRooms = new Map();

export function initializeSocketService(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));
      
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Telemedicine Socket] User connected: ${socket.user?.id} (${socket.user?.role})`);

    // ── Join session room ────────────────────────────────────────────────────
    socket.on('join_session', async ({ sessionId }) => {
      try {
        const session = await SessionModel.findById(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const { id: userId, role: userRole, name } = socket.user;

        // Validate user belongs to session
        if (session.doctor_id !== userId && session.patient_id !== userId) {
          socket.emit('error', { message: 'Not authorized for this session' });
          return;
        }

        socket.join(`session:${sessionId}`);
        
        // Track user
        connectedUsers.set(socket.id, { userId, userRole, sessionId, name });
        if (!sessionRooms.has(sessionId)) sessionRooms.set(sessionId, new Set());
        sessionRooms.get(sessionId).add(socket.id);

        // Update DB
        if (userRole === 'doctor') await SessionModel.doctorJoined(sessionId);
        else await SessionModel.patientJoined(sessionId);

        // Notify room
        socket.to(`session:${sessionId}`).emit('participant_joined', {
          userId, userRole, name, timestamp: new Date(),
        });

        // Send existing chat history
        const messages = await ChatModel.findBySession(sessionId);
        socket.emit('chat_history', messages);

        socket.emit('joined_session', {
          sessionId,
          session,
          message: 'Successfully joined session',
        });

        console.log(`[Socket] ${userRole} ${userId} joined session ${sessionId}`);
      } catch (err) {
        console.error('[Socket] join_session error:', err);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // ── Chat message ─────────────────────────────────────────────────────────
    socket.on('send_message', async ({ sessionId, message, messageType = 'text', fileUrl }) => {
      try {
        const { id: senderId, role: senderRole, name: senderName } = socket.user;
        
        const saved = await ChatModel.save({
          sessionId,
          senderId,
          senderRole,
          senderName,
          message,
          messageType,
          fileUrl,
        });

        io.to(`session:${sessionId}`).emit('new_message', saved);
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── WebRTC signaling (for additional peer signaling if needed) ───────────
    socket.on('webrtc_signal', ({ sessionId, signal, targetRole }) => {
      socket.to(`session:${sessionId}`).emit('webrtc_signal', {
        signal,
        fromRole: socket.user?.role,
        fromId: socket.user?.id,
      });
    });

    // ── Media toggle events ───────────────────────────────────────────────────
    socket.on('toggle_video', ({ sessionId, enabled }) => {
      socket.to(`session:${sessionId}`).emit('participant_video_toggle', {
        userId: socket.user?.id,
        userRole: socket.user?.role,
        enabled,
      });
    });

    socket.on('toggle_audio', ({ sessionId, enabled }) => {
      socket.to(`session:${sessionId}`).emit('participant_audio_toggle', {
        userId: socket.user?.id,
        userRole: socket.user?.role,
        enabled,
      });
    });

    // ── Screen share ──────────────────────────────────────────────────────────
    socket.on('screen_share_started', ({ sessionId }) => {
      socket.to(`session:${sessionId}`).emit('screen_share_started', {
        userId: socket.user?.id,
        userRole: socket.user?.role,
      });
    });

    socket.on('screen_share_stopped', ({ sessionId }) => {
      socket.to(`session:${sessionId}`).emit('screen_share_stopped', {
        userId: socket.user?.id,
      });
    });

    // ── End session ───────────────────────────────────────────────────────────
    socket.on('end_session', async ({ sessionId }) => {
      try {
        await SessionModel.endSession(sessionId);
        await SessionModel.logEvent(sessionId, socket.user?.id, socket.user?.role, 'END_SESSION', {});
        
        io.to(`session:${sessionId}`).emit('session_ended', {
          endedBy: socket.user?.role,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('[Socket] end_session error:', err);
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      const userData = connectedUsers.get(socket.id);
      if (userData) {
        const { userId, userRole, sessionId, name } = userData;
        connectedUsers.delete(socket.id);

        if (sessionRooms.has(sessionId)) {
          sessionRooms.get(sessionId).delete(socket.id);
          if (sessionRooms.get(sessionId).size === 0) {
            sessionRooms.delete(sessionId);
          }
        }

        socket.to(`session:${sessionId}`).emit('participant_left', {
          userId, userRole, name, timestamp: new Date(),
        });

        await SessionModel.logEvent(sessionId, userId, userRole, 'DISCONNECT', {}).catch(() => {});
        console.log(`[Socket] ${userRole} ${userId} disconnected from session ${sessionId}`);
      }
    });
  });

  return io;
}

export default initializeSocketService;