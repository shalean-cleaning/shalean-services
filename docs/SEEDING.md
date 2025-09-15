# Database Seeding Instructions

## Overview
This document explains how to seed the Supabase database with core data for the Shalean Services application.

## Prerequisites
- Access to your Supabase project dashboard
- Admin privileges on the Supabase project

## Steps

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** tab in the left sidebar
3. Click **"New query"** to create a new SQL query

### 2. Run the Seed Script
1. Copy the entire contents of `supabase/seed_core.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** to execute the script

### 3. Verify the Results
The script will:
- Add missing slug columns to all relevant tables
- Create unique indices for slug fields
- Normalize existing category slugs
- Remove duplicate "Standard Cleaning" entries
- Insert/update core service categories, services, extras, regions, and suburbs
- Enable Row Level Security (RLS) with public read policies

### 4. Redeploy Vercel
After successfully running the SQL script:
1. Go to your Vercel dashboard
2. Find your `shalean-services` project
3. Click **"Redeploy"**
4. **Important**: Check the **"Clear build cache"** option
5. Click **"Redeploy"** to trigger a fresh deployment

## What Gets Seeded

### Service Categories
- Standard Cleaning (`standard-cleaning`)
- Deep Cleaning (`deep-cleaning`)
- Move-In/Out Cleaning (`move-in-out`)
- Post-Construction (`post-construction`)
- Airbnb/Short-Let (`airbnb`)

### Services
Each category includes multiple service options with proper pricing in South African Rand (cents).

### Extras
- Inside Fridge
- Inside Oven
- Interior Windows
- Cabinets (Inside)
- Laundry & Ironing

### Regions & Suburbs
- Cape Town CBD (City Centre)
- Atlantic Seaboard (Sea Point, Green Point)
- Southern Suburbs (Claremont, Rondebosch)
- Northern Suburbs (Bellville, Durbanville)

## Troubleshooting

### If the script fails:
1. Check that all required tables exist in your database
2. Verify you have the necessary permissions
3. Run the script in smaller chunks if needed

### If data doesn't appear:
1. Check the RLS policies are correctly applied
2. Verify the API endpoints are using the correct table names
3. Clear Vercel build cache and redeploy

## Notes
- The script uses `ON CONFLICT` clauses to safely upsert data
- All prices are stored in cents (e.g., 80000 = R800.00)
- Slugs are automatically generated from names and made unique
- RLS policies allow anonymous read access to all seeded tables
