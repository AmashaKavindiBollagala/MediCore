const CryptoJS = require('crypto-js');

// Helper: Generate PayHere hash
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  console.log('=== Hash Generation ===');
  console.log('Merchant ID:', merchantId);
  console.log('Order ID:', orderId);
  console.log('Amount:', amount);
  console.log('Currency:', currency);
  console.log('Merchant Secret (first 10 chars):', merchantSecret ? merchantSecret.substring(0, 10) + '...' : 'UNDEFINED');
  
  // PayHere expects the merchant secret AS IS (do NOT decode Base64)
  const secret = merchantSecret;
  
  // Generate hash according to PayHere documentation:
  // MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret) ).toUpperCase()
  const hash = CryptoJS.MD5(
    merchantId + 
    orderId + 
    amount + 
    currency + 
    CryptoJS.MD5(secret).toString().toUpperCase()
  ).toString().toUpperCase();
  
  console.log('Generated Hash:', hash);
  console.log('======================');
  return hash;
};

// Helper: Verify PayHere webhook signature
const verifyPayHereWebhook = (body, merchantSecret) => {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;
  
  console.log('=== Webhook Verification ===');
  console.log('Merchant ID:', merchant_id);
  console.log('Order ID:', order_id);
  console.log('Amount:', payhere_amount);
  console.log('Currency:', payhere_currency);
  console.log('Status Code:', status_code);
  console.log('Received Signature:', md5sig);
  
  const localHash = CryptoJS.MD5(
    merchant_id + 
    order_id + 
    payhere_amount + 
    payhere_currency + 
    status_code + 
    CryptoJS.MD5(merchantSecret).toString().toUpperCase()
  ).toString().toUpperCase();
  
  console.log('Local Hash:', localHash);
  console.log('Match:', localHash === md5sig);
  console.log('===========================');
  
  return localHash === md5sig;
};

module.exports = {
  generatePayHereHash,
  verifyPayHereWebhook,
};
