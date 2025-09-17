# Bookings Schema Enhancement - Customer Details & Draft Idempotency

## Overview

This document outlines the enhancements made to the Shalean Cleaning Services booking system to add customer detail fields while maintaining draft idempotency and proper validation timing.

## New Database Schema

### Added Columns to `public.bookings`

```sql
-- Customer detail fields (all nullable for backward compatibility)
address TEXT,
postcode TEXT,
bedrooms INTEGER,
bathrooms INTEGER
```

### New Booking Status Values

```sql
-- Added to booking_status enum
'DRAFT'           -- Initial state for incomplete bookings
'READY_FOR_PAYMENT' -- Confirmed booking ready for payment
```

### Constraints & Indexes

```sql
-- Data validation constraints (safe for NULLs)
CHECK (bedrooms IS NULL OR bedrooms >= 0)
CHECK (bathrooms IS NULL OR bathrooms >= 0)

-- Idempotency constraint
CREATE UNIQUE INDEX uniq_bookings_draft_per_customer 
ON bookings (customer_id) 
WHERE status = 'DRAFT';
```

## Field Requirements & Validation Timing

### During DRAFT Status
- **All new fields are optional** (can be NULL)
- Users can save incomplete bookings
- No validation errors for missing customer details

### During Confirmation (DRAFT → READY_FOR_PAYMENT)
- **All customer detail fields become required**:
  - `address` - must be non-empty string
  - `postcode` - must be non-empty string  
  - `bedrooms` - must be non-negative integer
  - `bathrooms` - must be non-negative integer
- Additional required fields: `service_id`, `suburb_id`, `booking_date`, `start_time`, `total_price`

### After Payment (READY_FOR_PAYMENT → PAID)
- All fields locked (no customer edits allowed)
- System can update status and cleaner assignment

## API Endpoints & Validation

### `/api/bookings/draft` (GET/POST)
- **Purpose**: Idempotent draft management
- **Behavior**: 
  - GET: Returns existing DRAFT booking if exists
  - POST: Creates new DRAFT or updates existing one
- **Validation**: Minimal - only validates provided fields
- **Status**: Always creates/updates with `status = 'DRAFT'`

### `/api/bookings/update` (POST)
- **Purpose**: Step-aware partial updates
- **Behavior**: Updates specific fields of existing DRAFT/PENDING/READY_FOR_PAYMENT bookings
- **Validation**: Validates only the fields being updated
- **Use Case**: Called from individual booking steps (rooms, location, etc.)

### `/api/bookings/confirm` (POST)
- **Purpose**: Final validation and status transition
- **Behavior**: 
  - Validates ALL required fields for finalization
  - Transitions status from DRAFT → READY_FOR_PAYMENT or CONFIRMED
  - Handles cleaner assignment logic
- **Validation**: Strict - returns 422 with detailed missing field list if incomplete

## Idempotency Contract

### Draft Creation
- **One DRAFT per customer**: Partial unique index enforces this at database level
- **Conflict Resolution**: If draft exists, API returns existing draft instead of creating duplicate
- **No Exceptions**: System never throws "duplicate draft" errors

### Draft Updates
- **Partial Updates**: Can update any subset of fields
- **Status Preservation**: Maintains DRAFT status during updates
- **Validation**: Only validates fields being updated

## RLS Policy Updates

### Customer Access
```sql
-- Customers can read their own bookings (including drafts)
CREATE POLICY "Customers can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can update their own bookings in draft/ready states
CREATE POLICY "Customers can update own draft bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = customer_id 
        AND status IN ('DRAFT', 'PENDING', 'READY_FOR_PAYMENT')
    );
```

### Protection Rules
- **DRAFT/PENDING/READY_FOR_PAYMENT**: Customer can edit
- **PAID/CONFIRMED/IN_PROGRESS/COMPLETED**: Customer cannot edit
- **CLEANER/ADMIN**: Existing policies unchanged

## Client-Side Flow

### Booking Steps
1. **Service Selection** → Updates `service_id`, `suburb_id`
2. **Rooms/Extras** → Updates `bedrooms`, `bathrooms`, `extras`
3. **Location/Time** → Updates `address`, `postcode`, `booking_date`, `start_time`
4. **Cleaner Selection** → Updates `cleaner_id`, `auto_assign`
5. **Review** → Calls `/api/bookings/confirm` for final validation

### Review Step Behavior
- **Missing Fields**: Shows guided error with buttons to navigate to specific steps
- **Complete Fields**: Shows "Confirm & Proceed to Payment" button
- **Confirmed**: Shows "Complete Payment" button
- **Paid**: Shows "Already Paid" disabled button

### Error Handling
- **422 Responses**: Detailed field-level validation errors
- **Missing Fields**: User-friendly navigation to complete missing information
- **No 500s**: All expected user states return appropriate 4xx responses

## Migration Safety

### Backward Compatibility
- **All new columns are nullable** - no breaking changes to existing data
- **Existing bookings preserved** - no data loss during migration
- **Enum additions** - safe to add new values to existing enum types

### Rollback Safety
- **No NOT NULL constraints** - can safely remove columns if needed
- **Partial indexes** - can be dropped without affecting other data
- **Status transitions** - existing bookings continue to work with old statuses

## Testing Strategy

### Unit Tests
- Draft creation idempotency
- Partial update validation
- Confirmation field requirements
- RLS policy enforcement

### Integration Tests
- End-to-end booking flow
- Payment integration with new statuses
- Error handling and user guidance

### Manual Testing
- One user cannot create multiple DRAFT bookings
- Payment only possible after confirmation
- Missing field guidance works correctly

## Important Constraints

1. **Draft Idempotency**: Database-level enforcement via partial unique index
2. **Validation Timing**: Required fields only enforced at confirmation, not during draft
3. **Status Transitions**: DRAFT → READY_FOR_PAYMENT → PAID (with cleaner assignment logic)
4. **RLS Protection**: Paid bookings protected from customer edits
5. **Error Handling**: No 500s for expected user states - use 4xx with clear guidance

## File Changes Summary

### Database Migrations
- `010_add_booking_customer_details.sql` - New columns, constraints, indexes
- `011_update_booking_rls_for_drafts.sql` - Updated RLS policies

### API Endpoints
- `src/app/api/bookings/draft/route.ts` - Updated for DRAFT status and new fields
- `src/app/api/bookings/update/route.ts` - New step-aware update endpoint
- `src/app/api/bookings/confirm/route.ts` - Enhanced validation and status management

### Client Components
- `src/lib/database.types.ts` - Updated Booking interface and status types
- `src/lib/stores/booking-store.ts` - Added updateBooking function
- `src/components/booking/steps/booking-review-step.tsx` - Enhanced validation flow

### Key Features
- **Idempotent Drafts**: One DRAFT per customer, no duplicates
- **Step-Aware Updates**: Partial updates from individual booking steps
- **Guided Validation**: User-friendly error messages with navigation
- **Status Management**: Proper transitions through booking lifecycle
- **Backward Compatibility**: Safe migration with no breaking changes
