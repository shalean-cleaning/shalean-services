-- Migration: Fix Schema to Match PRD Requirements
-- Description: Remove non-PRD tables and create proper PRD-compliant schema
-- This migration fixes all schema issues to match the PRD exactly

-- 1. DROP NON-PRD TABLES AND COLUMNS
-- Remove tables that don't exist in PRD
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS service_items CASCADE;
DROP TABLE IF EXISTS pricing_rules CASCADE;
DROP TABLE IF EXISTS cleaner_locations CASCADE;
DROP TABLE IF EXISTS availability_slots CASCADE;
DROP TABLE IF EXISTS booking_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS cleaner_service_areas CASCADE;
DROP TABLE IF EXISTS cleaner_services CASCADE;
DROP TABLE IF EXISTS cleaner_availability CASCADE;

-- Remove non-PRD columns from existing tables
ALTER TABLE services DROP COLUMN IF EXISTS category_id;
ALTER TABLE services DROP COLUMN IF EXISTS duration_minutes;
ALTER TABLE services DROP COLUMN IF EXISTS sort_order;
ALTER TABLE services DROP COLUMN IF EXISTS updated_at;

ALTER TABLE extras DROP COLUMN IF EXISTS duration_minutes;
ALTER TABLE extras DROP COLUMN IF EXISTS sort_order;
ALTER TABLE extras DROP COLUMN IF EXISTS updated_at;

ALTER TABLE cleaners DROP COLUMN IF EXISTS profile_id;
ALTER TABLE cleaners DROP COLUMN IF EXISTS experience_years;
ALTER TABLE cleaners DROP COLUMN IF EXISTS hourly_rate;
ALTER TABLE cleaners DROP COLUMN IF EXISTS total_ratings;
ALTER TABLE cleaners DROP COLUMN IF EXISTS updated_at;

ALTER TABLE bookings DROP COLUMN IF EXISTS end_time;
ALTER TABLE bookings DROP COLUMN IF EXISTS notes;
ALTER TABLE bookings DROP COLUMN IF EXISTS special_instructions;
ALTER TABLE bookings DROP COLUMN IF EXISTS updated_at;

-- 2. ADD MISSING PRD-REQUIRED COLUMNS
-- Add slug to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_fee DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Add slug to extras table  
ALTER TABLE extras ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE extras ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Add slug to areas table (rename suburbs to areas)
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS price_adjustment_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Update cleaners table to match PRD
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS name TEXT NOT NULL;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Update bookings table to match PRD
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES suburbs(id) ON DELETE RESTRICT;

-- 3. CREATE PRD-REQUIRED TABLES

-- Service pricing table (per-bedroom, per-bathroom pricing)
CREATE TABLE IF NOT EXISTS service_pricing (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    per_bedroom DECIMAL(10,2) DEFAULT 0,
    per_bathroom DECIMAL(10,2) DEFAULT 0,
    service_fee_flat DECIMAL(10,2) DEFAULT 0,
    service_fee_pct DECIMAL(5,2) DEFAULT 0,
    active_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active_to TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (service_id)
);

-- Service extras (required extras for services)
CREATE TABLE IF NOT EXISTS service_extras (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    extra_id UUID REFERENCES extras(id) ON DELETE CASCADE,
    required BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (service_id, extra_id)
);

-- Frequency discounts
CREATE TABLE IF NOT EXISTS frequency_discounts (
    frequency TEXT PRIMARY KEY,
    discount_pct DECIMAL(5,2) NOT NULL,
    active_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active_to TIMESTAMP WITH TIME ZONE
);

