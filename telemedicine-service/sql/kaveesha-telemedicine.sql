-- =====================================================
-- Telemedicine Service - PostgreSQL Schema
-- kaveesha-telemedicine.sql
-- =====================================================

-- Sessions table: tracks all video consultation sessions
CREATE TABLE IF NOT EXISTS telemedicine_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  channel_name VARCHAR(255) UNIQUE NOT NULL,
  agora_app_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'WAITING'
    CHECK (status IN ('WAITING', 'ACTIVE', 'ENDED', 'MISSED', 'CANCELLED')),
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  doctor_joined_at TIMESTAMP,
  patient_joined_at TIMESTAMP,
  doctor_left_at TIMESTAMP,
  patient_left_at TIMESTAMP,
  recording_enabled BOOLEAN DEFAULT false,
  recording_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Token store: Agora RTC tokens generated per session per user
CREATE TABLE IF NOT EXISTS telemedicine_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_role VARCHAR(20) NOT NULL CHECK (user_role IN ('doctor', 'patient')),
  uid INTEGER NOT NULL,
  channel_name VARCHAR(255) NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages within video session
CREATE TABLE IF NOT EXISTS telemedicine_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('doctor', 'patient')),
  sender_name VARCHAR(255),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'prescription')),
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Session notes / prescriptions written during call
CREATE TABLE IF NOT EXISTS telemedicine_session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  diagnosis TEXT,
  prescription JSONB,
  notes TEXT,
  follow_up_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Participant events log (join/leave/reconnect)
CREATE TABLE IF NOT EXISTS telemedicine_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES telemedicine_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_role VARCHAR(20),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_appointment ON telemedicine_sessions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sessions_doctor ON telemedicine_sessions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_patient ON telemedicine_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON telemedicine_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled ON telemedicine_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tokens_session ON telemedicine_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_session ON telemedicine_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_notes_session ON telemedicine_session_notes(session_id);

-- Update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_telemedicine_sessions_updated_at
  BEFORE UPDATE ON telemedicine_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_telemedicine_notes_updated_at
  BEFORE UPDATE ON telemedicine_session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();