# Supabase Schema Update Summary

## Overview
This document summarizes the updates made to the Supabase schema to match the specified requirements.

## Tables Updated

### 1. Profiles Table
**Current Structure:**
- `id` (UUID, Primary Key, References auth.users)
- `email` (TEXT, Unique, Not Null)
- `first_name` (TEXT, Not Null)
- `last_name` (TEXT, Not Null)
- `full_name` (TEXT, Not Null) - **NEW**
- `phone` (TEXT, Optional)
- `role` (user_role enum: CUSTOMER|CLEANER|ADMIN, Not Null, Default: CUSTOMER)
- `avatar_url` (TEXT, Optional)
- `is_active` (BOOLEAN, Not Null, Default: true)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())

### 2. Bookings Table
**Current Structure:**
- `id` (UUID, Primary Key)
- `customer_id` (UUID, References profiles, Not Null)
- `cleaner_id` (UUID, References cleaners, Optional)
- `suburb_id` (UUID, References suburbs, Not Null)
- `service_id` (UUID, References services, Not Null)
- `service_slug` (TEXT, Not Null) - **NEW**
- `region_id` (UUID, References regions, Not Null) - **NEW**
- `booking_date` (DATE, Not Null)
- `start_time` (TIME, Not Null)
- `end_time` (TIME, Not Null)
- `start_ts` (TIMESTAMP WITH TIME ZONE, Not Null) - **NEW**
- `end_ts` (TIMESTAMP WITH TIME ZONE, Not Null) - **NEW**
- `status` (booking_status enum, Not Null, Default: PENDING)
- `total_price` (DECIMAL(10,2), Not Null)
- `notes` (TEXT, Optional)
- `special_instructions` (TEXT, Optional)
- `auto_assign` (BOOLEAN, Not Null, Default: false)
- `address` (TEXT, Optional)
- `postcode` (TEXT, Optional)
- `bedrooms` (INTEGER, Optional)
- `bathrooms` (INTEGER, Optional)
- `paystack_ref` (TEXT, Optional) - **NEW**
- `paystack_status` (TEXT, Optional) - **NEW**
- `created_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())

### 3. Booking Items Table
**Current Structure:**
- `id` (UUID, Primary Key)
- `booking_id` (UUID, References bookings, Not Null)
- `service_item_id` (UUID, References service_items, Not Null)
- `item_type` (TEXT, Not Null) - **NEW**
- `qty` (INTEGER, Not Null, Default: 1) - **NEW**
- `unit_price` (DECIMAL(10,2), Not Null, Default: 0) - **NEW**
- `subtotal` (DECIMAL(10,2), Not Null, Default: 0) - **NEW**
- `is_completed` (BOOLEAN, Not Null, Default: false)
- `notes` (TEXT, Optional)
- `created_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())
- `updated_at` (TIMESTAMP WITH TIME ZONE, Default: NOW())

## Migrations Applied

### Migration 012: Update Schema to Requirements
- Added `full_name` column to profiles table
- Added new columns to bookings table: `service_slug`, `region_id`, `start_ts`, `end_ts`, `paystack_ref`, `paystack_status`
- Added new columns to booking_items table: `item_type`, `qty`, `unit_price`, `subtotal`
- Created helper functions for automatic field population
- Added triggers for automatic updates
- Created indexes for performance

### Migration 013: Update RLS Policies Final
- Updated RLS policies to match requirements:
  - **bookings**: Allow SELECT/UPDATE only by customer_id = auth.uid() or admin. INSERT allowed for self. Service role bypass for server.
  - **booking_items**: Same policies as bookings
- Created helper functions for access control
- Created views for comprehensive data access
- Added performance indexes

## RLS Policies

### Bookings Table
1. **Customers can read own bookings**: `auth.uid() = customer_id`
2. **Customers can create own bookings**: `auth.uid() = customer_id`
3. **Customers can update own bookings**: `auth.uid() = customer_id`
4. **Admins can manage all bookings**: `is_admin()`
5. **Service role bypass**: Automatic (handled by Supabase)