-- Service features
CREATE TABLE IF NOT EXISTS service_features (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    PRIMARY KEY (service_id, label)
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    extras JSONB DEFAULT '[]'::JSONB,
    frequency TEXT,
    area_id UUID REFERENCES suburbs(id) ON DELETE RESTRICT,
    total_estimate DECIMAL(10,2) NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_location TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content blocks for homepage
CREATE TABLE IF NOT EXISTS content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_type TEXT NOT NULL, -- 'hero', 'how_it_works', 'why_choose_us', etc.
    title TEXT,
    content TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    photo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cleaner areas (many-to-many relationship)
CREATE TABLE IF NOT EXISTS cleaner_areas (
    cleaner_id UUID REFERENCES cleaners(id) ON DELETE CASCADE,
    area_id UUID REFERENCES suburbs(id) ON DELETE CASCADE,
    PRIMARY KEY (cleaner_id, area_id)
);

-- Cleaner availability
CREATE TABLE IF NOT EXISTS cleaner_availability (
    cleaner_id UUID REFERENCES cleaners(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (cleaner_id, day_of_week, start_time, end_time)
);

-- 4. UPDATE EXISTING DATA TO MATCH NEW STRUCTURE

-- Update services table
UPDATE services SET 
    base_fee = COALESCE(base_price, 0),
    active = COALESCE(is_active, true),
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
WHERE slug IS NULL;

-- Update extras table
UPDATE extras SET 
    active = COALESCE(is_active, true),
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
WHERE slug IS NULL;

-- Update suburbs table (now areas)
UPDATE suburbs SET 
    active = COALESCE(is_active, true),
    slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), '&', 'and'))
WHERE slug IS NULL;

-- Update cleaners table
UPDATE cleaners SET 
    name = COALESCE(full_name, 'Unknown Cleaner'),
    active = COALESCE(is_available, true)
