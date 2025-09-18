# Shalean Services Database Migrations

This directory contains the database schema migrations for the Shalean Services cleaning platform, fully compliant with the PRD requirements.

## Migration Files

### 001_create_prd_schema.sql
Creates the PRD-compliant database schema including:
- All PRD-required tables (services, extras, areas, cleaners, bookings, quotes, etc.)
- Proper table structures matching PRD specifications
- SEO-friendly slug fields for URLs
- Foreign key relationships as specified in PRD
- Indexes for performance optimization

### 002_create_rls_policies.sql
Implements Row Level Security (RLS) policies for:
- Role-based access control (CUSTOMER, CLEANER, ADMIN)
- Public read access for non-sensitive data (services, extras, areas)
- User-specific data access restrictions
- Admin full access policies
- Proper security for all PRD tables

### 003_add_slugs_and_seed_data.sql
Completes the schema setup with:
- Auto-generation of SEO-friendly slugs
- Sample data for development and testing
- Helper functions for common operations
- Views for optimized queries
- Triggers for automatic data updates

## PRD Compliance

This migration set ensures full compliance with the Product Requirements Document:

### ✅ Core Tables Implemented
- `services` - Service catalog with base fees and slugs
- `service_pricing` - Per-bedroom and per-bathroom pricing
- `extras` - Additional services with pricing
- `service_extras` - Required extras for services
- `frequency_discounts` - Recurring booking discounts
- `service_features` - Service feature labels
- `areas` (suburbs) - Geographic service areas with price adjustments
- `cleaners` - Professional cleaner profiles
- `cleaner_areas` - Many-to-many cleaner-area relationships
- `cleaner_availability` - Cleaner schedule management
- `bookings` - Customer bookings with bedrooms/bathrooms/frequency
- `quotes` - Quote system for estimates
- `testimonials` - Customer reviews and testimonials
- `content_blocks` - Dynamic homepage content
- `team_members` - Team page content

### ✅ Key Features
- **SEO-Friendly URLs**: All services, extras, and areas have slug fields
- **Dynamic Pricing**: Per-bedroom and per-bathroom pricing system
- **Frequency Discounts**: Support for recurring booking discounts
- **Quote System**: Complete quote generation and storage
- **Content Management**: Dynamic homepage content blocks
- **Team Management**: Team member profiles and information
- **Cleaner Management**: Proper cleaner-area relationships and availability

## Usage Instructions

### Running Migrations in Supabase

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run each migration file in order (001, 002, 003)
   - Verify the schema is created correctly

2. **Via Supabase CLI:**
   ```bash
   # Initialize Supabase in your project
   supabase init
   
   # Link to your remote project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   ```

3. **Manual Application:**
   - Copy the contents of each migration file
   - Paste into Supabase SQL Editor
   - Execute in order (001, 002, 003)

### Verification

After running migrations, verify the setup:

```sql
-- Check PRD tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'services', 'extras', 'suburbs', 'cleaners', 'bookings', 
    'quotes', 'testimonials', 'content_blocks', 'team_members',
    'service_pricing', 'service_extras', 'frequency_discounts',
    'service_features', 'cleaner_areas', 'cleaner_availability'
)
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
SELECT COUNT(*) as testimonial_count FROM testimonials;
```

## Schema Overview

### Core Entities (PRD Compliant)
- **profiles**: User management with roles (CUSTOMER, CLEANER, ADMIN)
- **services**: Cleaning service catalog with slugs and base fees
- **extras**: Additional services with pricing
- **suburbs**: Geographic areas with price adjustments
- **cleaners**: Professional cleaner profiles
- **bookings**: Customer bookings with bedrooms/bathrooms/frequency
- **quotes**: Quote system for estimates
- **testimonials**: Customer reviews and testimonials
- **content_blocks**: Dynamic homepage content
- **team_members**: Team page content

### Key Features
- **SEO-Friendly URLs**: All services, extras, and areas have slug fields
- **Dynamic Pricing**: Per-bedroom and per-bathroom pricing system
- **Frequency Discounts**: Support for recurring booking discounts
- **Quote System**: Complete quote generation and storage
- **Content Management**: Dynamic homepage content blocks
- **Team Management**: Team member profiles and information
- **Cleaner Management**: Proper cleaner-area relationships and availability
- **Role-based Security**: CUSTOMER, CLEANER, ADMIN access levels
- **Performance Optimized**: Strategic indexes and views

### Business Logic
- Automatic price calculation with service fees and area adjustments
- Cleaner availability matching based on location and schedule
- Quote generation with dynamic pricing
- SEO-friendly URL generation
- Content management for dynamic homepage

## Testing

Run the schema integrity test to verify PRD compliance:

```bash
node scripts/test-schema-integrity.js
```

This will test all PRD-required tables, columns, and functions.

## Customization

### Adding New Services
```sql
INSERT INTO services (name, description, base_fee, slug, active)
VALUES ('Service Name', 'Description', 100.00, 'service-slug', true);
```

### Adding New Extras
```sql
INSERT INTO extras (name, description, price, slug, active)
VALUES ('Extra Name', 'Description', 50.00, 'extra-slug', true);
```

### Adding New Areas
```sql
INSERT INTO suburbs (region_id, name, postcode, delivery_fee, slug, price_adjustment_pct, active)
VALUES ('region-uuid', 'Area Name', '1234', 5.00, 'area-slug', 0.00, true);
```

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check for existing tables and drop if necessary
2. **RLS Policies**: Ensure user authentication is working
3. **Foreign Key Errors**: Verify all referenced records exist
4. **Permission Errors**: Check Supabase project permissions
5. **Slug Conflicts**: Ensure unique slugs for services, extras, and areas

### Reset Database
```sql
-- Drop all tables (use with caution)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

## Support

For issues with the database schema:
1. Check Supabase documentation
2. Verify migration order (001, 002, 003)
3. Review error messages in Supabase logs
4. Run the schema integrity test
5. Ensure PRD compliance requirements are met

This schema provides a robust, PRD-compliant foundation for the Shalean Services cleaning platform.