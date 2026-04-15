CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  name VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(20),
  dob DATE,
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact VARCHAR(100),
  consultation_type VARCHAR(20) CHECK (consultation_type IN ('online', 'physical')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medical_reports (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id SERIAL PRIMARY KEY,
  patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
  doctor_name VARCHAR(100),
  appointment_id INT,
  medicine TEXT,
  dosage TEXT,
  notes TEXT,
  issued_at TIMESTAMP DEFAULT NOW()
);