### Booking Items Table
1. **Users can read own booking items**: Through booking relationship
2. **Users can create own booking items**: Through booking relationship
3. **Users can update own booking items**: Through booking relationship
4. **Admins can manage all booking items**: `is_admin()`
5. **Service role bypass**: Automatic (handled by Supabase)

## Helper Functions Created

### Access Control Functions
- `can_access_booking(booking_uuid)`: Check if user can access a booking
- `can_modify_booking(booking_uuid)`: Check if user can modify a booking
- `can_access_booking_item(booking_item_uuid)`: Check if user can access a booking item
- `can_modify_booking_item(booking_item_uuid)`: Check if user can modify a booking item

### Data Helper Functions
- `get_service_slug(service_uuid)`: Get service slug from service ID
- `get_region_from_suburb(suburb_uuid)`: Get region ID from suburb ID
- `calculate_booking_timestamps(booking_date, start_time, end_time)`: Calculate timestamps

### Trigger Functions
- `update_booking_service_slug()`: Auto-update service_slug when service_id changes
- `update_booking_region_id()`: Auto-update region_id when suburb_id changes
- `update_booking_timestamps()`: Auto-update start_ts and end_ts when date/time changes
- `update_booking_item_subtotal()`: Auto-calculate subtotal in booking_items

## Views Created

### Booking Details View
Comprehensive view of booking details with:
- Customer information (name, email, phone)
- Cleaner information (name, phone)
- Service information (name, description, duration)
- Location information (suburb, region, state)
- All booking fields including new ones

### Booking Items View
View of booking items with:
- Booking information (customer_id, status)
- Service item information (name, description, pricing)
- All booking item fields including new ones

## Indexes Created

### Performance Indexes
- `idx_profiles_full_name`: On profiles.full_name
- `idx_bookings_service_slug`: On bookings.service_slug
- `idx_bookings_region_id`: On bookings.region_id
- `idx_bookings_start_ts`: On bookings.start_ts
- `idx_bookings_end_ts`: On bookings.end_ts
- `idx_bookings_paystack_ref`: On bookings.paystack_ref
- `idx_bookings_paystack_status`: On bookings.paystack_status
- `idx_booking_items_item_type`: On booking_items.item_type
- `idx_booking_items_qty`: On booking_items.qty
- `idx_booking_items_unit_price`: On booking_items.unit_price
- `idx_booking_items_subtotal`: On booking_items.subtotal

### Composite Indexes
- `idx_bookings_customer_status`: On bookings(customer_id, status)
- `idx_bookings_service_slug_status`: On bookings(service_slug, status)
- `idx_bookings_region_status`: On bookings(region_id, status)
- `idx_bookings_paystack_ref_status`: On bookings(paystack_ref, status)
- `idx_booking_items_booking_item_type`: On booking_items(booking_id, item_type)
- `idx_booking_items_booking_completed`: On booking_items(booking_id, is_completed)

## TypeScript Types Updated

### Database Types
- Updated `Profile` interface to include `full_name`
- Updated `Booking` interface to include new fields
- Updated `BookingItem` interface to include new fields
- Updated `BookingDetailsView` interface
- Added `BookingItemsView` interface

## Next Steps

1. **Apply Migrations**: Run the migrations on your Supabase database
2. **Update Application Code**: Update your application code to use the new fields
3. **Test RLS Policies**: Verify that RLS policies work as expected
4. **Update API Endpoints**: Update API endpoints to handle new fields
5. **Test Payment Integration**: Test Paystack integration with new fields

## Migration Commands

To apply these migrations to your Supabase database:

```bash
# Apply all migrations
npx supabase db push --remote --project-ref <PROJECT_REF>

# Or apply specific migrations
npx supabase db push --remote --project-ref <PROJECT_REF> --include-all
```

## Verification

After applying migrations, verify:
1. All tables have the correct structure
2. RLS policies are working correctly
3. Helper functions are created and working
4. Views are accessible
5. Indexes are created for performance
6. Triggers are working for automatic updates

## Notes

- All new fields are properly indexed for performance
- RLS policies ensure data security
- Helper functions provide convenient access to related data
- Views provide comprehensive data access
- Triggers ensure data consistency
- TypeScript types are updated to match the new schema
