require('dotenv').config();
const pool = require('./src/config/kaveesha-doctorPool');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Running diagnosis column migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'sql', 'add-diagnosis-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully');
    
    // Verify the column exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' AND column_name = 'diagnosis'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: diagnosis column exists');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('❌ Warning: diagnosis column not found after migration');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
