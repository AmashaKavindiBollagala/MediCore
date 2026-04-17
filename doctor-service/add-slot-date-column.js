const pool = require('./src/config/kaveesha-doctorPool');

async function addSlotDateColumn() {
  try {
    console.log('Adding slot_date column to availability table...\n');
    
    // Add slot_date column (nullable for backward compatibility with existing weekly slots)
    await pool.query(`
      ALTER TABLE availability 
      ADD COLUMN IF NOT EXISTS slot_date DATE
    `);
    console.log('✅ slot_date column added');
    
    // Add index for faster date-based queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_availability_slot_date 
      ON availability(slot_date)
    `);
    console.log('✅ Index created on slot_date');
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

addSlotDateColumn();
