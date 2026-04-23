// kaveesha-telemedicineRoutes.js
// Express router for all telemedicine endpoints

import { Router } from 'express';
import {
  createSession,
  getSession,
  getSessionByAppointment,
  startSessionForAppointment,
  generateToken,
  joinSession,
  leaveSession,
  endSession,
  getDoctorSessions,
  getPatientSessions,
  getChatMessages,
  saveSessionNotes,
  getSessionNotes,
  healthCheck,
} from '../controllers/kaveesha-telemedicineController.js';

import {
  authenticate,
  requireDoctor,
  requireDoctorOrPatient,
} from '../middleware/kaveesha-authMiddleware.js';

const router = Router();

// Public health check
router.get('/health', healthCheck);

// ── Session management ───────────────────────────────────────────────────────
router.post('/sessions', authenticate, requireDoctor, createSession);
router.get('/sessions/:sessionId', authenticate, requireDoctorOrPatient, getSession);
router.get('/appointment/:appointmentId', authenticate, requireDoctorOrPatient, getSessionByAppointment);
router.post('/appointment/:appointmentId/start', authenticate, requireDoctorOrPatient, startSessionForAppointment);

// ── Token + join flow ────────────────────────────────────────────────────────
router.post('/sessions/:sessionId/token', authenticate, requireDoctorOrPatient, generateToken);
router.post('/sessions/:sessionId/join', authenticate, requireDoctorOrPatient, joinSession);
router.post('/sessions/:sessionId/leave', authenticate, requireDoctorOrPatient, leaveSession);
router.post('/sessions/:sessionId/end', authenticate, endSession);

// ── Chat ─────────────────────────────────────────────────────────────────────
router.get('/sessions/:sessionId/chat', authenticate, requireDoctorOrPatient, getChatMessages);

// ── Clinical notes ───────────────────────────────────────────────────────────
router.post('/sessions/:sessionId/notes', authenticate, requireDoctor, saveSessionNotes);
router.get('/sessions/:sessionId/notes', authenticate, requireDoctorOrPatient, getSessionNotes);

// ── History ──────────────────────────────────────────────────────────────────
router.get('/doctor/sessions', authenticate, requireDoctor, getDoctorSessions);
router.get('/patient/sessions', authenticate, requireDoctorOrPatient, getPatientSessions);

export default router;