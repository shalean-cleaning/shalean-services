-- Migration: Update RLS Policies for Draft Bookings
-- Description: Update booking RLS policies to handle DRAFT status and new customer detail fields

-- Drop existing booking policies to recreate them with updated logic
DROP POLICY IF EXISTS "Customers can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own pending bookings" ON bookings;

-- Recreate booking policies with DRAFT support
-- Customers can read their own bookings (including drafts)
CREATE POLICY "Customers can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create their own bookings (including drafts)
CREATE POLICY "Customers can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own bookings in draft or ready states
-- This allows updates to DRAFT and READY_FOR_PAYMENT statuses
-- Once PAID, bookings should be protected from customer edits
CREATE POLICY "Customers can update own draft bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = customer_id 
        AND status IN ('DRAFT', 'PENDING', 'READY_FOR_PAYMENT')
    );

-- Keep existing cleaner and admin policies unchanged
-- (They already exist and work correctly)

-- Add helper function to check if booking is in editable state
CREATE OR REPLACE FUNCTION is_booking_editable_by_customer(booking_row bookings)
RETURNS BOOLEAN AS $$
BEGIN
    -- Customers can edit their own bookings in these states
    RETURN booking_row.customer_id = auth.uid() 
           AND booking_row.status IN ('DRAFT', 'PENDING', 'READY_FOR_PAYMENT');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION is_booking_editable_by_customer IS 'Helper function to check if a booking can be edited by the customer';
