# Development Team Schema Setup Script (PowerShell)
# This script creates the development_team_members table and related functionality

Write-Host "Setting up development team schema..." -ForegroundColor Green

# Check if we have the Supabase URL and key
if (-not $env:SUPABASE_URL -or -not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Host "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables" -ForegroundColor Red
    Write-Host "You can find these in your Supabase project settings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host '$env:SUPABASE_URL = "postgresql://postgres:[password]@[host]:5432/postgres"'
    Write-Host '$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"'
    exit 1
}

# Check if psql is available
try {
    psql --version | Out-Null
} catch {
    Write-Host "PostgreSQL client (psql) not found. Please install PostgreSQL or add it to your PATH." -ForegroundColor Red
    exit 1
}

# Run the SQL file
Write-Host "Creating development_team_members table..." -ForegroundColor Yellow
try {
    psql $env:SUPABASE_URL -f "database/development_team_schema.sql"
    Write-Host "Development team schema setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The following table was created:" -ForegroundColor Cyan
    Write-Host "- development_team_members (with RLS policies and triggers)" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now use the development team joining functionality." -ForegroundColor Green
} catch {
    Write-Host "Error running SQL script: $_" -ForegroundColor Red
    Write-Host "Please check your database connection and try again." -ForegroundColor Yellow
}
