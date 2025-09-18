-- Migration: Update RLS Policies for PRD Schema
-- Description: Update all RLS policies to work with the new PRD-compliant schema

-- 1. DROP ALL EXISTING POLICIES
-- Drop policies for tables that no longer exist or have changed
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Anyone can read service categories" ON service_categories;
DROP POLICY IF EXISTS "Admins can manage service categories" ON service_categories;
DROP POLICY IF EXISTS "Anyone can read services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Anyone can read service items" ON service_items;
DROP POLICY IF EXISTS "Admins can manage service items" ON service_items;
DROP POLICY IF EXISTS "Anyone can read extras" ON extras;
DROP POLICY IF EXISTS "Admins can manage extras" ON extras;
DROP POLICY IF EXISTS "Anyone can read pricing rules" ON pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON pricing_rules;
DROP POLICY IF EXISTS "Anyone can read regions" ON regions;
DROP POLICY IF EXISTS "Admins can manage regions" ON regions;
DROP POLICY IF EXISTS "Anyone can read suburbs" ON suburbs;
DROP POLICY IF EXISTS "Admins can manage suburbs" ON suburbs;
DROP POLICY IF EXISTS "Anyone can read active cleaners" ON cleaners;
DROP POLICY IF EXISTS "Cleaners can read own profile" ON cleaners;
DROP POLICY IF EXISTS "Cleaners can update own profile" ON cleaners;
DROP POLICY IF EXISTS "Admins can manage all cleaners" ON cleaners;
DROP POLICY IF EXISTS "Anyone can read cleaner locations" ON cleaner_locations;
DROP POLICY IF EXISTS "Cleaners can manage own locations" ON cleaner_locations;
DROP POLICY IF EXISTS "Admins can manage all cleaner locations" ON cleaner_locations;
DROP POLICY IF EXISTS "Anyone can read availability slots" ON availability_slots;
DROP POLICY IF EXISTS "Cleaners can manage own availability" ON availability_slots;
DROP POLICY IF EXISTS "Admins can manage all availability slots" ON availability_slots;
DROP POLICY IF EXISTS "Customers can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own pending bookings" ON bookings;
DROP POLICY IF EXISTS "Cleaners can read assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Cleaners can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own booking items" ON booking_items;
DROP POLICY IF EXISTS "Cleaners can update assigned booking items" ON booking_items;
DROP POLICY IF EXISTS "Admins can manage all booking items" ON booking_items;
DROP POLICY IF EXISTS "Users can read own booking extras" ON booking_extras;
DROP POLICY IF EXISTS "Admins can manage all booking extras" ON booking_extras;
DROP POLICY IF EXISTS "Customers can read own payments" ON payments;
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can create notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can read published ratings" ON ratings;
DROP POLICY IF EXISTS "Customers can read own ratings" ON ratings;
DROP POLICY IF EXISTS "Customers can create own ratings" ON ratings;
DROP POLICY IF EXISTS "Customers can update own ratings" ON ratings;
DROP POLICY IF EXISTS "Admins can manage all ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can read published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can read own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can create own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admins can manage all blog posts" ON blog_posts;

-- 2. UPDATE HELPER FUNCTIONS
-- Update helper functions to work with new schema
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role::TEXT 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_cleaner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'CLEANER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'CUSTOMER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CREATE NEW RLS POLICIES FOR PRD SCHEMA

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
    FOR SELECT USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (is_admin());

-- SERVICES POLICIES
-- Public read access for active services
CREATE POLICY "Anyone can read active services" ON services
    FOR SELECT USING (active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (is_admin());

-- EXTRAS POLICIES
-- Public read access for active extras
CREATE POLICY "Anyone can read active extras" ON extras
    FOR SELECT USING (active = true);

-- Admins can manage extras
CREATE POLICY "Admins can manage extras" ON extras
    FOR ALL USING (is_admin());

-- REGIONS POLICIES
-- Public read access for active regions
CREATE POLICY "Anyone can read active regions" ON regions
    FOR SELECT USING (is_active = true);

-- Admins can manage regions
CREATE POLICY "Admins can manage regions" ON regions
    FOR ALL USING (is_admin());

-- SUBURBS (AREAS) POLICIES
-- Public read access for active suburbs
CREATE POLICY "Anyone can read active suburbs" ON suburbs
    FOR SELECT USING (active = true);

-- Admins can manage suburbs
CREATE POLICY "Admins can manage suburbs" ON suburbs
    FOR ALL USING (is_admin());

-- CLEANERS POLICIES
-- Public read access for active cleaners
CREATE POLICY "Anyone can read active cleaners" ON cleaners
    FOR SELECT USING (active = true);

-- Cleaners can read their own profile
CREATE POLICY "Cleaners can read own profile" ON cleaners
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CLEANER'
        )
    );

-- Cleaners can update their own profile
CREATE POLICY "Cleaners can update own profile" ON cleaners
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CLEANER'
        )
    );

-- Admins can manage all cleaners
CREATE POLICY "Admins can manage all cleaners" ON cleaners
    FOR ALL USING (is_admin());

-- BOOKINGS POLICIES
-- Customers can read their own bookings
CREATE POLICY "Customers can read own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create their own bookings
CREATE POLICY "Customers can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own pending bookings
CREATE POLICY "Customers can update own pending bookings" ON bookings
    FOR UPDATE USING (
        auth.uid() = customer_id 
        AND status IN ('PENDING', 'CONFIRMED')
    );

