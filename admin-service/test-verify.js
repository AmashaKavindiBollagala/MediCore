require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testUpdate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const doctorId = '040741f4-c5cd-48a7-9f4c-eba39c41a349';
    
    console.log('Updating doctor...');
    const result = await client.query(
      `UPDATE profiles
       SET verification_status = $1,
           verified = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, full_name, verification_status, verified`,
      ['approved', true, doctorId]
    );
    
    console.log('Update result:', result.rows[0]);
    
    await client.query('COMMIT');
    console.log('Transaction committed!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

testUpdate();
