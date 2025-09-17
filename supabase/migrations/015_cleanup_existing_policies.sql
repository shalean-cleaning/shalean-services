-- Migration: Cleanup Existing Policies
-- Description: Remove all existing policies that might conflict with new ones

-- Drop ALL existing policies on bookings table
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'bookings' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON bookings', pol_name);
    END LOOP;
END $$;

-- Drop ALL existing policies on booking_items table
DO $$
DECLARE
    pol_name TEXT;
BEGIN
    FOR pol_name IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'booking_items' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON booking_items', pol_name);
    END LOOP;
END $$;

-- Now create the new policies according to requirements
-- BOOKINGS POLICIES
-- 1. Customers can read their own bookings
CREATE POLICY "Customers can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

-- 2. Customers can create their own bookings
CREATE POLICY "Customers can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- 3. Customers can update their own bookings (all statuses)
CREATE POLICY "Customers can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = customer_id);

-- 4. Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (is_admin());

-- BOOKING_ITEMS POLICIES
-- 1. Users can read booking items for their own bookings
CREATE POLICY "Users can read own booking items" ON booking_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_items.booking_id 
            AND customer_id = auth.uid()
        )
    );

-- 2. Users can create booking items for their own bookings
CREATE POLICY "Users can create own booking items" ON booking_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_items.booking_id 
            AND customer_id = auth.uid()
        )
    );

-- 3. Users can update booking items for their own bookings
CREATE POLICY "Users can update own booking items" ON booking_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_items.booking_id 
            AND customer_id = auth.uid()
        )
    );

-- 4. Admins can manage all booking items
CREATE POLICY "Admins can manage all booking items" ON booking_items
    FOR ALL USING (is_admin());

-- Add comments for the policies
COMMENT ON POLICY "Customers can read own bookings" ON bookings IS 'Allow customers to read their own bookings';
COMMENT ON POLICY "Customers can create own bookings" ON bookings IS 'Allow customers to create their own bookings';
COMMENT ON POLICY "Customers can update own bookings" ON bookings IS 'Allow customers to update their own bookings';
COMMENT ON POLICY "Admins can manage all bookings" ON bookings IS 'Allow admins to manage all bookings';

COMMENT ON POLICY "Users can read own booking items" ON booking_items IS 'Allow users to read booking items for their own bookings';
COMMENT ON POLICY "Users can create own booking items" ON booking_items IS 'Allow users to create booking items for their own bookings';
COMMENT ON POLICY "Users can update own booking items" ON booking_items IS 'Allow users to update booking items for their own bookings';
COMMENT ON POLICY "Admins can manage all booking items" ON booking_items IS 'Allow admins to manage all booking items';
