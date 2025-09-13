-- Migration: Row Level Security Policies
-- Description: Implement role-based access control for all tables

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suburbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaner_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is cleaner
CREATE OR REPLACE FUNCTION is_cleaner()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'CLEANER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is customer
CREATE OR REPLACE FUNCTION is_customer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'CUSTOMER';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- SERVICE CATEGORIES POLICIES
-- Public read access
CREATE POLICY "Anyone can read service categories" ON service_categories
    FOR SELECT USING (is_active = true);

-- Admins can manage service categories
CREATE POLICY "Admins can manage service categories" ON service_categories
    FOR ALL USING (is_admin());

-- SERVICES POLICIES
-- Public read access
CREATE POLICY "Anyone can read services" ON services
    FOR SELECT USING (is_active = true);

-- Admins can manage services
CREATE POLICY "Admins can manage services" ON services
    FOR ALL USING (is_admin());

-- SERVICE ITEMS POLICIES
-- Public read access
CREATE POLICY "Anyone can read service items" ON service_items
    FOR SELECT USING (true);

-- Admins can manage service items
CREATE POLICY "Admins can manage service items" ON service_items
    FOR ALL USING (is_admin());

-- EXTRAS POLICIES
-- Public read access
CREATE POLICY "Anyone can read extras" ON extras
    FOR SELECT USING (is_active = true);

-- Admins can manage extras
CREATE POLICY "Admins can manage extras" ON extras
    FOR ALL USING (is_admin());

-- PRICING RULES POLICIES
-- Public read access
CREATE POLICY "Anyone can read pricing rules" ON pricing_rules
    FOR SELECT USING (is_active = true);

-- Admins can manage pricing rules
CREATE POLICY "Admins can manage pricing rules" ON pricing_rules
    FOR ALL USING (is_admin());

-- REGIONS POLICIES
-- Public read access
CREATE POLICY "Anyone can read regions" ON regions
    FOR SELECT USING (is_active = true);

-- Admins can manage regions
CREATE POLICY "Admins can manage regions" ON regions
    FOR ALL USING (is_admin());

-- SUBURBS POLICIES
-- Public read access
CREATE POLICY "Anyone can read suburbs" ON suburbs
    FOR SELECT USING (is_active = true);

-- Admins can manage suburbs
CREATE POLICY "Admins can manage suburbs" ON suburbs
    FOR ALL USING (is_admin());

-- CLEANERS POLICIES
-- Public read access for active cleaners
CREATE POLICY "Anyone can read active cleaners" ON cleaners
    FOR SELECT USING (is_available = true);

-- Cleaners can read their own profile
CREATE POLICY "Cleaners can read own profile" ON cleaners
    FOR SELECT USING (auth.uid() = profile_id);

-- Cleaners can update their own profile
CREATE POLICY "Cleaners can update own profile" ON cleaners
    FOR UPDATE USING (auth.uid() = profile_id);

-- Admins can manage all cleaners
CREATE POLICY "Admins can manage all cleaners" ON cleaners
    FOR ALL USING (is_admin());

-- CLEANER LOCATIONS POLICIES
-- Public read access
CREATE POLICY "Anyone can read cleaner locations" ON cleaner_locations
    FOR SELECT USING (true);

-- Cleaners can manage their own locations
CREATE POLICY "Cleaners can manage own locations" ON cleaner_locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cleaners 
            WHERE id = cleaner_locations.cleaner_id 
            AND profile_id = auth.uid()
        )
    );

-- Admins can manage all cleaner locations
CREATE POLICY "Admins can manage all cleaner locations" ON cleaner_locations
    FOR ALL USING (is_admin());

-- AVAILABILITY SLOTS POLICIES
-- Public read access
CREATE POLICY "Anyone can read availability slots" ON availability_slots
    FOR SELECT USING (is_active = true);

-- Cleaners can manage their own availability
CREATE POLICY "Cleaners can manage own availability" ON availability_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cleaners 
            WHERE id = availability_slots.cleaner_id 
            AND profile_id = auth.uid()
        )
    );

-- Admins can manage all availability slots
CREATE POLICY "Admins can manage all availability slots" ON availability_slots
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
            AND profile_id = auth.uid()
        )
    );

-- Cleaners can update bookings assigned to them
CREATE POLICY "Cleaners can update assigned bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cleaners 
            WHERE id = bookings.cleaner_id 
            AND profile_id = auth.uid()
        )
    );

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON bookings
    FOR ALL USING (is_admin());

-- BOOKING ITEMS POLICIES
-- Users can read booking items for their bookings
CREATE POLICY "Users can read own booking items" ON booking_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_items.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id IN (
                SELECT id FROM cleaners WHERE profile_id = auth.uid()
            ))
        )
    );

-- Cleaners can update booking items for their bookings
CREATE POLICY "Cleaners can update assigned booking items" ON booking_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_items.booking_id 
            AND cleaner_id IN (
                SELECT id FROM cleaners WHERE profile_id = auth.uid()
            )
        )
    );

-- Admins can manage all booking items
CREATE POLICY "Admins can manage all booking items" ON booking_items
    FOR ALL USING (is_admin());

-- BOOKING EXTRAS POLICIES
-- Users can read booking extras for their bookings
CREATE POLICY "Users can read own booking extras" ON booking_extras
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = booking_extras.booking_id 
            AND (customer_id = auth.uid() OR cleaner_id IN (
                SELECT id FROM cleaners WHERE profile_id = auth.uid()
            ))
        )
    );

-- Admins can manage all booking extras
CREATE POLICY "Admins can manage all booking extras" ON booking_extras
    FOR ALL USING (is_admin());

-- PAYMENTS POLICIES
-- Customers can read their own payments
CREATE POLICY "Customers can read own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = payments.booking_id 
            AND customer_id = auth.uid()
        )
    );

-- Admins can manage all payments
CREATE POLICY "Admins can manage all payments" ON payments
    FOR ALL USING (is_admin());

-- NOTIFICATIONS POLICIES
-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System can create notifications for users
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications" ON notifications
    FOR ALL USING (is_admin());

-- RATINGS POLICIES
-- Public read access for published ratings
CREATE POLICY "Anyone can read published ratings" ON ratings
    FOR SELECT USING (is_public = true);

-- Customers can read their own ratings
CREATE POLICY "Customers can read own ratings" ON ratings
    FOR SELECT USING (auth.uid() = customer_id);

-- Customers can create ratings for their bookings
CREATE POLICY "Customers can create own ratings" ON ratings
    FOR INSERT WITH CHECK (
        auth.uid() = customer_id 
        AND EXISTS (
            SELECT 1 FROM bookings 
            WHERE id = ratings.booking_id 
            AND customer_id = auth.uid()
            AND status = 'COMPLETED'
        )
    );

-- Customers can update their own ratings
CREATE POLICY "Customers can update own ratings" ON ratings
    FOR UPDATE USING (auth.uid() = customer_id);

-- Admins can manage all ratings
CREATE POLICY "Admins can manage all ratings" ON ratings
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
