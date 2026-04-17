const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/ai.config');

// ----------------- INIT AI PROVIDERS -----------------
const groq = new Groq({ apiKey: config.groqKey });
const genAI = new GoogleGenerativeAI(config.geminiKey);

// ----------------- SYSTEM PROMPT -----------------
function buildSystemPrompt() {
  return `You are a multilingual medical triage AI assistant for MediCore healthcare platform.

CRITICAL RULES:
- NEVER diagnose diseases definitively
- ONLY suggest POSSIBLE conditions based on symptoms
- ALWAYS recommend consulting a healthcare professional
- Be cautious and conservative in your assessments
- Respond in the SAME language the user used
- Return ONLY valid JSON, no markdown, no explanations

RESPONSE FORMAT (MUST BE VALID JSON):
{
  "summary": "Brief summary of symptoms identified (in user's language)",
  "possible_conditions": ["condition1", "condition2", "condition3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "specialty_recommended": "e.g. Cardiologist, General Practitioner, Dermatologist, Neurologist",
  "urgency": "low or medium or high",
  "disclaimer": "This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice."
}

URGENCY LEVELS:
- low: Mild symptoms, can wait for regular appointment
- medium: Should see doctor within a few days
- high: Seek medical attention promptly (not emergency, but urgent)

If symptoms appear to be a medical emergency (chest pain, difficulty breathing, severe bleeding, etc.), set urgency to "high" and emphasize seeking immediate medical care in recommendations.`;
}

// ----------------- GROQ PROVIDER -----------------
async function callGroq(text) {
  console.log('🔄 Attempting Groq AI analysis...');
  
  const res = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: text }
    ],
    temperature: 0.2,
    max_tokens: 800,
  });

  const content = res.choices[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');
  
  console.log('✅ Groq AI analysis successful');
  return content;
}

// ----------------- GEMINI PROVIDER -----------------
async function callGemini(text) {
  console.log('🔄 Attempting Gemini AI analysis...');
  
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `${buildSystemPrompt()}\n\nUser Symptoms: ${text}`;
  
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
    // Remove markdown code blocks if present
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    // Validate required fields
    if (!parsed.summary || !Array.isArray(parsed.possible_conditions)) {
      console.warn('⚠️ AI response missing required fields, using fallback');
      return getFallbackResponse(raw);
    }
    
    return parsed;
  } catch (err) {
    console.error('❌ Failed to parse AI response:', err.message);
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
async function analyzeSymptoms(text) {
  let lastError = null;
  
  // Try Groq first (faster, free tier)
  try {
    const groqResult = await callGroq(text);
    return parseResponse(groqResult);
  } catch (err1) {
    console.error('❌ Groq failed:', err1.message);
    lastError = err1;
    
    // Fallback to Gemini
    try {
      console.log('🔄 Switching to Gemini fallback...');
      const geminiResult = await callGemini(text);
      return parseResponse(geminiResult);
    } catch (err2) {
      console.error('❌ Gemini also failed:', err2.message);
      lastError = err2;
    }
  }
  
  // Both providers failed
  console.error('❌ All AI providers failed');
  throw new Error(`AI service unavailable. Last error: ${lastError.message}`);
}

// ----------------- EXPORTS -----------------
module.exports = {
  analyzeSymptoms,
  buildSystemPrompt,
  parseResponse
};
