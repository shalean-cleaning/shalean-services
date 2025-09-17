-- Migration: Fix auto_assign column and views
-- Description: Ensure auto_assign column exists before creating views

-- First, ensure the auto_assign column exists in bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS auto_assign BOOLEAN NOT NULL DEFAULT false;

-- Now recreate the booking_details_view with proper column handling
DROP VIEW IF EXISTS booking_details_view;

CREATE OR REPLACE VIEW booking_details_view AS
SELECT 
    b.id,
    b.customer_id,
    b.cleaner_id,
    b.suburb_id,
    b.service_id,
    b.service_slug,
    b.region_id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.start_ts,
    b.end_ts,
    b.status,
    b.total_price,
    b.notes,
    b.special_instructions,
    b.auto_assign,
    b.address,
    b.postcode,
    b.bedrooms,
    b.bathrooms,
    b.paystack_ref,
    b.paystack_status,
    b.created_at,
    b.updated_at,
    -- Customer details
    p.first_name as customer_first_name,
    p.last_name as customer_last_name,
    p.full_name as customer_full_name,
    p.email as customer_email,
    p.phone as customer_phone,
    -- Cleaner details
    c.profile_id as cleaner_profile_id,
    cp.first_name as cleaner_first_name,
    cp.last_name as cleaner_last_name,
    cp.full_name as cleaner_full_name,
    cp.phone as cleaner_phone,
    -- Service details
    s.name as service_name,
    s.description as service_description,
    s.duration_minutes,
    -- Location details
    sub.name as suburb_name,
    sub.postcode as suburb_postcode,
    sub.delivery_fee,
    r.name as region_name,
    r.state
FROM bookings b
LEFT JOIN profiles p ON b.customer_id = p.id
LEFT JOIN cleaners c ON b.cleaner_id = c.id
LEFT JOIN profiles cp ON c.profile_id = cp.id
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN suburbs sub ON b.suburb_id = sub.id
LEFT JOIN regions r ON b.region_id = r.id;

-- Enable RLS on the view
ALTER VIEW booking_details_view SET (security_invoker = true);

-- Add comment for the view
COMMENT ON VIEW booking_details_view IS 'Comprehensive view of booking details with customer, cleaner, service, and location information';

-- Also ensure the booking_items_view is created properly
DROP VIEW IF EXISTS booking_items_view;

CREATE OR REPLACE VIEW booking_items_view AS
SELECT 
    bi.id,
    bi.booking_id,
    bi.service_item_id,
    bi.item_type,
    bi.qty,
    bi.unit_price,
    bi.subtotal,
    bi.is_completed,
    bi.notes,
    bi.created_at,
    bi.updated_at,
    -- Booking details
    b.customer_id,
    b.status as booking_status,
    -- Service item details
    si.name as service_item_name,
    si.description as service_item_description,
    si.is_included,
    si.additional_price
FROM booking_items bi
LEFT JOIN bookings b ON bi.booking_id = b.id
LEFT JOIN service_items si ON bi.service_item_id = si.id;

-- Enable RLS on the view
ALTER VIEW booking_items_view SET (security_invoker = true);

-- Add comment for the view
COMMENT ON VIEW booking_items_view IS 'View of booking items with booking and service item details';
