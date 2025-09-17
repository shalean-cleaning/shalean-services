-- Migration: Update Schema to Match Requirements
-- Description: Update tables to match the specified schema requirements
--              - Update profiles table structure
--              - Update bookings table with required fields
--              - Update booking_items table structure
--              - Ensure proper RLS policies

-- 1. UPDATE PROFILES TABLE
-- Add full_name column and update structure
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Update full_name from first_name and last_name for existing records
UPDATE profiles 
SET full_name = CONCAT(first_name, ' ', last_name) 
WHERE full_name IS NULL AND first_name IS NOT NULL AND last_name IS NOT NULL;

-- Make full_name NOT NULL after populating
ALTER TABLE profiles ALTER COLUMN full_name SET NOT NULL;

-- Add index on full_name for performance
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- Add comment
COMMENT ON COLUMN profiles.full_name IS 'Full name of the user (concatenated from first_name and last_name)';

-- 2. UPDATE BOOKINGS TABLE
-- Add missing columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS service_slug TEXT,
ADD COLUMN IF NOT EXISTS region_id UUID REFERENCES regions(id) ON DELETE RESTRICT,
ADD COLUMN IF NOT EXISTS start_ts TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_ts TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS paystack_ref TEXT,
ADD COLUMN IF NOT EXISTS paystack_status TEXT;

-- Update start_ts and end_ts from existing booking_date, start_time, end_time
UPDATE bookings 
SET start_ts = (booking_date + start_time)::TIMESTAMP WITH TIME ZONE,
    end_ts = (booking_date + end_time)::TIMESTAMP WITH TIME ZONE
WHERE start_ts IS NULL OR end_ts IS NULL;

-- Update service_slug from services table
UPDATE bookings 
SET service_slug = s.slug
FROM services s
WHERE bookings.service_id = s.id 
AND bookings.service_slug IS NULL;

