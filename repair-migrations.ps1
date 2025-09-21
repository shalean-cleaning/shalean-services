# Repair Migration History Script
# This script repairs the migration history and applies fixes

Write-Host "🔧 Repairing Migration History..." -ForegroundColor Green
Write-Host ""

# 1. Repair migration 009
Write-Host "1. Repairing migration 009..." -ForegroundColor Yellow
try {
    $result = npx supabase migration repair --status reverted 009
    Write-Host "✅ Migration 009 repaired" -ForegroundColor Green
} catch {
    Write-Host "❌ Error repairing migration 009: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Pull latest migrations from remote
Write-Host ""
Write-Host "2. Pulling latest migrations from remote..." -ForegroundColor Yellow
try {
    $result = npx supabase db pull
    Write-Host "✅ Migrations pulled from remote" -ForegroundColor Green
} catch {
    Write-Host "❌ Error pulling migrations: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. List current migrations
Write-Host ""
Write-Host "3. Current migration status:" -ForegroundColor Yellow
try {
    $result = npx supabase migration list
    Write-Host $result
} catch {
    Write-Host "❌ Error listing migrations: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Migration repair complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: node fix-migration-issues.js" -ForegroundColor White
Write-Host "2. Run: npx supabase db push" -ForegroundColor White
Write-Host "3. Restart your dev server: npm run dev" -ForegroundColor White
Write-Host "4. Test the APIs again" -ForegroundColor White
