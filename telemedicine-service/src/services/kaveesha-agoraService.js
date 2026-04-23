// kaveesha-agoraService.js
// Business logic for Agora token generation and session management

import { generateAgoraToken, generateChannelName, generateUID, agoraConfig } from '../config/kaveesha-agoraConfig.js';
import { SessionModel, TokenModel } from '../models/kaveesha-sessionModel.js';

export const AgoraService = {
  /**
   * Initialize a new telemedicine session for an appointment
   */
  async initializeSession({ appointmentId, doctorId, patientId, scheduledAt }) {
    // Check if session already exists for this appointment
    let session = await SessionModel.findByAppointmentId(appointmentId);
    
    if (session && session.status !== 'ENDED' && session.status !== 'CANCELLED') {
      return session; // Return existing active session
    }

    const channelName = generateChannelName(appointmentId);
    session = await SessionModel.create({
      appointmentId,
      doctorId,
      patientId,
      channelName,
      scheduledAt,
      agoraAppId: agoraConfig.appId,
    });

    return session;
  },

  /**
   * Generate an Agora token for a user joining a session
   */
  async generateToken({ sessionId, userId, userRole }) {
    const session = await SessionModel.findById(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status === 'ENDED' || session.status === 'CANCELLED') {
      throw new Error('Session is no longer active');
    }

    // Check existing valid token
    const existing = await TokenModel.findBySessionAndUser(sessionId, userId);
    if (existing && new Date(existing.expires_at) > new Date()) {
      return {
        token: existing.token,
        uid: existing.uid,
        channelName: session.channel_name,
        appId: agoraConfig.appId,
        expiresAt: existing.expires_at,
        session,
      };
    }

    const uid = generateUID();
    const { token, expiresAt } = generateAgoraToken(session.channel_name, uid, 'publisher');

    await TokenModel.save({
      sessionId,
      userId,
      userRole,
      uid,
      channelName: session.channel_name,
      token,
      expiresAt,
    });

    return {
      token,
      uid,
      channelName: session.channel_name,
      appId: agoraConfig.appId,
      expiresAt,
      session,
    };
  },

  /**
   * Handle user joining a session
   */
  async handleJoin(sessionId, userId, userRole) {
    if (userRole === 'doctor') {
      await SessionModel.doctorJoined(sessionId);
    } else {
      await SessionModel.patientJoined(sessionId);
    }
    await SessionModel.logEvent(sessionId, userId, userRole, 'JOIN', { timestamp: new Date() });
  },

  /**
   * Handle user leaving a session
   */
  async handleLeave(sessionId, userId, userRole) {
    await SessionModel.logEvent(sessionId, userId, userRole, 'LEAVE', { timestamp: new Date() });
  },

  /**
   * End a session
   */
  async endSession(sessionId, userId, userRole) {
    const session = await SessionModel.endSession(sessionId);
    await SessionModel.logEvent(sessionId, userId, userRole, 'END_SESSION', { timestamp: new Date() });
    return session;
  },
};

export default AgoraService;