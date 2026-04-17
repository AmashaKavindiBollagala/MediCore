const pool = require('../config/db');
const Groq = require('groq-sdk');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── System Prompt ────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  return `You are a multilingual medical AI assistant. 
Analyze the patient's symptoms and respond in the SAME language they used.
Always structure your response as valid JSON with these exact fields:
{
  "summary": "Brief summary of symptoms identified",
  "possible_conditions": ["condition1", "condition2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "specialty_recommended": "e.g. Cardiologist, General Practitioner, Dermatologist",
  "urgency": "low | medium | high",
  "disclaimer": "This is not a medical diagnosis. Please consult a doctor."
}
Do not include any text outside the JSON.`;
}

// ─── Shared AI Text Call ──────────────────────────────────────────────────────
async function callAI(userText) {
  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: userText },
    ],
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

// ─── Save to DB ───────────────────────────────────────────────────────────────
async function saveToDb({ userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended }) {
  await pool.query(
    `INSERT INTO symptom_checks 
      (user_id, input_type, original_input, language_detected, ai_response, specialty_recommended)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended]
  );
}

// ─── Parse AI JSON ────────────────────────────────────────────────────────────
function parseAIResponse(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { raw_response: raw, specialty_recommended: null };
  }
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
    const rawAI = await callAI(symptoms);
    const parsed = parseAIResponse(rawAI);

    await saveToDb({
      userId, inputType: 'text', originalInput: symptoms,
      languageDetected: parsed.language || null,
      aiResponse: rawAI, specialtyRecommended: parsed.specialty_recommended || null,
    });

    res.json({ success: true, result: parsed });
  } catch (err) {
    console.error('checkByText error:', err.message);
    res.status(500).json({ error: 'AI processing failed.' });
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

  // Only PDF allowed (no image support with Groq)
  if (mimetype !== 'application/pdf') {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(415).json({ 
      error: 'Only PDF files are supported. Image analysis is not available.' 
    });
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text?.trim();

    if (!extractedText) {
      return res.status(422).json({ error: 'Could not extract text from PDF.' });
    }

    const rawAI = await callAI(
      `The following is extracted from a medical document (${originalname}):\n\n${extractedText}`
    );
    const parsed = parseAIResponse(rawAI);

    fs.unlinkSync(filePath);

    await saveToDb({
      userId, inputType: 'file', originalInput: `File: ${originalname}`,
      languageDetected: null, aiResponse: rawAI,
      specialtyRecommended: parsed.specialty_recommended || null,
    });

    res.json({ success: true, result: parsed });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('checkByFile error:', err.message);
    res.status(500).json({ error: 'AI processing failed.' });
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
    // Step 1: Transcribe with Groq Whisper (free!)
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
      response_format: 'text',
    });

    const transcript = transcription.trim();

    if (!transcript) {
      return res.status(422).json({ error: 'Could not transcribe audio.' });
    }

    // Step 2: Analyze transcript with Llama 3
    const rawAI = await callAI(transcript);
    const parsed = parseAIResponse(rawAI);

    fs.unlinkSync(filePath);

    await saveToDb({
      userId, inputType: 'voice', originalInput: transcript,
      languageDetected: parsed.language || null, aiResponse: rawAI,
      specialtyRecommended: parsed.specialty_recommended || null,
    });

    res.json({ success: true, transcript, result: parsed });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error('checkByVoice error:', err.message);
    res.status(500).json({ error: 'Voice processing failed.' });
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
      ...row, ai_response: parseAIResponse(row.ai_response),
    }));

    res.json({ success: true, history });
  } catch (err) {
    console.error('getHistory error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};