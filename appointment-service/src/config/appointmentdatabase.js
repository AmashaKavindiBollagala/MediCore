require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/medicare',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
};

module.exports = config;
