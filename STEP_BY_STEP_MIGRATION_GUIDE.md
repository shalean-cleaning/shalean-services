# Step-by-Step Migration Guide

## Overview
This guide provides individual SQL migration files that you can run one by one in the Supabase SQL Editor. This gives you better control and helps you understand what each step does.

## Prerequisites
- Supabase project set up
- Access to Supabase SQL Editor
- Basic understanding of SQL

## Migration Steps

### Step 1: Create Blog Posts Table
**File**: `MIGRATION_STEP_1_CREATE_BLOG_POSTS.sql`

**What it does**:
- Creates the `blog_posts` table for the blog preview section
- Sets up proper indexes for performance
- Enables Row Level Security (RLS)
- Creates security policies

**How to run**:
1. Open Supabase SQL Editor
2. Copy the contents of `MIGRATION_STEP_1_CREATE_BLOG_POSTS.sql`
3. Paste and execute
4. Verify: Check that `blog_posts` table appears in the Table Editor

---

### Step 2: Fix Content Blocks Table
**File**: `MIGRATION_STEP_2_FIX_CONTENT_BLOCKS.sql`

**What it does**:
- Drops the old `content_blocks` table (if it exists)
- Creates a new `content_blocks` table with the correct structure
- Uses `section_key` instead of `content_type` (as required by the task)
- Adds `icon_name` and `order_index` columns

**How to run**:
1. Copy the contents of `MIGRATION_STEP_2_FIX_CONTENT_BLOCKS.sql`
2. Paste and execute in SQL Editor
3. Verify: Check that `content_blocks` table has the correct structure

---

### Step 3: Seed Hero Content
**File**: `MIGRATION_STEP_3_SEED_HERO_CONTENT.sql`

**What it does**:
- Inserts the hero section content
- Sets up the main headline and description
- Uses `section_key = 'hero'`

**How to run**:
1. Copy the contents of `MIGRATION_STEP_3_SEED_HERO_CONTENT.sql`
2. Paste and execute
3. Verify: Run the SELECT query at the end to see the inserted data

---

### Step 4: Seed How It Works Content
**File**: `MIGRATION_STEP_4_SEED_HOW_IT_WORKS.sql`

**What it does**:
- Inserts the 3-step process content
- Each step has a title, description, and icon
- Uses `section_key = 'how-it-works'`

**How to run**:
1. Copy the contents of `MIGRATION_STEP_4_SEED_HOW_IT_WORKS.sql`
2. Paste and execute
3. Verify: Run the SELECT query to see all 3 steps

---

### Step 5: Seed Why Choose Us Content
**File**: `MIGRATION_STEP_5_SEED_WHY_CHOOSE_US.sql`

**What it does**:
- Inserts the 4 feature highlights
- Each feature has a title, description, and icon
- Uses `section_key = 'why-choose-us'`

**How to run**:
1. Copy the contents of `MIGRATION_STEP_5_SEED_WHY_CHOOSE_US.sql`
2. Paste and execute
3. Verify: Run the SELECT query to see all 4 features

---

### Step 6: Seed Blog Posts
**File**: `MIGRATION_STEP_6_SEED_BLOG_POSTS.sql`

**What it does**:
- Inserts 3 sample blog posts
- Each post has a title, slug, excerpt, and content
- Sets `is_published = true` for all posts
- Uses realistic publication dates

**How to run**:
1. Copy the contents of `MIGRATION_STEP_6_SEED_BLOG_POSTS.sql`
2. Paste and execute
3. Verify: Run the SELECT query to see the blog posts

---

### Step 7: Seed Team Members
**File**: `MIGRATION_STEP_7_SEED_TEAM_MEMBERS.sql`

**What it does**:
- Creates `team_members` table if it doesn't exist
- Inserts 4 sample team members
- Each member has a name, role, and bio
- Sets up proper RLS policies

**How to run**:
1. Copy the contents of `MIGRATION_STEP_7_SEED_TEAM_MEMBERS.sql`
2. Paste and execute
3. Verify: Run the SELECT query to see the team members

---

### Step 8: Seed Testimonials
**File**: `MIGRATION_STEP_8_SEED_TESTIMONIALS.sql`

**What it does**:
- Creates `testimonials` table if it doesn't exist
- Inserts 5 sample testimonials
- Each testimonial has a customer name, location, rating, and comment
- Sets some as featured (`is_featured = true`)

**How to run**:
1. Copy the contents of `MIGRATION_STEP_8_SEED_TESTIMONIALS.sql`
2. Paste and execute
3. Verify: Run the SELECT query to see the testimonials

---

### Step 9: Verify Setup
**File**: `MIGRATION_STEP_9_VERIFY_SETUP.sql`

**What it does**:
- Checks that all required tables exist
- Verifies that data has been inserted correctly
- Provides a summary of the migration status

**How to run**:
1. Copy the contents of `MIGRATION_STEP_9_VERIFY_SETUP.sql`
2. Paste and execute
3. Review the results to ensure everything is working

---

## Running the Migrations

### Option 1: One by One (Recommended)
1. Open Supabase SQL Editor
2. Run each step in order (1 through 9)
3. Verify each step before moving to the next
4. Use the verification queries in each file

### Option 2: All at Once
1. Copy all the SQL from steps 1-9
2. Paste into SQL Editor
3. Execute all at once
4. Run the verification step

## Troubleshooting

### Common Issues:

**Table already exists**:
- The migrations use `CREATE TABLE IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
- This is safe to run multiple times

**Permission errors**:
- Make sure you're using the service role key
- Check that RLS policies are set up correctly

**Data not showing**:
- Check that `is_active = true` for content blocks
- Check that `is_published = true` for blog posts
- Check that `is_featured = true` for testimonials

### Verification Queries:

```sql
-- Check all content blocks
SELECT * FROM content_blocks ORDER BY section_key, order_index;

-- Check blog posts
SELECT * FROM blog_posts WHERE is_published = true;

-- Check team members
SELECT * FROM team_members WHERE is_active = true;

-- Check testimonials
SELECT * FROM testimonials WHERE is_featured = true AND is_active = true;
```

## After Migration

Once all steps are complete:

1. **Test the homepage** - Visit your homepage and verify all sections load
2. **Check dynamic content** - Content should come from the database, not be hardcoded
3. **Verify performance** - Page should load quickly with server-side rendering
4. **Test error handling** - Homepage should show fallback content if database is unavailable

## Next Steps

- Add more content to the database as needed
- Consider creating an admin interface for content management
- Monitor performance and optimize queries if needed
- Add more blog posts, team members, and testimonials

## Support

If you encounter issues:
1. Check the Supabase logs
2. Verify table structures in the Table Editor
3. Test individual queries
4. Check RLS policies
5. Ensure all environment variables are set correctly
