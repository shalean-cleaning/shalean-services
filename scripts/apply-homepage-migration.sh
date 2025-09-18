#!/bin/bash

# Homepage Migration Script using Supabase CLI
# This script applies the database migration to add missing tables for the homepage

echo "🔧 Homepage Migration Script"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if Supabase is running
if ! supabase status &> /dev/null; then
    echo "❌ Supabase is not running"
    echo "Start it with: supabase start"
    exit 1
fi

echo "✅ Supabase is running"
echo ""

# Apply the migration
echo "🚀 Applying homepage migration..."
echo ""

# Use supabase db reset to apply all migrations including the new one
echo "📄 Applying migration: 004_add_missing_tables.sql"
supabase db reset --linked

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Added tables:"
    echo "   - blog_posts (for blog preview)"
    echo "   - content_blocks (fixed structure for homepage content)"
    echo "   - Sample data for development"
    echo ""
    echo "🎉 Homepage migration completed successfully!"
    echo "💡 The homepage should now load dynamic content from the database."
    echo ""
    echo "🔍 You can verify the tables in Supabase Studio:"
    echo "   Run: supabase studio"
else
    echo ""
    echo "❌ Migration failed!"
    echo "Check the error messages above for details."
    exit 1
fi
