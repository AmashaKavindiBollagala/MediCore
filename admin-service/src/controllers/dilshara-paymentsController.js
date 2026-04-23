// admin-service/src/controllers/dilshara-paymentsController.js
// Payment overview for admin dashboard - reads from neondb.transactions table

const { mainPool, doctorPool } = require('../config/dilshara-db');

// GET /admin/payments/stats
// Returns payment statistics for dashboard cards
exports.getPaymentStats = async (req, res) => {
  try {
    // Get all payment stats from transactions table
    const statsResult = await mainPool.query(`
      SELECT 
        COUNT(*) AS total_transactions,
        COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN status = 'SUCCESS' AND DATE(created_at) = CURRENT_DATE THEN amount ELSE 0 END), 0) AS today_revenue,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_count,
        COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) AS refunded_count,
        COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS success_count
      FROM transactions
    `);

    res.json({
      success: true,
      data: statsResult.rows[0]
    });
  } catch (err) {
    console.error('getPaymentStats error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/payments/transactions?status=all&limit=100
// Returns all transactions with optional filters
exports.getTransactions = async (req, res) => {
  try {
    const { status = 'all', patient_id, doctor_id } = req.query;

    // Build query with filters
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status !== 'all') {
      whereClause += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (patient_id) {
      whereClause += ` AND t.patient_id = $${paramIndex}`;
      params.push(patient_id);
      paramIndex++;
    }

    if (doctor_id) {
      whereClause += ` AND t.doctor_id = $${paramIndex}`;
      params.push(doctor_id);
      paramIndex++;
    }

    // Get transactions with patient and doctor names
    const transactionsResult = await mainPool.query(`
      SELECT 
        t.id,
        t.appointment_id,
        t.patient_id,
        t.doctor_id,
        t.amount,
        t.currency,
        t.payment_method,
        t.payment_gateway,
        t.status,
        t.transaction_type,
        t.gateway_transaction_id,
        t.refund_reason,
        t.created_at,
        t.updated_at,
        p.name AS patient_name,
        p.email AS patient_email,
        d.full_name AS doctor_name,
        d.specialty AS doctor_specialty
      FROM transactions t
      LEFT JOIN users p ON t.patient_id = p.id
      LEFT JOIN profiles d ON t.doctor_id = d.id
      ${whereClause}
      ORDER BY t.created_at DESC
    `, params);

    res.json({
      success: true,
      data: transactionsResult.rows,
      total: transactionsResult.rows.length
    });
  } catch (err) {
    console.error('getTransactions error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/payments/analytics
// Returns simple analytics for charts (last 7 days revenue)
exports.getAnalytics = async (req, res) => {
  try {
    // Get revenue for last 7 days
    const dailyRevenue = await mainPool.query(`
      SELECT 
        DATE(created_at) AS date,
        COUNT(*) AS transaction_count,
        COALESCE(SUM(CASE WHEN status = 'SUCCESS' THEN amount ELSE 0 END), 0) AS revenue,
        COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) AS success_count,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) AS failed_count
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Get payments by status
    const statusBreakdown = await mainPool.query(`
      SELECT 
        status,
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM transactions
      GROUP BY status
    `);

    // Get payments by method
    const methodBreakdown = await mainPool.query(`
      SELECT 
        payment_method,
        COUNT(*) AS count,
        COALESCE(SUM(amount), 0) AS total_amount
      FROM transactions
      GROUP BY payment_method
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: {
        daily_revenue: dailyRevenue.rows,
        status_breakdown: statusBreakdown.rows,
        method_breakdown: methodBreakdown.rows
      }
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /admin/payments/:id
// Get single transaction details
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await mainPool.query(`
      SELECT 
        t.*,
        p.name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone,
        d.full_name AS doctor_name,
        d.email AS doctor_email,
        d.specialty AS doctor_specialty
      FROM transactions t
      LEFT JOIN users p ON t.patient_id = p.id
      LEFT JOIN profiles d ON t.doctor_id = d.id
      WHERE t.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('getTransactionById error:', err);
    res.status(500).json({ error: err.message });
  }
};
