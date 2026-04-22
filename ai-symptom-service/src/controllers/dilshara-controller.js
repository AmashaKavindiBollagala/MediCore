const pool = require('../config/db');
const aiService = require('../services/ai.service');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Save to DB ───────────────────────────────────────────────────────────────
async function saveToDb({ userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended }) {
  await pool.query(
    `INSERT INTO symptom_checks 
      (user_id, input_type, original_input, language_detected, ai_response, specialty_recommended)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, inputType, originalInput, languageDetected, aiResponse, specialtyRecommended]
  );
}

// ─── Extract text from plain image using Tesseract OCR ───────────────────────
async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng+sin+tam', {
    logger: () => {}
  });
  return text?.trim();
}

// ─── Extract text from scanned/image PDF using Gemini Vision ─────────────────
async function extractTextFromImagePDF(buffer) {
  const base64 = buffer.toString('base64');

  try {
    // Try Groq vision first
    const groq = new (require('groq-sdk'))({ apiKey: process.env.GROQ_API_KEY });
    const groqResult = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:application/pdf;base64,${base64}` }
            },
            {
              type: 'text',
              text: 'Extract all text from this medical document. Return only the extracted text, nothing else.'
            }
          ]
        }
      ],
      max_tokens: 2000,
    });
    return groqResult.choices[0]?.message?.content?.trim();
  } catch (err) {
    console.error('❌ Groq PDF Vision failed, trying Gemini...', err.message);
    // Fallback to Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent([
      {
        inlineData: { mimeType: 'application/pdf', data: base64 }
      },
      { text: 'Extract all text from this medical document. Return only the extracted text, nothing else.' }
    ]);
    return result.response.text()?.trim();
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
// CONTROLLER 2: File Upload (text PDF + image PDF + plain image)
// POST /api/symptoms/file
// ─────────────────────────────────────────────────────────────────────────────
exports.checkByFile = async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const { mimetype, path: filePath, originalname } = req.file;
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(mimetype)) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(415).json({ error: 'Only PDF and image files (JPG, PNG, WEBP) are supported.' });
  }

  try {
    let extractedText = '';

    if (mimetype === 'application/pdf') {
      // Step 1: Try text extraction (text-based PDF)
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text?.trim();

      // Step 2: If no text, it's scanned → use Gemini Vision
      if (!extractedText || extractedText.length < 20) {
        console.log('📄 No text in PDF, trying Gemini Vision OCR...');
        extractedText = await extractTextFromImagePDF(buffer);
      }
  } else {
      // Step 3: Plain image → try Groq Vision first, fallback to Gemini
      console.log('🖼️ Image file detected, using Groq Vision...');
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');

      try {
        // Try Groq vision first (llama-4 supports vision)
        const groq = new (require('groq-sdk'))({ apiKey: process.env.GROQ_API_KEY });
        const groqResult = await groq.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimetype};base64,${base64}`
                  }
                },
                {
                  type: 'text',
                  text: 'Extract all text and data from this medical report/image. Include all values, normal ranges, and units. Return only the extracted text, nothing else.'
                }
              ]
            }
          ],
          max_tokens: 2000,
        });
        extractedText = groqResult.choices[0]?.message?.content?.trim();
        console.log('✅ Groq Vision extraction successful');
      } catch (groqErr) {
        console.error('❌ Groq Vision failed, trying Gemini...', groqErr.message);
        // Fallback to Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent([
          {
            inlineData: { mimeType: mimetype, data: base64 }
          },
          { text: 'Extract all text and data from this medical report/image. Include all values, normal ranges, and units. Return only the extracted text, nothing else.' }
        ]);
        extractedText = result.response.text()?.trim();
      }
    }

    if (!extractedText || extractedText.length < 10) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(422).json({ error: 'Could not extract text from file. Please upload a clearer document.' });
    }

    console.log(`✅ Extracted ${extractedText.length} characters from file`);

    const result = await aiService.analyzeSymptoms(
      `The following data is extracted from a medical lab report (${originalname}). 
Analyze ALL values carefully, identify which ones are OUTSIDE the normal range (marked in red or flagged), and provide detailed medical insights based on the abnormal values found.\n\n${extractedText}`
    );

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

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

  const { path: filePath, originalname } = req.file;

  try {
    // Rename file to add .webm extension (Groq Whisper requires proper extension)
    const path = require('path');
    const newPath = filePath + '.webm';
    fs.renameSync(filePath, newPath);

    const groq = new (require('groq-sdk'))({ apiKey: process.env.GROQ_API_KEY });
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(newPath),
      model: 'whisper-large-v3',
      response_format: 'text',
    });

    const transcript = transcription.trim();

    if (!transcript) {
      return res.status(422).json({ error: 'Could not transcribe audio.' });
    }

    const result = await aiService.analyzeSymptoms(transcript);

    fs.unlinkSync(newPath);

    await saveToDb({
      userId, inputType: 'voice', originalInput: transcript,
      languageDetected: null, aiResponse: JSON.stringify(result),
      specialtyRecommended: result.specialty_recommended || null,
    });

    res.json({ success: true, transcript, result });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (fs.existsSync(filePath + '.webm')) fs.unlinkSync(filePath + '.webm');
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