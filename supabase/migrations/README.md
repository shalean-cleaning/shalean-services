# Shalean Services Database Migrations

This directory contains the database schema migrations for the Shalean Services cleaning platform.

## Migration Files

### 001_create_core_tables.sql
Creates the core database schema including:
- Custom types (user_role, booking_status, payment_status, notification_type)
- All core tables with proper relationships
- Indexes for performance optimization
- Triggers for automatic timestamp updates

### 002_create_rls_policies.sql
Implements Row Level Security (RLS) policies for:
- Role-based access control (CUSTOMER, CLEANER, ADMIN)
- Public read access for non-sensitive data
- User-specific data access restrictions
- Admin full access policies

### 003_create_views_and_functions.sql
Creates business logic components:
- Views for common queries and data aggregation
- Price calculation functions
- Booking management functions
- Performance and analytics views

## Seed Data

### seed.sql
Contains sample data for development and testing:
- 4 service categories with 10 services
- 8 extras and 5 pricing rules
- 4 regions with 10 suburbs
- 3 cleaner profiles with availability schedules
- Sample blog posts
- Complete relationship data

## Usage Instructions

### Running Migrations in Supabase

1. **Via Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run each migration file in order (001, 002, 003)
   - Run the seed.sql file for sample data

2. **Via Supabase CLI:**
   ```bash
   # Initialize Supabase in your project
   supabase init
   
   # Link to your remote project
   supabase link --project-ref your-project-ref
   
   # Apply migrations
   supabase db push
   
   # Apply seed data
   supabase db seed
   ```

3. **Manual Application:**
   - Copy the contents of each migration file
   - Paste into Supabase SQL Editor
   - Execute in order
   - Run seed.sql for sample data

### Verification

After running migrations, verify the setup:

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

## Schema Overview

### Core Entities
- **profiles**: User management with roles
- **services**: Cleaning service catalog
- **cleaners**: Professional cleaner profiles
- **bookings**: Customer booking records
- **payments**: Financial transactions
- **notifications**: System communications
- **ratings**: Customer feedback

### Key Features
- **Flexible Pricing**: Dynamic pricing rules and modifiers
- **Multi-location**: Regional and suburb-based operations
- **Role-based Security**: CUSTOMER, CLEANER, ADMIN access levels
- **Performance Optimized**: Strategic indexes and views
- **Audit Trail**: Automatic timestamp tracking

### Business Logic
- Automatic price calculation with service fees and delivery charges
- Cleaner availability matching based on location and schedule
- Booking status workflow management
- Performance metrics and analytics

## Customization

### Adding New Services
```sql
INSERT INTO services (category_id, name, description, base_price, duration_minutes)
VALUES ('category-uuid', 'Service Name', 'Description', 100.00, 90);
```

### Adding New Pricing Rules
```sql
INSERT INTO pricing_rules (name, rule_type, condition_json, price_modifier, is_percentage)
VALUES ('Rule Name', 'bedroom', '{"min_bedrooms": 4}', 15.00, false);
```

### Adding New Regions/Suburbs
```sql
INSERT INTO regions (name, state) VALUES ('Region Name', 'STATE');
INSERT INTO suburbs (region_id, name, postcode, delivery_fee) 
VALUES ('region-uuid', 'Suburb Name', '1234', 5.00);
```

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check for existing tables and drop if necessary
2. **RLS Policies**: Ensure user authentication is working
3. **Foreign Key Errors**: Verify all referenced records exist
4. **Permission Errors**: Check Supabase project permissions

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
2. Verify migration order
3. Review error messages in Supabase logs
4. Test with sample data first

This schema provides a robust foundation for a scalable cleaning service platform.
