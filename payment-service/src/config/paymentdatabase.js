require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  dbUser: process.env.DB_USER || 'postgres',
  dbHost: process.env.DB_HOST || 'postgres',
  dbName: process.env.DB_NAME || 'medicore_payment',
  dbPassword: process.env.DB_PASSWORD || 'postgres123',
  dbPort: process.env.DB_PORT || 5432,
  databaseUrl: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres123'}@${process.env.DB_HOST || 'postgres'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'medicore_payment'}`,
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_12345',
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID,
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET,
    sandbox: process.env.PAYHERE_SANDBOX === 'true',
    checkoutUrl: process.env.PAYHERE_SANDBOX === 'true' 
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:80',
  backendUrl: process.env.BACKEND_URL || 'http://localhost:8080',
};

module.exports = config;
