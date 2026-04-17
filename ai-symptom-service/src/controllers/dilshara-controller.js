const pool = require('../config/db');
const aiService = require('../services/ai.service');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config();

// ─── Save to DB ───────────────────────────────────────────────────────────────
async function saveToDb({ userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended }) {
  await pool.query(
    `INSERT INTO symptom_checks 
      (user_id, input_type, original_input, language_detected, ai_response, specialty_recommended)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 1: Text
// POST /api/symptoms/text
// ─────────────────────────────────────────────────────────────────────────────
exports.checkByText = async (req, res) => {
  const { symptoms } = req.body;
  const userId = req.user.id;

  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ error: 'Symptoms text is required.' });
  }

  try {
    const result = await aiService.analyzeSymptoms(symptoms);

    await saveToDb({
      userId, inputType: 'text', originalInput: symptoms,
      languageDetected: null,
      aiResponse: JSON.stringify(result), specialtyRecommended: result.specialty_recommended || null,
    });

    res.json({ success: true, result });
  } catch (err) {
    console.error('checkByText error:', err.message);
    res.status(500).json({ error: 'AI processing failed.', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 2: PDF Upload (no image support)
// POST /api/symptoms/file
// ─────────────────────────────────────────────────────────────────────────────
exports.checkByFile = async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { mimetype, path: filePath, originalname } = req.file;

  // Only PDF allowed
  if (mimetype !== 'application/pdf') {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(415).json({ 
      error: 'Only PDF files are supported.' 
    });
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text?.trim();

    if (!extractedText) {
      return res.status(422).json({ error: 'Could not extract text from PDF.' });
    }

    const result = await aiService.analyzeSymptoms(
      `The following is extracted from a medical document (${originalname}):\n\n${extractedText}`
    );

    fs.unlinkSync(filePath);

    await saveToDb({
      userId, inputType: 'file', originalInput: `File: ${originalname}`,
      languageDetected: null, aiResponse: JSON.stringify(result),
      specialtyRecommended: result.specialty_recommended || null,
    });

    res.json({ success: true, result });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('checkByFile error:', err.message);
    res.status(500).json({ error: 'AI processing failed.', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 3: Voice (Groq Whisper)
// POST /api/symptoms/voice
// ─────────────────────────────────────────────────────────────────────────────
exports.checkByVoice = async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded.' });
  }

  const { path: filePath } = req.file;

  try {
    // Step 1: Transcribe with Groq Whisper
    const groq = new (require('groq-sdk'))({ apiKey: process.env.GROQ_API_KEY });
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      response_format: 'text',
    });

    const transcript = transcription.trim();

    if (!transcript) {
      return res.status(422).json({ error: 'Could not transcribe audio.' });
    }

    // Step 2: Analyze transcript with AI Service
    const result = await aiService.analyzeSymptoms(transcript);

    fs.unlinkSync(filePath);

    await saveToDb({
      userId, inputType: 'voice', originalInput: transcript,
      languageDetected: null, aiResponse: JSON.stringify(result),
      specialtyRecommended: result.specialty_recommended || null,
    });

    res.json({ success: true, transcript, result });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('checkByVoice error:', err.message);
    res.status(500).json({ error: 'Voice processing failed.', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER 4: History
// GET /api/symptoms/history
// ─────────────────────────────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT id, input_type, original_input, language_detected,
              ai_response, specialty_recommended, created_at
       FROM symptom_checks WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    const history = result.rows.map((row) => ({
      ...row, ai_response: aiService.parseResponse(row.ai_response),
    }));

    res.json({ success: true, history });
  } catch (err) {
    console.error('getHistory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};