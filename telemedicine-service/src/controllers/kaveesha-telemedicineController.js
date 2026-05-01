// kaveesha-telemedicineController.js
// Main controller handling all telemedicine REST endpoints

import { AgoraService } from '../services/kaveesha-agoraService.js';
import { SessionModel, ChatModel, NotesModel } from '../models/kaveesha-sessionModel.js';

// ── POST /telemedicine/sessions ─────────────────────────────────────────────
// Doctor or system creates a telemedicine session for an appointment
export async function createSession(req, res) {
  try {
    const { appointment_id, doctor_id, patient_id, scheduled_at } = req.body;

    if (!appointment_id || !doctor_id || !patient_id || !scheduled_at) {
      return res.status(400).json({
        success: false,
        error: 'appointment_id, doctor_id, patient_id, and scheduled_at are required',
      });
    }

    const session = await AgoraService.initializeSession({
      appointmentId: appointment_id,
      doctorId: doctor_id,
      patientId: patient_id,
      scheduledAt: new Date(scheduled_at),
    });

    return res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[createSession] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/sessions/:sessionId ───────────────────────────────────
// Get session details
export async function getSession(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await SessionModel.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    // Authorization check
    const userId = req.user.id;
    if (session.doctor_id !== userId && session.patient_id !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized for this session' });
    }

    return res.json({ success: true, data: session });
  } catch (err) {
    console.error('[getSession] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/appointment/:appointmentId ────────────────────────────
// Get session by appointment ID (auto-creates if doesn't exist)
export async function getSessionByAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    let session = await SessionModel.findByAppointmentId(appointmentId);
    
    // If session doesn't exist, we'll return 404
    // The frontend will then call the create session endpoint
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'No session found for this appointment',
        needsCreation: true 
      });
    }

    return res.json({ success: true, data: session });
  } catch (err) {
    console.error('[getSessionByAppointment] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/appointment/:appointmentId/start ─────────────────────
// Start/join session for an appointment (auto-creates if needed)
export async function startSessionForAppointment(req, res) {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Get appointment details from request body
    const { doctor_id, patient_id, scheduled_at } = req.body;
    
    if (!doctor_id || !patient_id || !scheduled_at) {
      return res.status(400).json({
        success: false,
        error: 'doctor_id, patient_id, and scheduled_at are required',
      });
    }
    
    // Check if session already exists
    let session = await SessionModel.findByAppointmentId(appointmentId);
    
    if (!session) {
      // Create new session
      const channelName = `medicore_${appointmentId.replace(/-/g, '').substring(0, 16)}_${Date.now().toString(36)}`;
      
      session = await SessionModel.create({
        appointmentId,
        doctorId: doctor_id,
        patientId: patient_id,
        channelName,
        scheduledAt: new Date(scheduled_at),
        agoraAppId: process.env.AGORA_APP_ID,
      });
    } else if (session.status === 'ENDED' || session.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: 'Session is no longer active',
      });
    }
    
    return res.json({ success: true, data: session, created: !session.created_at });
  } catch (err) {
    console.error('[startSessionForAppointment] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/sessions/:sessionId/token ────────────────────────────
// Generate Agora RTC token for a user joining the session
export async function generateToken(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // 'doctor' or 'patient'

    const tokenData = await AgoraService.generateToken({ sessionId, userId, userRole });

    return res.json({
      success: true,
      data: {
        token: tokenData.token,
        uid: tokenData.uid,
        channelName: tokenData.channelName,
        appId: tokenData.appId,
        expiresAt: tokenData.expiresAt,
        session: tokenData.session,
      },
    });
  } catch (err) {
    console.error('[generateToken] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/sessions/:sessionId/join ─────────────────────────────
// Record a user joining the session
export async function joinSession(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await AgoraService.handleJoin(sessionId, userId, userRole);
    const session = await SessionModel.findById(sessionId);

    return res.json({ success: true, data: session, message: 'Joined session successfully' });
  } catch (err) {
    console.error('[joinSession] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/sessions/:sessionId/leave ────────────────────────────
// Record a user leaving the session
export async function leaveSession(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await AgoraService.handleLeave(sessionId, userId, userRole);
    return res.json({ success: true, message: 'Left session' });
  } catch (err) {
    console.error('[leaveSession] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/sessions/:sessionId/end ──────────────────────────────
// End a telemedicine session (doctor only)
export async function endSession(req, res) {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const session = await SessionModel.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    if (userRole !== 'doctor' && session.doctor_id !== userId) {
      return res.status(403).json({ success: false, error: 'Only the doctor can end the session' });
    }

    const ended = await AgoraService.endSession(sessionId, userId, userRole);
    return res.json({ success: true, data: ended, message: 'Session ended successfully' });
  } catch (err) {
    console.error('[endSession] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/doctor/sessions ───────────────────────────────────────
// Get all sessions for the authenticated doctor
export async function getDoctorSessions(req, res) {
  try {
    const doctorId = req.user.id;
    const limit = parseInt(req.query.limit || '20');
    const offset = parseInt(req.query.offset || '0');

    const sessions = await SessionModel.findByDoctor(doctorId, limit, offset);
    return res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('[getDoctorSessions] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/patient/sessions ──────────────────────────────────────
// Get all sessions for the authenticated patient
export async function getPatientSessions(req, res) {
  try {
    const patientId = req.user.id;
    const limit = parseInt(req.query.limit || '20');
    const offset = parseInt(req.query.offset || '0');

    const sessions = await SessionModel.findByPatient(patientId, limit, offset);
    return res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('[getPatientSessions] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/sessions/:sessionId/chat ──────────────────────────────
// Get chat messages for a session
export async function getChatMessages(req, res) {
  try {
    const { sessionId } = req.params;
    const messages = await ChatModel.findBySession(sessionId);
    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error('[getChatMessages] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── POST /telemedicine/sessions/:sessionId/notes ────────────────────────────
// Doctor saves clinical notes / prescription for the session
export async function saveSessionNotes(req, res) {
  try {
    const { sessionId } = req.params;
    const doctorId = req.user.id;

    const session = await SessionModel.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    const { diagnosis, prescription, notes, follow_up_date } = req.body;

    const saved = await NotesModel.save({
      sessionId,
      doctorId,
      patientId: session.patient_id,
      diagnosis,
      prescription,
      notes,
      followUpDate: follow_up_date,
    });

    return res.json({ success: true, data: saved, message: 'Notes saved successfully' });
  } catch (err) {
    console.error('[saveSessionNotes] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/sessions/:sessionId/notes ─────────────────────────────
// Get clinical notes for a session
export async function getSessionNotes(req, res) {
  try {
    const { sessionId } = req.params;
    const notes = await NotesModel.findBySession(sessionId);
    return res.json({ success: true, data: notes });
  } catch (err) {
    console.error('[getSessionNotes] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

// ── GET /telemedicine/health ─────────────────────────────────────────────────
// Health check
export async function healthCheck(req, res) {
  return res.json({
    success: true,
    service: 'Telemedicine Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agora: {
      appId: process.env.AGORA_APP_ID ? 'configured' : 'MISSING',
    },
  });
}

// ── POST /telemedicine/sessions/:sessionId/chat ───────────────────────────────
// Save a chat message for a session
export async function saveChatMessage(req, res) {
  try {
    const { sessionId } = req.params;
    const { senderId, message, messageType = 'text', fileUrl } = req.body;

    if (!senderId || !message) {
      return res.status(400).json({ success: false, error: 'senderId and message are required' });
    }

    // Get user role and name from auth
    const { role, name } = req.user;

    await ChatModel.save({
      sessionId,
      senderId,
      senderRole: role,
      senderName: name,
      message,
      messageType,
      fileUrl,
    });

    return res.json({ success: true, message: 'Message saved' });
  } catch (err) {
    console.error('[saveChatMessage] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}