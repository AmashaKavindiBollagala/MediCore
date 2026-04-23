// kaveesha-sessionModel.js
// Database model for telemedicine sessions

import { query } from '../config/kaveesha-dbConfig.js';

export const SessionModel = {
  // ── Create a new session ────────────────────────────────────────────────────
  async create({ appointmentId, doctorId, patientId, channelName, scheduledAt, agoraAppId }) {
    const res = await query(
      `INSERT INTO telemedicine_sessions
         (appointment_id, doctor_id, patient_id, channel_name, scheduled_at, agora_app_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [appointmentId, doctorId, patientId, channelName, scheduledAt, agoraAppId]
    );
    return res.rows[0];
  },

  // ── Find by ID ──────────────────────────────────────────────────────────────
  async findById(sessionId) {
    const res = await query(
      'SELECT * FROM telemedicine_sessions WHERE id = $1',
      [sessionId]
    );
    return res.rows[0] || null;
  },

  // ── Find by appointment ID ───────────────────────────────────────────────────
  async findByAppointmentId(appointmentId) {
    const res = await query(
      'SELECT * FROM telemedicine_sessions WHERE appointment_id = $1 ORDER BY created_at DESC LIMIT 1',
      [appointmentId]
    );
    return res.rows[0] || null;
  },

  // ── Find by channel name ────────────────────────────────────────────────────
  async findByChannel(channelName) {
    const res = await query(
      'SELECT * FROM telemedicine_sessions WHERE channel_name = $1',
      [channelName]
    );
    return res.rows[0] || null;
  },

  // ── Get all sessions for a doctor ──────────────────────────────────────────
  async findByDoctor(doctorId, limit = 20, offset = 0) {
    const res = await query(
      `SELECT ts.*, 
         to_json(ts.*) as session_data
       FROM telemedicine_sessions ts
       WHERE ts.doctor_id = $1
       ORDER BY ts.scheduled_at DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );
    return res.rows;
  },

  // ── Get all sessions for a patient ─────────────────────────────────────────
  async findByPatient(patientId, limit = 20, offset = 0) {
    const res = await query(
      `SELECT * FROM telemedicine_sessions
       WHERE patient_id = $1
       ORDER BY scheduled_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );
    return res.rows;
  },

  // ── Update session status ────────────────────────────────────────────────────
  async updateStatus(sessionId, status) {
    const res = await query(
      `UPDATE telemedicine_sessions SET status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [status, sessionId]
    );
    return res.rows[0];
  },

  // ── Mark doctor joined ───────────────────────────────────────────────────────
  async doctorJoined(sessionId) {
    const res = await query(
      `UPDATE telemedicine_sessions
       SET doctor_joined_at = NOW(), status = 'ACTIVE', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [sessionId]
    );
    return res.rows[0];
  },

  // ── Mark patient joined ──────────────────────────────────────────────────────
  async patientJoined(sessionId) {
    const res = await query(
      `UPDATE telemedicine_sessions
       SET patient_joined_at = NOW(), status = 'ACTIVE', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [sessionId]
    );
    return res.rows[0];
  },

  // ── End session ──────────────────────────────────────────────────────────────
  async endSession(sessionId) {
    const res = await query(
      `UPDATE telemedicine_sessions
       SET status = 'ENDED', ended_at = NOW(),
           duration_seconds = EXTRACT(EPOCH FROM (NOW() - COALESCE(started_at, NOW())))::INTEGER,
           updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [sessionId]
    );
    return res.rows[0];
  },

  // ── Save notes ───────────────────────────────────────────────────────────────
  async saveNotes(sessionId, notes) {
    const res = await query(
      `UPDATE telemedicine_sessions SET notes = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [notes, sessionId]
    );
    return res.rows[0];
  },

  // ── Log event ────────────────────────────────────────────────────────────────
  async logEvent(sessionId, userId, userRole, eventType, eventData = {}) {
    await query(
      `INSERT INTO telemedicine_events (session_id, user_id, user_role, event_type, event_data)
       VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, userId, userRole, eventType, JSON.stringify(eventData)]
    );
  },
};

export const TokenModel = {
  async save({ sessionId, userId, userRole, uid, channelName, token, expiresAt }) {
    const res = await query(
      `INSERT INTO telemedicine_tokens
         (session_id, user_id, user_role, uid, channel_name, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sessionId, userId, userRole, uid, channelName, token, expiresAt]
    );
    return res.rows[0];
  },

  async findBySessionAndUser(sessionId, userId) {
    const res = await query(
      `SELECT * FROM telemedicine_tokens
       WHERE session_id = $1 AND user_id = $2
       ORDER BY created_at DESC LIMIT 1`,
      [sessionId, userId]
    );
    return res.rows[0] || null;
  },
};

export const ChatModel = {
  async save({ sessionId, senderId, senderRole, senderName, message, messageType = 'text', fileUrl }) {
    const res = await query(
      `INSERT INTO telemedicine_chat_messages
         (session_id, sender_id, sender_role, sender_name, message, message_type, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sessionId, senderId, senderRole, senderName, message, messageType, fileUrl]
    );
    return res.rows[0];
  },

  async findBySession(sessionId) {
    const res = await query(
      `SELECT * FROM telemedicine_chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );
    return res.rows;
  },

  async markRead(sessionId, userId) {
    await query(
      `UPDATE telemedicine_chat_messages
       SET is_read = true
       WHERE session_id = $1 AND sender_id != $2`,
      [sessionId, userId]
    );
  },
};

export const NotesModel = {
  async save({ sessionId, doctorId, patientId, diagnosis, prescription, notes, followUpDate }) {
    const res = await query(
      `INSERT INTO telemedicine_session_notes
         (session_id, doctor_id, patient_id, diagnosis, prescription, notes, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (session_id)
       DO UPDATE SET diagnosis = $4, prescription = $5, notes = $6, follow_up_date = $7, updated_at = NOW()
       RETURNING *`,
      [sessionId, doctorId, patientId, diagnosis, JSON.stringify(prescription), notes, followUpDate]
    );
    return res.rows[0];
  },

  async findBySession(sessionId) {
    const res = await query(
      'SELECT * FROM telemedicine_session_notes WHERE session_id = $1',
      [sessionId]
    );
    return res.rows[0] || null;
  },
};