-- Cleaners can read bookings assigned to them
CREATE POLICY "Cleaners can read assigned bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cleaners 
            WHERE id = bookings.cleaner_id 
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'CLEANER'
            )
        )
    );

-- Cleaners can update bookings assigned to them
CREATE POLICY "Cleaners can update assigned bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cleaners 
            WHERE id = bookings.cleaner_id 
            AND EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() 
                AND role = 'CLEANER'
            )
        )
    );

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (is_admin());

-- BOOKING EXTRAS POLICIES
-- Users can read booking extras for their bookings
CREATE POLICY "Users can read own booking extras" ON booking_extras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_extras.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id IN (
                SELECT id FROM cleaners WHERE EXISTS (
                    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'CLEANER'
                )
            ))
        )
    );

-- Admins can manage all booking extras
CREATE POLICY "Admins can manage all booking extras" ON booking_extras
    FOR ALL USING (is_admin());

-- BLOG POSTS POLICIES
-- Public read access for published posts
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
    FOR SELECT USING (is_published = true AND published_at <= NOW());

-- Authors can read their own posts
CREATE POLICY "Authors can read own blog posts" ON blog_posts
    FOR SELECT USING (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Authors can create their own posts
CREATE POLICY "Authors can create own blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Admins can manage all blog posts
CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (is_admin());

-- 4. CREATE POLICIES FOR NEW PRD TABLES

-- SERVICE PRICING POLICIES
-- Public read access
CREATE POLICY "Anyone can read service pricing" ON service_pricing
    FOR SELECT USING (true);

-- Admins can manage service pricing
CREATE POLICY "Admins can manage service pricing" ON service_pricing
    FOR ALL USING (is_admin());

-- SERVICE EXTRAS POLICIES
-- Public read access
CREATE POLICY "Anyone can read service extras" ON service_extras
    FOR SELECT USING (true);

-- Admins can manage service extras
CREATE POLICY "Admins can manage service extras" ON service_extras
    FOR ALL USING (is_admin());

-- FREQUENCY DISCOUNTS POLICIES
-- Public read access for active discounts
CREATE POLICY "Anyone can read active frequency discounts" ON frequency_discounts
    FOR SELECT USING (active_to IS NULL OR active_to > NOW());

-- Admins can manage frequency discounts
CREATE POLICY "Admins can manage frequency discounts" ON frequency_discounts
    FOR ALL USING (is_admin());

-- SERVICE FEATURES POLICIES
-- Public read access
CREATE POLICY "Anyone can read service features" ON service_features
    FOR SELECT USING (true);

-- Admins can manage service features
CREATE POLICY "Admins can manage service features" ON service_features
    FOR ALL USING (is_admin());

-- QUOTES POLICIES
-- Anyone can create quotes
CREATE POLICY "Anyone can create quotes" ON quotes
    FOR INSERT WITH CHECK (true);

-- Anyone can read quotes
CREATE POLICY "Anyone can read quotes" ON quotes
    FOR SELECT USING (true);

-- Admins can manage all quotes
CREATE POLICY "Admins can manage all quotes" ON quotes
    FOR ALL USING (is_admin());

-- TESTIMONIALS POLICIES
-- Public read access for active testimonials
CREATE POLICY "Anyone can read active testimonials" ON testimonials
    FOR SELECT USING (is_active = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials" ON testimonials
    FOR ALL USING (is_admin());

-- CONTENT BLOCKS POLICIES
-- Public read access for active content blocks
CREATE POLICY "Anyone can read active content blocks" ON content_blocks
    FOR SELECT USING (is_active = true);

-- Admins can manage content blocks
CREATE POLICY "Admins can manage content blocks" ON content_blocks
    FOR ALL USING (is_admin());

-- TEAM MEMBERS POLICIES
-- Public read access for active team members
CREATE POLICY "Anyone can read active team members" ON team_members
    FOR SELECT USING (is_active = true);

-- Admins can manage team members
CREATE POLICY "Admins can manage team members" ON team_members
    FOR ALL USING (is_admin());

-- CLEANER AREAS POLICIES
-- Public read access
CREATE POLICY "Anyone can read cleaner areas" ON cleaner_areas
    FOR SELECT USING (true);

-- Cleaners can manage their own areas
CREATE POLICY "Cleaners can manage own areas" ON cleaner_areas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CLEANER'
        )
    );

-- Admins can manage all cleaner areas
CREATE POLICY "Admins can manage all cleaner areas" ON cleaner_areas
    FOR ALL USING (is_admin());

-- CLEANER AVAILABILITY POLICIES
-- Public read access for available slots
CREATE POLICY "Anyone can read available cleaner slots" ON cleaner_availability
    FOR SELECT USING (is_available = true);

-- Cleaners can manage their own availability
CREATE POLICY "Cleaners can manage own availability" ON cleaner_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'CLEANER'
        )
    );

-- Admins can manage all cleaner availability
CREATE POLICY "Admins can manage all cleaner availability" ON cleaner_availability
    FOR ALL USING (is_admin());

-- 5. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON FUNCTION get_user_role() IS 'Helper function to get current user role';
COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is admin';
COMMENT ON FUNCTION is_cleaner() IS 'Helper function to check if current user is cleaner';
COMMENT ON FUNCTION is_customer() IS 'Helper function to check if current user is customer';
