# Shalean Services Database Schema - ERD Documentation

## Overview
This document describes the Entity Relationship Diagram (ERD) for the Shalean Services cleaning platform database. The schema is designed to support a comprehensive cleaning service booking system with role-based access control, flexible pricing, and multi-location operations.

## Core Entities

### 1. User Management
- **profiles**: Extends Supabase auth.users with custom fields
  - Roles: CUSTOMER, CLEANER, ADMIN
  - Personal information and contact details
  - One-to-one relationship with auth.users

### 2. Service Catalog
- **service_categories**: Groups services by type (Regular, Deep, Commercial, Specialized)
- **services**: Individual cleaning services with base pricing
- **service_items**: Specific tasks within each service
- **extras**: Additional services customers can add to bookings

### 3. Pricing System
- **pricing_rules**: Flexible pricing modifiers for different scenarios
  - Bedroom/bathroom surcharges
  - Frequency discounts (weekly, bi-weekly)
  - Service fees
  - Custom conditions stored as JSONB

### 4. Geographic Structure
- **regions**: Major metropolitan areas (Sydney, Melbourne, Brisbane, Perth)
- **suburbs**: Specific suburbs within regions
  - Delivery fees per suburb
  - Postcode information

### 5. Cleaner Management
- **cleaners**: Professional cleaner profiles
  - Performance metrics (rating, total ratings)
  - Availability status
  - Hourly rates
- **cleaner_locations**: Many-to-many relationship between cleaners and suburbs
- **availability_slots**: Weekly schedule patterns for each cleaner

### 6. Booking System
- **bookings**: Core booking records
  - Customer, cleaner, service, location, timing
  - Status tracking (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED)
  - Total price calculation
- **booking_items**: Specific tasks for each booking
- **booking_extras**: Additional services added to bookings

### 7. Financial Management
- **payments**: Payment records linked to bookings
  - Status tracking (PENDING, PAID, FAILED, REFUNDED)
  - Payment method and transaction details

### 8. Communication & Feedback
- **notifications**: System notifications for users
  - Type-based notifications (booking confirmations, reminders, etc.)
  - Read/unread status tracking
- **ratings**: Customer ratings and reviews for cleaners
  - 1-5 star rating system
  - Optional comments
  - Public/private visibility

### 9. Content Management
- **blog_posts**: Company blog content
  - SEO-friendly slugs
  - Publication status and dates
  - Author attribution

## Key Relationships

### Primary Relationships
1. **profiles** ←→ **auth.users** (1:1)
2. **profiles** ←→ **cleaners** (1:1, where role = 'CLEANER')
3. **services** ←→ **service_categories** (N:1)
4. **service_items** ←→ **services** (N:1)
5. **suburbs** ←→ **regions** (N:1)
6. **cleaners** ←→ **cleaner_locations** ←→ **suburbs** (N:M)
7. **bookings** ←→ **profiles** (customer) (N:1)
8. **bookings** ←→ **cleaners** (N:1)
9. **bookings** ←→ **services** (N:1)
10. **bookings** ←→ **suburbs** (N:1)

### Secondary Relationships
- **bookings** ←→ **booking_items** (1:N)
- **bookings** ←→ **booking_extras** (1:N)
- **bookings** ←→ **payments** (1:N)
- **bookings** ←→ **ratings** (1:1)
- **profiles** ←→ **notifications** (1:N)
- **profiles** ←→ **blog_posts** (author) (1:N)

## Database Features

### Row Level Security (RLS)
- **Public Access**: Service catalog, regions, suburbs, published blog posts
- **Customer Access**: Own bookings, payments, notifications, ratings
- **Cleaner Access**: Assigned bookings, own profile, availability
- **Admin Access**: Full system access

### Performance Optimizations
- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- Views for common data aggregations

### Data Integrity
- Foreign key constraints maintain referential integrity
- Check constraints validate data ranges
- Unique constraints prevent duplicates
- Automatic timestamp updates via triggers

## Pricing Calculation Logic

The system uses a flexible pricing model:

1. **Base Price**: From the selected service
2. **Delivery Fee**: Based on suburb location
3. **Service Fee**: 10% of base price
4. **Extras**: Additional services with individual pricing
5. **Pricing Rules**: Dynamic modifiers based on:
   - Property size (bedrooms/bathrooms)
   - Booking frequency
   - Special conditions

### Price Calculation Function
```sql
calculate_booking_price(service_id, suburb_id, extras_json)
```

## Views and Functions

### Key Views
- **cleaner_availability_view**: Available cleaners with schedules
- **booking_details_view**: Complete booking information
- **service_pricing_view**: Pricing breakdown for services
- **cleaner_performance_view**: Cleaner metrics and statistics
- **customer_booking_history_view**: Customer booking patterns

### Key Functions
- **get_available_cleaners()**: Find available cleaners for time slots
- **create_booking_with_pricing()**: Create booking with automatic pricing
- **calculate_booking_price()**: Calculate total booking cost

## Security Considerations

### Authentication
- Leverages Supabase Auth for user authentication
- Custom profile table extends auth.users
- Role-based access control throughout

### Data Protection
- RLS policies enforce data access rules
- Sensitive data (payments, personal info) restricted by role
- Audit trails via created_at/updated_at timestamps

### Scalability
- UUID primary keys for distributed systems
- JSONB for flexible data storage
- Indexed queries for performance
- Normalized structure reduces redundancy

## Migration Strategy

The database is created through three sequential migrations:

1. **001_create_core_tables.sql**: Core schema and indexes
2. **002_create_rls_policies.sql**: Security policies
3. **003_create_views_and_functions.sql**: Business logic views and functions

Seed data provides:
- Sample services and categories
- 10 suburbs across 4 regions
- 3 cleaner profiles with availability
- Sample blog posts
- Pricing rules and extras

This schema provides a solid foundation for a scalable cleaning service platform with comprehensive booking management, flexible pricing, and robust security.
