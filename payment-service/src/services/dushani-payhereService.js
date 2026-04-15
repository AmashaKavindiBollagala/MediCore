const CryptoJS = require('crypto-js');

// Helper: Generate PayHere hash
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  return CryptoJS.MD5(
    merchantId + 
    orderId + 
    amount + 
    currency + 
    CryptoJS.MD5(merchantSecret).toString().toUpperCase()
  ).toString().toUpperCase();
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