WHERE name IS NULL;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_extras_slug ON extras(slug);
CREATE INDEX IF NOT EXISTS idx_extras_active ON extras(active);
CREATE INDEX IF NOT EXISTS idx_suburbs_slug ON suburbs(slug);
CREATE INDEX IF NOT EXISTS idx_suburbs_active ON suburbs(active);
CREATE INDEX IF NOT EXISTS idx_cleaners_active ON cleaners(active);
CREATE INDEX IF NOT EXISTS idx_bookings_bedrooms ON bookings(bedrooms);
CREATE INDEX IF NOT EXISTS idx_bookings_bathrooms ON bookings(bathrooms);
CREATE INDEX IF NOT EXISTS idx_bookings_frequency ON bookings(frequency);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON content_blocks(block_type, sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(is_active, sort_order);

-- 6. ENABLE RLS ON NEW TABLES
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE frequency_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaner_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaner_availability ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR NEW TABLES

-- Service pricing policies
CREATE POLICY "Anyone can read service pricing" ON service_pricing
    FOR SELECT USING (true);

-- Service extras policies  
CREATE POLICY "Anyone can read service extras" ON service_extras
    FOR SELECT USING (true);

-- Frequency discounts policies
CREATE POLICY "Anyone can read frequency discounts" ON frequency_discounts
    FOR SELECT USING (active_to IS NULL OR active_to > NOW());

-- Service features policies
CREATE POLICY "Anyone can read service features" ON service_features
    FOR SELECT USING (true);

-- Quotes policies
CREATE POLICY "Anyone can create quotes" ON quotes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read quotes" ON quotes
    FOR SELECT USING (true);

-- Testimonials policies
CREATE POLICY "Anyone can read active testimonials" ON testimonials
    FOR SELECT USING (is_active = true);

-- Content blocks policies
CREATE POLICY "Anyone can read active content blocks" ON content_blocks
    FOR SELECT USING (is_active = true);

-- Team members policies
CREATE POLICY "Anyone can read active team members" ON team_members
    FOR SELECT USING (is_active = true);

-- Cleaner areas policies
CREATE POLICY "Anyone can read cleaner areas" ON cleaner_areas
    FOR SELECT USING (true);

-- Cleaner availability policies
CREATE POLICY "Anyone can read cleaner availability" ON cleaner_availability
    FOR SELECT USING (is_available = true);

-- 8. CREATE HELPER FUNCTIONS

-- Function to get service by slug
CREATE OR REPLACE FUNCTION get_service_by_slug(service_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    base_fee DECIMAL(10,2),
    active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, s.description, s.base_fee, s.active
    FROM services s
    WHERE s.slug = service_slug AND s.active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate quote price
CREATE OR REPLACE FUNCTION calculate_quote_price(
    p_service_id UUID,
    p_bedrooms INTEGER,
    p_bathrooms INTEGER,
    p_extras JSONB,
    p_frequency TEXT,
    p_area_id UUID
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_fee DECIMAL(10,2);
    bedroom_fee DECIMAL(10,2);
    bathroom_fee DECIMAL(10,2);
    extras_total DECIMAL(10,2) := 0;
    area_adjustment DECIMAL(5,2);
    frequency_discount DECIMAL(5,2) := 0;
    total_price DECIMAL(10,2);
    extra_item JSONB;
BEGIN
    -- Get base pricing
    SELECT s.base_fee, sp.per_bedroom, sp.per_bathroom, sub.price_adjustment_pct
    INTO base_fee, bedroom_fee, bathroom_fee, area_adjustment
    FROM services s
    LEFT JOIN service_pricing sp ON s.id = sp.service_id
    LEFT JOIN suburbs sub ON sub.id = p_area_id
    WHERE s.id = p_service_id;
    
    -- Calculate bedroom/bathroom fees
    bedroom_fee := COALESCE(bedroom_fee, 0) * p_bedrooms;
    bathroom_fee := COALESCE(bathroom_fee, 0) * p_bathrooms;
    
    -- Calculate extras total
    FOR extra_item IN SELECT * FROM jsonb_array_elements(p_extras)
    LOOP
        extras_total := extras_total + (extra_item->>'price')::DECIMAL(10,2);
    END LOOP;
    
    -- Get frequency discount
    IF p_frequency IS NOT NULL THEN
        SELECT discount_pct INTO frequency_discount
        FROM frequency_discounts
        WHERE frequency = p_frequency
        AND (active_to IS NULL OR active_to > NOW());
    END IF;
    
    -- Calculate total
    total_price := base_fee + bedroom_fee + bathroom_fee + extras_total;
    
    -- Apply area adjustment
    IF area_adjustment IS NOT NULL THEN
        total_price := total_price * (1 + area_adjustment / 100);
    END IF;
    
    -- Apply frequency discount
    IF frequency_discount > 0 THEN
        total_price := total_price * (1 - frequency_discount / 100);
    END IF;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE service_pricing IS 'Pricing rules for services including per-bedroom and per-bathroom fees';
COMMENT ON TABLE service_extras IS 'Required extras for specific services';
COMMENT ON TABLE frequency_discounts IS 'Discounts for recurring booking frequencies';
COMMENT ON TABLE service_features IS 'Feature labels for services';
COMMENT ON TABLE quotes IS 'Customer quote requests and estimates';
COMMENT ON TABLE testimonials IS 'Customer testimonials and reviews';
COMMENT ON TABLE content_blocks IS 'Homepage content blocks for dynamic content';
COMMENT ON TABLE team_members IS 'Team member information for the team page';
COMMENT ON TABLE cleaner_areas IS 'Many-to-many relationship between cleaners and service areas';
COMMENT ON TABLE cleaner_availability IS 'Cleaner availability schedules';

-- 10. SEED INITIAL DATA

-- Insert default frequency discounts
INSERT INTO frequency_discounts (frequency, discount_pct) VALUES
    ('weekly', 10.00),
    ('bi-weekly', 15.00),
    ('monthly', 20.00)
ON CONFLICT (frequency) DO NOTHING;

-- Insert sample content blocks
INSERT INTO content_blocks (block_type, title, content, sort_order) VALUES
    ('hero', 'Professional Cleaning Services', 'Trusted cleaners, affordable prices, flexible scheduling', 1),
    ('how_it_works', 'How It Works', 'Select Service → Book → Cleaner Arrives → Relax', 2),
    ('why_choose_us', 'Why Choose Shalean', 'Trusted Cleaners, Affordable Prices, Flexible Scheduling, 100% Satisfaction Guarantee', 3)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, customer_location, rating, comment, is_featured) VALUES
    ('Sarah Johnson', 'Cape Town', 5, 'Excellent service! The cleaner was professional and thorough.', true),
    ('Mike Chen', 'Sea Point', 5, 'Great value for money. Will definitely book again.', true),
    ('Lisa Williams', 'Claremont', 4, 'Very satisfied with the cleaning quality.', false)
ON CONFLICT DO NOTHING;
