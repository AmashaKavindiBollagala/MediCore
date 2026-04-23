// admin-service/migrate-suspended-status.js
// Run this script to add 'suspended' to the verification_status CHECK constraint

const { Pool } = require('pg');
require('dotenv').config();

// Pool for doctor database (medicore_doctor)
const doctorPool = new Pool({
  connectionString: process.env.DOCTOR_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Pool for main database (neondb) - for users
const mainPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function runMigration() {
  console.log('Running migration: Add suspended status to profiles table...');
  
  const doctorClient = await doctorPool.connect();
  const mainClient = await mainPool.connect();
  
  try {
    // ============================================
    // PART 1: DOCTOR PROFILES - Add 'suspended' status
    // ============================================
    console.log('\n=== PART 1: Doctor Profiles ===');
    
    await doctorClient.query('BEGIN');
    
    // Step 1: Drop existing constraint
    console.log('Step 1: Dropping existing check constraint...');
    await doctorClient.query(`
      ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_verification_status_check
    `);
    console.log('✓ Old constraint dropped');
    
    // Step 2: Add new constraint with 'suspended'
    console.log('Step 2: Adding new check constraint with suspended status...');
    await doctorClient.query(`
      ALTER TABLE profiles 
      ADD CONSTRAINT profiles_verification_status_check 
      CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended'))
    `);
    console.log('✓ New constraint added');
    
    await doctorClient.query('COMMIT');
    
    // ============================================
    // PART 2: USER MANAGEMENT - Add status columns
    // ============================================
    console.log('\n=== PART 2: User Management ===');
    
    await mainClient.query('BEGIN');
    
    // Step 3: Add status column to users
    console.log('Step 3: Adding status column to users...');
    await mainClient.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    `);
    console.log('✓ Status column added');
    
    // Step 4: Add CHECK constraint for status
    console.log('Step 4: Adding CHECK constraint for status...');
    await mainClient.query(`
      ALTER TABLE users 
      DROP CONSTRAINT IF EXISTS users_status_check
    `);
    await mainClient.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_status_check 
      CHECK (status IN ('active', 'suspended', 'banned'))
    `);
    console.log('✓ Status constraint added');
    
    // Step 5: Add suspension_reason column
    console.log('Step 5: Adding suspension_reason column...');
    await mainClient.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS suspension_reason TEXT
    `);
    console.log('✓ Suspension reason column added');
    
    // Step 6: Add last_login column
    console.log('Step 6: Adding last_login column...');
    await mainClient.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP
    `);
    console.log('✓ Last login column added');
    
    // Step 7: Create indexes
    console.log('Step 7: Creating indexes...');
    await mainClient.query(`
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)
    `);
    await mainClient.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `);
    console.log('✓ Indexes created');
    
    await mainClient.query('COMMIT');
    
    // ============================================
    // PART 3: Verify all changes
    // ============================================
    console.log('\n=== Verifying Changes ===');
    
    // Verify doctor profiles constraint
    const doctorResult = await doctorClient.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'profiles'::regclass 
      AND contype = 'c'
      AND conname = 'profiles_verification_status_check'
    `);
    
    if (doctorResult.rows.length > 0) {
      console.log('✓ Doctor profiles constraint:');
      console.log(`  ${doctorResult.rows[0].definition}`);
    }
    
    // Verify user columns
    const userColumns = await mainClient.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('status', 'suspension_reason', 'last_login')
      ORDER BY column_name
    `);
    
    console.log('✓ User table columns:');
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nNew Features Available:');
    console.log('  • Doctor suspension/reactivation');
    console.log('  • User status management (active/suspended/banned)');
    console.log('  • User suspension reasons');
    console.log('  • Last login tracking');
    
  } catch (error) {
    await doctorClient.query('ROLLBACK').catch(() => {});
    await mainClient.query('ROLLBACK').catch(() => {});
    console.error('\n❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    doctorClient.release();
    mainClient.release();
    await doctorPool.end();
    await mainPool.end();
  }
}

runMigration();
