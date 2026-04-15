require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/medicare',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    sandbox: process.env.PAYHERE_SANDBOX === 'true',
    checkoutUrl: process.env.PAYHERE_SANDBOX === 'true' 
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
};

module.exports = config;
