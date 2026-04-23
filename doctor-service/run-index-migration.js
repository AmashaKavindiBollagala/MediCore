const { Pool } = require('pg');

const pool = new Pool({
  host: 'ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech',
  port: 5432,
  database: 'medicore_doctor',
  user: 'neondb_owner',
  password: 'npg_ZnWA9KSEqO7c',
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Running migration: Add appointment_id indexes...');

    // Create index for prescriptions
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prescriptions_appointment_id 
      ON prescriptions(appointment_id)
    `);
    console.log('✓ Created index: idx_prescriptions_appointment_id');

    // Create index for patient_reports
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_patient_reports_appointment_id 
      ON patient_reports(appointment_id)
    `);
    console.log('✓ Created index: idx_patient_reports_appointment_id');

    // Verify indexes
    const result = await pool.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('prescriptions', 'patient_reports') 
        AND indexname LIKE '%appointment_id%'
    `);

    console.log('\nIndexes created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.indexname} on ${row.tablename}`);
    });

    console.log('\n✓ Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
