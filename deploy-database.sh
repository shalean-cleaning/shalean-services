#!/bin/bash
# Deploy Shalean Services Database Schema
# This script helps deploy the database schema to Supabase

echo "🚀 Shalean Services Database Deployment"
echo "======================================"

# Check if Supabase CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

echo "📋 Available deployment options:"
echo "1. Deploy to Supabase Dashboard (Manual)"
echo "2. Try local Supabase instance"
echo "3. Show migration files for manual copy"
echo ""

read -p "Choose an option (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Manual Deployment via Supabase Dashboard:"
        echo "1. Go to https://supabase.com/dashboard"
        echo "2. Select your project"
        echo "3. Go to SQL Editor"
        echo "4. Run these files in order:"
        echo "   - supabase/migrations/001_create_core_tables.sql"
        echo "   - supabase/migrations/002_create_rls_policies.sql"
        echo "   - supabase/migrations/003_create_views_and_functions.sql"
        echo "   - supabase/seed.sql"
        echo ""
        echo "✅ After running migrations, your database will be ready!"
        ;;
    2)
        echo ""
        echo "🏠 Starting local Supabase instance..."
        echo "This may take a few minutes to download Docker images..."
        npx supabase start
        ;;
    3)
        echo ""
        echo "📄 Migration files ready for manual deployment:"
        echo ""
        echo "File 1: supabase/migrations/001_create_core_tables.sql"
        echo "File 2: supabase/migrations/002_create_rls_policies.sql"
        echo "File 3: supabase/migrations/003_create_views_and_functions.sql"
        echo "File 4: supabase/seed.sql"
        echo ""
        echo "📖 See supabase/migrations/README.md for detailed instructions"
        ;;
    *)
        echo "❌ Invalid option. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Database schema deployment guide complete!"
echo "📚 Check supabase/ERD_DOCUMENTATION.md for schema details"
echo "🔧 Check src/lib/database.types.ts for TypeScript types"
