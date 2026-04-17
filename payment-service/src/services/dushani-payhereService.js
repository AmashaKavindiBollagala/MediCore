const CryptoJS = require('crypto-js');

// Helper: Generate PayHere hash
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  // Decode Base64 if needed
  let secret = merchantSecret;
  try {
    // Try to decode if it's Base64
    const decoded = Buffer.from(merchantSecret, 'base64').toString('utf8');
    // If decoded successfully and looks like a number/string, use it
    if (decoded && decoded.length > 0) {
      secret = decoded;
      console.log('Merchant Secret - Using decoded value, length:', decoded.length);
    }
  } catch (error) {
    // If decode fails, use original
    console.log('Merchant Secret - Using original value');
  }
  
  const hash = CryptoJS.MD5(
    merchantId + 
    orderId + 
    amount + 
    currency + 
    CryptoJS.MD5(secret).toString().toUpperCase()
  ).toString().toUpperCase();
  
  console.log('Generated Hash:', hash);
  return hash;
};

// Helper: Verify PayHere webhook signature
const verifyPayHereWebhook = (body, merchantSecret) => {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;
  
  const localHash = CryptoJS.MD5(
    merchant_id + 
    order_id + 
    payhere_amount + 
    payhere_currency + 
    status_code + 
    CryptoJS.MD5(merchantSecret).toString().toUpperCase()
  ).toString().toUpperCase();
  
  return localHash === md5sig;
};

module.exports = {
  generatePayHereHash,
  verifyPayHereWebhook,
};
