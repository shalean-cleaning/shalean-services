# Fix API 500 Errors Script - Simple Version
# This script fixes the database schema mismatches causing 500 errors

Write-Host "🔧 Fixing API 500 Errors..." -ForegroundColor Green
Write-Host ""

# 1. Create migration to add missing columns
Write-Host "1. Creating migration for missing columns..." -ForegroundColor Yellow

$migrationContent = @"
-- Migration: Fix API 500 Errors
-- Description: Add missing columns that APIs expect

-- Add missing columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS auto_assign BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN bookings.auto_assign IS 'Whether to automatically assign a cleaner or allow manual selection';
COMMENT ON COLUMN bookings.address IS 'Customer address for the cleaning service';
COMMENT ON COLUMN bookings.postcode IS 'Postal code for the service location';
COMMENT ON COLUMN bookings.bedrooms IS 'Number of bedrooms to clean';
COMMENT ON COLUMN bookings.bathrooms IS 'Number of bathrooms to clean';

-- Ensure cleaners table has the correct structure
ALTER TABLE cleaners 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS contact_info TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Update existing cleaners if needed
UPDATE cleaners 
SET name = COALESCE(name, 'Unknown Cleaner'),
    active = COALESCE(active, true)
WHERE name IS NULL OR active IS NULL;
"@

$migrationPath = "supabase/migrations/022_fix_api_500_errors.sql"
Set-Content -Path $migrationPath -Value $migrationContent -Encoding UTF8
Write-Host "✅ Created migration file" -ForegroundColor Green

# 2. Update API code to use correct column names
Write-Host ""
Write-Host "2. Updating API code..." -ForegroundColor Yellow

# Update cleaners availability API
$cleanersApiPath = "src/app/api/cleaners/availability/route.ts"
$cleanersApiContent = Get-Content -Path $cleanersApiPath -Raw -Encoding UTF8

# Fix the query to use correct column names
$cleanersApiContent = $cleanersApiContent -replace '\.select\(`[\s\S]*?`\)', @"
.select(\`
          id,
          name,
          contact_info,
          bio,
          active,
          created_at
        \`)
"@

# Remove the complex booking filter that's causing syntax errors
$cleanersApiContent = $cleanersApiContent -replace "\.eq\('is_active', true\)\s*\.eq\('is_available', true\);", ".eq('active', true);"

# Fix the cleaner name extraction
$cleanersApiContent = $cleanersApiContent -replace "const profile = cleaner\.profiles;\s*const cleanerName = profile \? `\${profile\.first_name} \${profile\.last_name}` : 'Unknown Cleaner';", "const cleanerName = cleaner.name || 'Unknown Cleaner';"

Set-Content -Path $cleanersApiPath -Value $cleanersApiContent -Encoding UTF8
Write-Host "✅ Updated cleaners availability API" -ForegroundColor Green

# Update bookings draft API
$bookingsApiPath = "src/app/api/bookings/draft/route.ts"
$bookingsApiContent = Get-Content -Path $bookingsApiPath -Raw -Encoding UTF8

# Add back the auto_assign field since we're adding it to the database
$bookingsApiContent = $bookingsApiContent -replace "const insertData: any = \{\s*status: 'DRAFT',\s*booking_date: new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\],\s*start_time: '09:00',\s*end_time: '11:00',\s*total_price: 0\s*\}", @"
const insertData: any = {
      status: 'DRAFT',
      booking_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '11:00',
      total_price: 0,
      auto_assign: true
    }
"@

# Add back the auto_assign field to update logic
$bookingsApiContent = $bookingsApiContent -replace "// auto_assign column not available in current schema", "if (requestData.autoAssign !== undefined) updateData.auto_assign = requestData.autoAssign"

Set-Content -Path $bookingsApiPath -Value $bookingsApiContent -Encoding UTF8
Write-Host "✅ Updated bookings draft API" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All fixes applied!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: npx supabase db push" -ForegroundColor White
Write-Host "2. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "3. Test the APIs again" -ForegroundColor White
Write-Host ""
Write-Host "✨ The 500 errors should now be resolved!" -ForegroundColor Green