-- Update region_id from suburbs table
UPDATE bookings 
SET region_id = sub.region_id
FROM suburbs sub
WHERE bookings.suburb_id = sub.id 
AND bookings.region_id IS NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_bookings_service_slug ON bookings(service_slug);
CREATE INDEX IF NOT EXISTS idx_bookings_region_id ON bookings(region_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_ts ON bookings(start_ts);
CREATE INDEX IF NOT EXISTS idx_bookings_end_ts ON bookings(end_ts);
CREATE INDEX IF NOT EXISTS idx_bookings_paystack_ref ON bookings(paystack_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_paystack_status ON bookings(paystack_status);

-- Add comments
COMMENT ON COLUMN bookings.service_slug IS 'URL-friendly service identifier';
COMMENT ON COLUMN bookings.region_id IS 'Reference to the region for this booking';
COMMENT ON COLUMN bookings.start_ts IS 'Booking start timestamp';
COMMENT ON COLUMN bookings.end_ts IS 'Booking end timestamp';
COMMENT ON COLUMN bookings.paystack_ref IS 'Paystack payment reference';
COMMENT ON COLUMN bookings.paystack_status IS 'Paystack payment status';

-- 3. UPDATE BOOKING_ITEMS TABLE
-- Add new columns and update structure
ALTER TABLE booking_items 
ADD COLUMN IF NOT EXISTS item_type TEXT,
ADD COLUMN IF NOT EXISTS qty INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

-- Update item_type from service_items table
UPDATE booking_items 
SET item_type = si.name
FROM service_items si
WHERE booking_items.service_item_id = si.id 
AND booking_items.item_type IS NULL;

-- Update unit_price from service_items table
UPDATE booking_items 
SET unit_price = COALESCE(si.additional_price, 0)
FROM service_items si
WHERE booking_items.service_item_id = si.id 
AND booking_items.unit_price = 0;

-- Calculate subtotal
UPDATE booking_items 
SET subtotal = qty * unit_price
WHERE subtotal = 0;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_booking_items_item_type ON booking_items(item_type);
CREATE INDEX IF NOT EXISTS idx_booking_items_qty ON booking_items(qty);
CREATE INDEX IF NOT EXISTS idx_booking_items_unit_price ON booking_items(unit_price);
CREATE INDEX IF NOT EXISTS idx_booking_items_subtotal ON booking_items(subtotal);

-- Add comments
COMMENT ON COLUMN booking_items.item_type IS 'Type/name of the booking item';
COMMENT ON COLUMN booking_items.qty IS 'Quantity of the item';
COMMENT ON COLUMN booking_items.unit_price IS 'Price per unit of the item';
COMMENT ON COLUMN booking_items.subtotal IS 'Total price for this item (qty * unit_price)';

-- 4. UPDATE RLS POLICIES FOR NEW STRUCTURE
-- The existing RLS policies should work with the new structure since they're based on relationships
-- But let's ensure the policies are properly set up

-- Verify RLS is enabled on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;

-- 5. ADD HELPER FUNCTIONS FOR NEW FIELDS
-- Function to get service slug from service_id
CREATE OR REPLACE FUNCTION get_service_slug(service_uuid UUID)
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT slug 
        FROM services 
        WHERE id = service_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get region_id from suburb_id
CREATE OR REPLACE FUNCTION get_region_from_suburb(suburb_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT region_id 
        FROM suburbs 
        WHERE id = suburb_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate booking timestamps
CREATE OR REPLACE FUNCTION calculate_booking_timestamps(
    booking_date_val DATE,
    start_time_val TIME,
    end_time_val TIME
)
RETURNS TABLE(start_ts TIMESTAMP WITH TIME ZONE, end_ts TIMESTAMP WITH TIME ZONE) AS $$
BEGIN
    RETURN QUERY SELECT 
        (booking_date_val + start_time_val)::TIMESTAMP WITH TIME ZONE,
        (booking_date_val + end_time_val)::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for helper functions
COMMENT ON FUNCTION get_service_slug IS 'Helper function to get service slug from service ID';
COMMENT ON FUNCTION get_region_from_suburb IS 'Helper function to get region ID from suburb ID';
COMMENT ON FUNCTION calculate_booking_timestamps IS 'Helper function to calculate start and end timestamps from date and time';

-- 6. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- Trigger to automatically update service_slug when service_id changes
CREATE OR REPLACE FUNCTION update_booking_service_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.service_id IS NOT NULL THEN
        NEW.service_slug := get_service_slug(NEW.service_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_service_slug
    BEFORE INSERT OR UPDATE OF service_id ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_service_slug();

-- Trigger to automatically update region_id when suburb_id changes
CREATE OR REPLACE FUNCTION update_booking_region_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.suburb_id IS NOT NULL THEN
        NEW.region_id := get_region_from_suburb(NEW.suburb_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_region_id
    BEFORE INSERT OR UPDATE OF suburb_id ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_region_id();

-- Trigger to automatically update timestamps when date/time changes
CREATE OR REPLACE FUNCTION update_booking_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_date IS NOT NULL AND NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        NEW.start_ts := (NEW.booking_date + NEW.start_time)::TIMESTAMP WITH TIME ZONE;
        NEW.end_ts := (NEW.booking_date + NEW.end_time)::TIMESTAMP WITH TIME ZONE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_timestamps
    BEFORE INSERT OR UPDATE OF booking_date, start_time, end_time ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_timestamps();

-- Trigger to automatically calculate subtotal in booking_items
CREATE OR REPLACE FUNCTION update_booking_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.subtotal := NEW.qty * NEW.unit_price;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_item_subtotal
    BEFORE INSERT OR UPDATE OF qty, unit_price ON booking_items
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_item_subtotal();

-- Add comments for triggers
COMMENT ON FUNCTION update_booking_service_slug IS 'Trigger function to automatically update service_slug when service_id changes';
COMMENT ON FUNCTION update_booking_region_id IS 'Trigger function to automatically update region_id when suburb_id changes';
COMMENT ON FUNCTION update_booking_timestamps IS 'Trigger function to automatically update start_ts and end_ts when date/time changes';
COMMENT ON FUNCTION update_booking_item_subtotal IS 'Trigger function to automatically calculate subtotal in booking_items';
