// admin-service/src/controllers/dilshara-paymentsController.js
// PLACEHOLDER — Payment logic is owned by the payments-service team
// This controller only exposes a read-only summary endpoint for the admin dashboard
// Wire up real payment DB queries here once the payments team exposes their schema

const pool = require('../config/dilshara-db');

// GET /admin/payments/summary
// Returns a basic summary — update queries once payments.transactions table is confirmed
exports.getPaymentsSummary = async (req, res) => {
  try {
    // TODO: Replace with real queries once payments-service schema is shared
    // Example expected table: payments.transactions (id, amount, status, created_at, patient_id, doctor_id)

    // Stub response so the frontend placeholder page doesn't crash
    res.json({
      note: 'Payments summary will be available once payments-service team exposes their DB schema.',
      stub: true,
      data: {
        total_revenue: null,
        successful_transactions: null,
        failed_transactions: null,
        pending_transactions: null,
        recent: [],
      },
    });
  } catch (err) {
    console.error('getPaymentsSummary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};