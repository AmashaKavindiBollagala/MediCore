const IORedis = require('ioredis');

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',  // Use localhost for local development
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // ✅ REQUIRED for BullMQ
});

connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

connection.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = connection;