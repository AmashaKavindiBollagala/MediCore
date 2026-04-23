require('dotenv').config();
const pool = require('./src/config/kaveesha-doctorPool');

async function addUploadedByColumn() {
  try {
    console.log('🔄 Adding uploaded_by column to patient_reports table...');
    
    // Check if column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patient_reports' AND column_name = 'uploaded_by'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ uploaded_by column already exists');
      process.exit(0);
    }
    
    // Add the column
    await pool.query(`
      ALTER TABLE patient_reports 
      ADD COLUMN uploaded_by VARCHAR(20) DEFAULT 'doctor'
    `);
    
    console.log('✅ Successfully added uploaded_by column');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding column:', err.message);
    process.exit(1);
  }
}

addUploadedByColumn();
