-- Migration: Update RLS Policies to Match Requirements
-- Description: Ensure RLS policies match the specified requirements:
--              - bookings: allow SELECT/UPDATE only by customer_id = auth.uid() or admin. INSERT allowed for self. Service role bypass for server.
--              - booking_items: same.

-- Drop existing policies to recreate them with updated logic
DROP POLICY IF EXISTS "Customers can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own draft bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Cleaners can read assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Cleaners can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;

DROP POLICY IF EXISTS "Users can read own booking items" ON booking_items;
DROP POLICY IF EXISTS "Users can create own booking items" ON booking_items;
DROP POLICY IF EXISTS "Users can update own booking items" ON booking_items;
DROP POLICY IF EXISTS "Cleaners can update assigned booking items" ON booking_items;
DROP POLICY IF EXISTS "Admins can manage all booking items" ON booking_items;

-- Note: Policy creation is handled in migration 015_cleanup_existing_policies.sql
-- to avoid conflicts with existing policies

-- Update helper functions to ensure they work with the new structure
-- Function to check if user can access booking
CREATE OR REPLACE FUNCTION can_access_booking(booking_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the customer
    RETURN EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_uuid 
        AND customer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify booking
CREATE OR REPLACE FUNCTION can_modify_booking(booking_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the customer
    RETURN EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_uuid 
        AND customer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access booking item
CREATE OR REPLACE FUNCTION can_access_booking_item(booking_item_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the customer of the associated booking
    RETURN EXISTS (
        SELECT 1 FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE bi.id = booking_item_uuid 
        AND b.customer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can modify booking item
CREATE OR REPLACE FUNCTION can_modify_booking_item(booking_item_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if user is admin
    IF is_admin() THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the customer of the associated booking
    RETURN EXISTS (
        SELECT 1 FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        WHERE bi.id = booking_item_uuid 
        AND b.customer_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for helper functions
COMMENT ON FUNCTION can_access_booking IS 'Helper function to check if user can access a booking';
COMMENT ON FUNCTION can_modify_booking IS 'Helper function to check if user can modify a booking';
COMMENT ON FUNCTION can_access_booking_item IS 'Helper function to check if user can access a booking item';
COMMENT ON FUNCTION can_modify_booking_item IS 'Helper function to check if user can modify a booking item';

-- Note: Views will be created in migration 014_fix_auto_assign_column.sql
-- to ensure all required columns exist first

-- Create indexes for better performance on the new structure
CREATE INDEX IF NOT EXISTS idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_slug_status ON bookings(service_slug, status);
CREATE INDEX IF NOT EXISTS idx_bookings_region_status ON bookings(region_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_paystack_ref_status ON bookings(paystack_ref, status);

CREATE INDEX IF NOT EXISTS idx_booking_items_booking_item_type ON booking_items(booking_id, item_type);
CREATE INDEX IF NOT EXISTS idx_booking_items_booking_completed ON booking_items(booking_id, is_completed);

-- Final verification: Ensure all tables have RLS enabled
DO $$
DECLARE
    table_name TEXT;
    tables_to_check TEXT[] := ARRAY['profiles', 'bookings', 'booking_items'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_class 
            WHERE relname = table_name 
            AND relrowsecurity = true
        ) THEN
            RAISE EXCEPTION 'RLS is not enabled on table: %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'All required tables have RLS enabled successfully';
END $$;
