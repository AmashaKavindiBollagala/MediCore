CREATE TABLE IF NOT EXISTS symptom_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  input_type VARCHAR(10) NOT NULL CHECK (input_type IN ('text', 'file', 'voice')),
  original_input TEXT,
  language_detected VARCHAR(50),
  ai_response TEXT NOT NULL,
  specialty_recommended VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_symptom_checks_user_id ON symptom_checks(user_id);