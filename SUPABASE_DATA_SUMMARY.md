# Supabase Data Summary

## Overview
Successfully loaded data from Supabase database. The database contains seeded data for a cleaning services platform.

## Database Connection
- **URL**: `http://127.0.0.1:54321` (Local Supabase instance)
- **Authentication**: Service Role Key (Admin access)
- **Status**: ✅ Connected successfully

## Data Summary

### Tables with Data

#### 1. Service Categories (4 records)
- Regular Cleaning - Standard cleaning services for homes and offices
- Deep Cleaning - Thorough cleaning for special occasions or move-in/out
- Commercial Cleaning - Professional cleaning for businesses and offices
- Specialized Services - Carpet cleaning, window cleaning, and other specialized services

#### 2. Services (10 records)
**Regular Cleaning Services:**
- Standard House Cleaning - $120 (120 min)
- Apartment Cleaning - $100 (90 min)
- Office Cleaning - $150 (120 min)

**Deep Cleaning Services:**
- Move-in/Move-out Cleaning - $200 (180 min)
- Post-Construction Cleaning - $250 (240 min)
- Holiday Deep Clean - $180 (150 min)

**Commercial Services:**
- Retail Store Cleaning - $200 (150 min)
- Restaurant Cleaning - $300 (180 min)

**Specialized Services:**
- Carpet Cleaning - $80 (60 min)
- Window Cleaning - $60 (45 min)

#### 3. Service Items (7 records)
Detailed breakdown of what's included in each service:
- Kitchen Cleaning, Bathroom Cleaning, Bedroom Cleaning, Living Area Cleaning
- Inside Appliances, Baseboards and Trim, Light Fixtures

#### 4. Extras (8 records)
Additional services customers can add:
- Inside Refrigerator - $25
- Inside Oven - $30
- Laundry Service - $20
- Garage Cleaning - $40
- Patio Cleaning - $35
- Pet Hair Removal - $15
- Window Cleaning - $20
- Cabinet Organization - $25

#### 5. Geographic Data
**Regions (4 records):**
- Greater Sydney
- Melbourne Metro
- Brisbane Metro
- Perth Metro

**Suburbs (10 records):**
- Sydney: Bondi, Surry Hills, Paddington, Newtown, Manly
- Melbourne: Fitzroy, St Kilda, Carlton
- Brisbane: Fortitude Valley, New Farm

**Areas (3 records):**
- Bondi Beach, Surry Hills Central, Fitzroy North

#### 6. Frequency Discounts (3 records)
- Weekly Discount - 10% off
- Bi-weekly Discount - 5% off
- Monthly Discount - 15% off

### Empty Tables
The following tables exist but contain no data:
- cleaners (0 records)
- bookings (0 records)
- booking_extras (0 records)
- testimonials (0 records)
- blog_posts (0 records)
- profiles (0 records)

## Data Quality Observations

### Issues Found
1. **Missing Slug Values**: All records have `slug: null` - the slug columns were added in migration but not populated
2. **Missing Price Cents**: `base_price_cents` and `price_cents` columns are null - these should be populated from the decimal price fields
3. **Inconsistent Pricing**: Some services use `base_price` (decimal) while the schema expects `base_price_cents` (integer)

### Schema Compliance
- All tables follow the expected structure from the migrations
- Foreign key relationships are properly established
- Row Level Security (RLS) is enabled on all tables
- Proper indexes are in place for performance

## Next Steps
1. Run the slug migration to populate slug values
2. Populate price_cents fields from decimal prices
3. Add sample data for empty tables (cleaners, bookings, etc.)
4. Test the API endpoints to ensure they work with the current data structure

## Tools Created
1. **Node.js Script**: `scripts/load-supabase-data.js` - Command line data loader
2. **TypeScript Script**: `scripts/load-supabase-data.ts` - Type-safe data loader
3. **API Endpoint**: `/api/admin/load-data` - REST API for data loading
4. **React Component**: `DataLoader` - UI component for viewing data
5. **Admin Page**: `/admin/data` - Web interface for data viewing

## Usage
```bash
# Load data via command line
node scripts/load-supabase-data.js

# Or visit the web interface
http://localhost:3000/admin/data
```
