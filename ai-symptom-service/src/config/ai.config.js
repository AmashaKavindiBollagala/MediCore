require('dotenv').config();

module.exports = {
  groqKey: process.env.GROQ_API_KEY,
  geminiKey: process.env.GEMINI_API_KEY,
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3000,
};
