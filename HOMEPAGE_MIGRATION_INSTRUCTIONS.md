# Homepage Migration Instructions

## Overview
This guide will help you apply the database migration to enable dynamic homepage content.

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Local Supabase running (`supabase start`)

## Option 1: Using Supabase CLI (Recommended)

### Step 1: Start Supabase
```bash
supabase start
```

### Step 2: Apply Migration
```bash
# Make the script executable (Linux/Mac)
chmod +x scripts/apply-homepage-migration.sh

# Run the migration
./scripts/apply-homepage-migration.sh
```

### Step 3: Verify
```bash
# Open Supabase Studio to verify tables
supabase studio
```

## Option 2: Using Node.js Script

### Step 1: Start Supabase
```bash
supabase start
```

### Step 2: Run Migration Script
```bash
node scripts/run-homepage-migration.js --local
```

## Option 3: Manual Migration

### Step 1: Start Supabase
```bash
supabase start
```

### Step 2: Open Supabase Studio
```bash
supabase studio
```

### Step 3: Run SQL
1. Go to the SQL Editor in Supabase Studio
2. Copy the contents of `supabase/migrations/004_add_missing_tables.sql`
3. Paste and execute the SQL

## What the Migration Does

### Creates New Tables:
- **`blog_posts`**: For blog preview section
- **Fixed `content_blocks`**: Proper structure for homepage content

### Adds Sample Data:
- Hero section content
- How It Works steps
- Why Choose Us features
- Sample blog posts
- Sample testimonials

### Enables Features:
- Dynamic homepage content
- Server-side rendering
- Database-driven sections

## Verification

After running the migration, verify:

1. **Tables exist**: Check Supabase Studio for `blog_posts`, `content_blocks`, `team_members`, `testimonials`
2. **Sample data**: Verify content is populated in the tables
3. **Homepage loads**: Visit the homepage and check that sections load
4. **Dynamic content**: Content should come from database, not hardcoded

## Troubleshooting

### Supabase not running
```bash
supabase start
```

### Migration fails
- Check Supabase is running: `supabase status`
- Check logs: `supabase logs`
- Try manual migration via Supabase Studio

### Environment variables missing
- For local development, the script auto-detects Supabase configuration
- For remote database, create `.env` file with your Supabase credentials

## Next Steps

After successful migration:
1. Test the homepage functionality
2. Verify all sections load dynamic content
3. Consider adding admin interface for content management
4. Add more content to the database as needed

## Support

If you encounter issues:
1. Check Supabase logs: `supabase logs`
2. Verify tables in Supabase Studio
3. Check the browser console for errors
4. Ensure all environment variables are set correctly
