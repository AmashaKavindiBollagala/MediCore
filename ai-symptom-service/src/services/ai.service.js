const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/ai.config');

// ----------------- INIT AI PROVIDERS -----------------
const groq = new Groq({ apiKey: config.groqKey });
const genAI = new GoogleGenerativeAI(config.geminiKey);

// ----------------- LANGUAGE DETECTION -----------------
function detectLanguage(text) {
  const sinhalaRegex = /[\u0D80-\u0DFF]/;
  const tamilRegex = /[\u0B80-\u0BFF]/;
  
  if (sinhalaRegex.test(text)) return 'Sinhala';
  if (tamilRegex.test(text)) return 'Tamil';
  return 'English';
}

// ----------------- SYSTEM PROMPT -----------------
function buildSystemPrompt(detectedLanguage) {
  const languageInstructions = {
    'Sinhala': `LANGUAGE: SINHALA - You MUST respond ENTIRELY in Sinhala (සිංහල) language ONLY.
- All JSON fields must be 100% in Sinhala script
- Do NOT use any English words
- Example: "හිසරදය සහ උණ රෝග ලක්ෂණ"`,
    'Tamil': `LANGUAGE: TAMIL - You MUST respond ENTIRELY in Tamil (தமிழ்) language ONLY.
- All JSON fields must be 100% in Tamil script
- Do NOT use any English words
- Example: "தலைவலி மற்றும் காய்ச்சல் அறிகுறிகள்"`,
    'English': `LANGUAGE: ENGLISH - You MUST respond ENTIRELY in English language ONLY.
- All JSON fields must be 100% in English
- Do NOT use any other languages
- Example: "Headache and fever symptoms"`
  };

  return `You are a multilingual medical triage AI assistant for MediCore healthcare platform.

${languageInstructions[detectedLanguage]}

CRITICAL MEDICAL RULES:
- NEVER diagnose diseases definitively
- ONLY suggest POSSIBLE conditions based on symptoms
- ALWAYS recommend consulting a healthcare professional
- Be cautious and conservative in your assessments
- Return ONLY valid JSON, no markdown, no explanations

LAB REPORT RULES:
- When given lab report data, identify ALL abnormal values (above or below normal range)
- Explain what each abnormal value may indicate
- List possible conditions based on the combination of abnormal values
- Provide specific recommendations based on the findings
- Be thorough - patients need to understand their results

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "summary": "Brief summary of symptoms",
  "possible_conditions": ["condition1", "condition2", "condition3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "home_remedies": ["remedy1", "remedy2", "remedy3"],
  "important_notes": ["note1", "note2"],
  "specialty_recommended": "Medical specialist type",
  "urgency": "low or medium or high",
  "disclaimer": "Medical disclaimer"
}

HOME REMEDIES RULES:
- Suggest 2-4 safe, practical home remedies relevant to the symptoms
- Include things like hydration, rest, warm compress, ginger tea, steam inhalation etc.
- Only suggest remedies that are safe and widely accepted
- Never suggest remedies that could be harmful

IMPORTANT NOTES RULES:
- Include 1-3 warning signs that mean the patient should seek immediate care
- Example: "Go to emergency if fever exceeds 39°C"
- Keep these concise and actionable

URGENCY LEVELS:
- low: Mild symptoms, can wait for regular appointment
- medium: Should see doctor within a few days  
- high: Seek medical attention promptly

If symptoms appear to be a medical emergency (chest pain, difficulty breathing, severe bleeding), set urgency to "high" and emphasize seeking immediate medical care in recommendations.`;
}

// ----------------- LAB REPORT SYSTEM PROMPT -----------------
function buildLabReportPrompt() {
  return `You are a medical lab report analyzer for MediCore healthcare platform.

You will receive extracted text from a lab report. Your job is to:
1. Identify ALL test values and their normal ranges
2. Flag values that are LOW, HIGH, or BORDERLINE
3. Explain in simple language what each abnormal value means
4. Suggest possible conditions based on the combination of abnormal values
5. Give clear, actionable recommendations

Return ONLY valid JSON in this exact format:
{
  "summary": "Clear summary of the overall lab report findings",
  "abnormal_values": [
    {
      "test": "Test name",
      "value": "Patient value with unit",
      "normal_range": "Normal range with unit",
      "status": "LOW or HIGH or BORDERLINE",
      "meaning": "What this means in simple language"
    }
  ],
  "possible_conditions": ["condition1", "condition2", "condition3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "home_remedies": ["remedy1", "remedy2"],
  "important_notes": ["warning sign 1", "warning sign 2"],
  "specialty_recommended": "Medical specialist type",
  "urgency": "low or medium or high",
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional."
}

RULES:
- NEVER diagnose definitively
- Always recommend professional consultation
- Explain medical terms in simple language
- Be thorough - list every abnormal value
- Return ONLY valid JSON, no markdown, no extra text`;
}

