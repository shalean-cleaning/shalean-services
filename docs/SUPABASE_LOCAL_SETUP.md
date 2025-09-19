# Supabase Local Development Setup

## Issue: 500 Internal Server Error on Signup

The error occurs because Supabase is configured with production URLs but you're running locally.

## Root Cause

1. **Environment Variables**: `.env.local` had production URLs (`https://shalean-services.vercel.app/`)
2. **Supabase Configuration**: Auth settings only allow production redirect URLs
3. **Port Mismatch**: App runs on `localhost:3002` but Supabase expects different URLs

## Solution

### 1. Environment Variables Fixed ✅

The `npm run fix-local-env` script has updated your `.env.local` file:
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3002`
- `NEXT_PUBLIC_BASE_URL`: `http://localhost:3002`

### 2. Supabase Dashboard Configuration Required

You need to add local development URLs to your Supabase project:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `gcmndztkikfwnxbfqctn`
3. **Navigate to**: Authentication → URL Configuration
4. **Add these URLs to "Site URL"**:
   - `http://localhost:3002`
   - `http://localhost:3000` (fallback)
5. **Add these URLs to "Redirect URLs"**:
   - `http://localhost:3002/auth/callback`
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3002/**` (wildcard for all localhost paths)
   - `http://localhost:3000/**` (wildcard for all localhost paths)

### 3. Code Changes Made ✅

- **Signup Component**: Now uses `window.location.origin` for dynamic redirect URLs
- **Environment Config**: Updated defaults to use `localhost:3002`
- **Validation Script**: Fixed to properly load `.env.local`

### 4. Testing the Fix

After updating Supabase configuration:

1. **Restart your development server**:
   ```bash
   npm run dev
   ```

2. **Test the signup flow**:
   - Go to `/auth/signup`
   - Try creating an account
   - Check that the redirect URL in the email uses `localhost:3002`

### 5. Production vs Development

- **Development**: Uses `localhost:3002` (or whatever port Next.js assigns)
- **Production**: Uses `https://shalean-services.vercel.app/`

The code automatically detects the environment and uses the appropriate URLs.

## Troubleshooting

If you still get 500 errors:

1. **Check Supabase Dashboard**: Ensure localhost URLs are added
2. **Verify Environment**: Run `npm run validate:env`
3. **Clear Cache**: Run `npm run clear-cache`
4. **Check Network Tab**: Look for the exact error in browser dev tools

## Alternative: Use Supabase CLI

If you prefer local development with Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# This will give you local URLs to use in .env.local
```
