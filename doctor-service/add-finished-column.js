require('dotenv').config();
const pool = require('./src/config/kaveesha-doctorPool');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('Running finished column migration...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'sql', 'add-finished-column.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully');
    
    // Verify the column exists
    const result = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' AND column_name = 'is_finished'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Verified: is_finished column exists');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('❌ Warning: is_finished column not found after migration');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