// ----------------- GROQ PROVIDER -----------------
async function callGroq(text, detectedLanguage) {
  console.log(`🔄 Attempting Groq AI analysis (${detectedLanguage})...`);
  
  const res = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: buildSystemPrompt(detectedLanguage) },
      { role: 'user', content: text }
    ],
    temperature: 0.2,
    max_tokens: 1200,
  });

  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');
  
  console.log('✅ Groq AI analysis successful');
  return content;
}

// ----------------- GEMINI PROVIDER -----------------
async function callGemini(text, detectedLanguage) {
  console.log(`🔄 Attempting Gemini AI analysis (${detectedLanguage})...`);
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `${buildSystemPrompt(detectedLanguage)}\n\nUser Symptoms: ${text}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const content = response.text();
  
  if (!content) throw new Error('Gemini returned empty response');
  
  console.log('✅ Gemini AI analysis successful');
  return content;
}

// ----------------- RESPONSE PARSER -----------------
function parseResponse(raw) {
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.summary || !Array.isArray(parsed.possible_conditions)) {
      console.warn('⚠️ AI response missing required fields, using fallback');
      return getFallbackResponse(raw);
    }
    
    if (!parsed.abnormal_values) {
      parsed.abnormal_values = [];
    }

    return parsed;
  } catch (err) {
    console.error('❌ Failed to parse AI response:', err.message);
    console.error('Raw response was:', raw?.substring(0, 500));
    return getFallbackResponse(raw);
  }
}

// ----------------- FALLBACK RESPONSE -----------------
function getFallbackResponse(rawText) {
  return {
    summary: "Symptoms received and analyzed",
    possible_conditions: ["Multiple possibilities exist based on your symptoms"],
    recommendations: [
      "Consult a healthcare professional for proper evaluation",
      "Monitor your symptoms closely",
      "Seek immediate care if symptoms worsen"
    ],
    specialty_recommended: "General Practitioner",
    urgency: "medium",
    disclaimer: "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.",
    raw_response: rawText
  };
}

// ----------------- MAIN ANALYSIS FUNCTION WITH FALLBACK -----------------
async function analyzeSymptoms(text, isLabReport = false) {
  let lastError = null;
  
  const detectedLanguage = detectLanguage(text);
  console.log(`🌐 Detected language: ${detectedLanguage}`);
  
  const systemPrompt = isLabReport 
    ? buildLabReportPrompt() 
    : buildSystemPrompt(detectedLanguage);

  // Try Groq first
  try {
    console.log(`🔄 Attempting Groq AI analysis...`);
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });
    const content = res.choices[0]?.message?.content;
    if (!content) throw new Error('Groq returned empty response');
    console.log('✅ Groq AI analysis successful');
    return parseResponse(content);
  } catch (err1) {
    console.error('❌ Groq failed:', err1.message);
    lastError = err1;

    // Fallback to Gemini
    try {
      console.log('🔄 Switching to Gemini fallback...');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `${systemPrompt}\n\nData to analyze:\n${text}`;
      const result = await model.generateContent(prompt);
      const content = result.response.text();
      if (!content) throw new Error('Gemini returned empty response');
      console.log('✅ Gemini AI analysis successful');
      return parseResponse(content);
    } catch (err2) {
      console.error('❌ Gemini also failed:', err2.message);
      lastError = err2;
    }
  }

  throw new Error(`AI service unavailable. Last error: ${lastError.message}`);
}

// ----------------- EXPORTS -----------------
module.exports = {
  analyzeSymptoms,
  buildSystemPrompt,
  buildLabReportPrompt,
  parseResponse,
  detectLanguage
};