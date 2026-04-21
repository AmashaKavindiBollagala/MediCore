const IORedis = require('ioredis');

const connection = new IORedis({
  host: 'redis',          // Docker service name
  port: 6379,
  maxRetriesPerRequest: null, // ✅ REQUIRED for BullMQ
});

connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

connection.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = connection;