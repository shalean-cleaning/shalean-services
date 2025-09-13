# 🚀 Shalean Services Database Deployment Guide

## Quick Start Options

### Option 1: Supabase Dashboard (Recommended for Production)

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project** (or create a new one)
3. **Navigate to SQL Editor**
4. **Run migrations in this exact order:**

```sql
-- Step 1: Core Tables
-- Copy and paste the entire content of: supabase/migrations/001_create_core_tables.sql

-- Step 2: Security Policies  
-- Copy and paste the entire content of: supabase/migrations/002_create_rls_policies.sql

-- Step 3: Views and Functions
-- Copy and paste the entire content of: supabase/migrations/003_create_views_and_functions.sql

-- Step 4: Seed Data
-- Copy and paste the entire content of: supabase/seed.sql
```

### Option 2: Local Development (Currently Starting)

Your local Supabase instance is starting up. Once ready, you can:

1. **Check status:**
   ```bash
   npx supabase status
   ```

2. **Apply migrations:**
   ```bash
   npx supabase db reset
   ```

3. **Access local dashboard:**
   - Studio: http://localhost:54323
   - API: http://localhost:54321

### Option 3: Manual File Copy

If you prefer to copy files manually:

1. **Open each migration file** in order
2. **Copy the entire content**
3. **Paste into Supabase SQL Editor**
4. **Execute each file separately**

## 📁 Files to Deploy

| File | Purpose | Order |
|------|---------|-------|
| `001_create_core_tables.sql` | Core schema, tables, indexes | 1st |
| `002_create_rls_policies.sql` | Security policies | 2nd |
| `003_create_views_and_functions.sql` | Business logic | 3rd |
| `seed.sql` | Sample data | 4th |

## 🔍 Verification Steps

After deployment, verify everything works:

```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Check sample data
SELECT COUNT(*) as service_count FROM services;
SELECT COUNT(*) as cleaner_count FROM cleaners;
SELECT COUNT(*) as suburb_count FROM suburbs;
```

## 🎯 What You'll Get

✅ **Complete cleaning service platform database**  
✅ **Role-based security (CUSTOMER, CLEANER, ADMIN)**  
✅ **Flexible pricing system with rules**  
✅ **Multi-location support (regions → suburbs)**  
✅ **Booking management with status tracking**  
✅ **Cleaner availability and scheduling**  
✅ **Payment processing support**  
✅ **Notification system**  
✅ **Rating and review system**  
✅ **Blog/content management**  
✅ **Performance-optimized with indexes**  
✅ **TypeScript types ready for frontend**  

## 🔧 Environment Variables

Make sure your `.env` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Unauthorized" error**: Check your Supabase project credentials
2. **Migration fails**: Ensure you're running files in the correct order
3. **RLS policies**: Verify user authentication is working
4. **Foreign key errors**: Check that all referenced records exist

### Reset Database:
```sql
-- Use with caution - this will delete all data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## 📞 Support

- **Supabase Docs**: https://supabase.com/docs
- **Schema Documentation**: `supabase/ERD_DOCUMENTATION.md`
- **Migration Guide**: `supabase/migrations/README.md`
- **TypeScript Types**: `src/lib/database.types.ts`

---

**🎉 Once deployed, your Shalean Services database will be ready for development!**
