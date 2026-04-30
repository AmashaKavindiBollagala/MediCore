# Run Database Migration Script
# This script helps you run the patient_id migration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MediCore Database Migration Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Database connection details from .env
$DB_HOST = "ep-lingering-glitter-a1r112o9-pooler.ap-southeast-1.aws.neon.tech"
$DB_PORT = "5432"
$DB_NAME = "neondb"
$DB_USER = "neondb_owner"
$DB_PASSWORD = "npg_ZnWA9KSEqO7c"

Write-Host "Database: $DB_NAME" -ForegroundColor Yellow
Write-Host "Host: $DB_HOST" -ForegroundColor Yellow
Write-Host ""

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "ERROR: psql (PostgreSQL command line tool) is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You have two options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Run the SQL manually using an online tool:" -ForegroundColor Cyan
    Write-Host "  1. Go to your Neon.tech dashboard" -ForegroundColor White
    Write-Host "  2. Open the SQL editor for your database" -ForegroundColor White
    Write-Host "  3. Copy and paste the SQL from: appointment-service\sql\fix-patient-id-type.sql" -ForegroundColor White
    Write-Host "  4. Execute it" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Install PostgreSQL tools:" -ForegroundColor Cyan
    Write-Host "  Download from: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "Running migration..." -ForegroundColor Green
Write-Host ""

# Set the PGPASSWORD environment variable
$env:PGPASSWORD = $DB_PASSWORD

# Run the migration
$connectionString = "host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER sslmode=require"

try {
    $sqlFile = Join-Path $PSScriptRoot "sql\fix-patient-id-type.sql"
    
    if (-not (Test-Path $sqlFile)) {
        Write-Host "ERROR: SQL file not found at: $sqlFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Executing SQL file: $sqlFile" -ForegroundColor Yellow
    Write-Host ""
    
    $output = psql $connectionString -f $sqlFile 2>&1
    
    Write-Host $output
    Write-Host ""
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "  1. Restart your Docker containers:" -ForegroundColor White
        Write-Host "     docker-compose restart appointment-service" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  2. Test by booking a new appointment" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "  ❌ Migration failed!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check the error above and try again." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "ERROR: $_" -ForegroundColor Red
} finally {
    # Clear the password
    $env:PGPASSWORD = $null
}
