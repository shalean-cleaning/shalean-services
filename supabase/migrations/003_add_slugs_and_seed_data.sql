-- Migration: Add Slugs and Update Data for PRD Compliance
-- Description: Add missing slug fields and update existing data to match PRD requirements

-- 1. ADD SLUG COLUMNS TO EXISTING TABLES
-- Add slug to services table if not exists
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add slug to extras table if not exists
ALTER TABLE extras ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add slug to suburbs table if not exists
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS slug TEXT;

-- 2. CREATE UNIQUE INDEXES FOR SLUGS
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_slug_unique ON services(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_extras_slug_unique ON extras(slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_suburbs_slug_unique ON suburbs(slug) WHERE slug IS NOT NULL;

-- 3. FUNCTION TO GENERATE SLUGS
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. UPDATE SERVICES TABLE WITH SLUGS
UPDATE services 
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

-- 5. UPDATE EXTRAS TABLE WITH SLUGS
UPDATE extras 
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

-- 6. UPDATE SUBURBS TABLE WITH SLUGS
UPDATE suburbs 
SET slug = generate_slug(name)
WHERE slug IS NULL OR slug = '';

-- 7. ADD MISSING COLUMNS TO BOOKINGS TABLE
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS frequency TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES suburbs(id) ON DELETE RESTRICT;

-- 8. UPDATE EXISTING BOOKINGS WITH DEFAULT VALUES
UPDATE bookings 
SET bedrooms = 0, bathrooms = 0, area_id = suburb_id
WHERE bedrooms IS NULL OR bathrooms IS NULL OR area_id IS NULL;

-- 9. ADD MISSING COLUMNS TO CLEANERS TABLE
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS contact_info TEXT;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE cleaners ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 10. UPDATE EXISTING CLEANERS DATA
UPDATE cleaners 
SET name = COALESCE(full_name, 'Unknown Cleaner'),
    active = COALESCE(is_available, true)
WHERE name IS NULL OR active IS NULL;

-- 11. ADD MISSING COLUMNS TO SERVICES TABLE
ALTER TABLE services ADD COLUMN IF NOT EXISTS base_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 12. UPDATE EXISTING SERVICES DATA
UPDATE services 
SET base_fee = COALESCE(base_price, 0),
    active = COALESCE(is_active, true)
WHERE base_fee IS NULL OR active IS NULL;

-- 13. ADD MISSING COLUMNS TO EXTRAS TABLE
ALTER TABLE extras ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 14. UPDATE EXISTING EXTRAS DATA
UPDATE extras 
SET active = COALESCE(is_active, true)
WHERE active IS NULL;

-- 15. ADD MISSING COLUMNS TO SUBURBS TABLE
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS price_adjustment_pct DECIMAL(5,2) DEFAULT 0;
ALTER TABLE suburbs ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- 16. UPDATE EXISTING SUBURBS DATA
UPDATE suburbs 
SET active = COALESCE(is_active, true)
WHERE active IS NULL;

-- 17. CREATE TRIGGERS TO AUTO-GENERATE SLUGS
CREATE OR REPLACE FUNCTION update_service_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_extra_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_suburb_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_service_slug ON services;
CREATE TRIGGER trigger_update_service_slug
    BEFORE INSERT OR UPDATE OF name ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_service_slug();

DROP TRIGGER IF EXISTS trigger_update_extra_slug ON extras;
CREATE TRIGGER trigger_update_extra_slug
    BEFORE INSERT OR UPDATE OF name ON extras
    FOR EACH ROW
    EXECUTE FUNCTION update_extra_slug();

DROP TRIGGER IF EXISTS trigger_update_suburb_slug ON suburbs;
CREATE TRIGGER trigger_update_suburb_slug
    BEFORE INSERT OR UPDATE OF name ON suburbs
    FOR EACH ROW
    EXECUTE FUNCTION update_suburb_slug();

-- 18. SEED SAMPLE DATA FOR TESTING

-- Insert sample services if they don't exist
INSERT INTO services (name, description, base_fee, slug, active) VALUES
    ('Standard Cleaning', 'Regular house cleaning service', 150.00, 'standard-cleaning', true),
    ('Deep Cleaning', 'Thorough deep cleaning service', 250.00, 'deep-cleaning', true),
    ('Move In/Out Cleaning', 'Cleaning for moving in or out', 300.00, 'move-in-out-cleaning', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample extras if they don't exist
INSERT INTO extras (name, description, price, slug, active) VALUES
    ('Window Cleaning', 'Interior and exterior window cleaning', 50.00, 'window-cleaning', true),
    ('Oven Cleaning', 'Deep oven cleaning service', 80.00, 'oven-cleaning', true),
    ('Fridge Cleaning', 'Deep fridge cleaning service', 60.00, 'fridge-cleaning', true),
    ('Carpet Cleaning', 'Professional carpet cleaning', 100.00, 'carpet-cleaning', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample service pricing
INSERT INTO service_pricing (service_id, per_bedroom, per_bathroom, service_fee_flat, service_fee_pct) 
SELECT s.id, 25.00, 20.00, 15.00, 5.00
FROM services s
WHERE s.slug IN ('standard-cleaning', 'deep-cleaning', 'move-in-out-cleaning')
ON CONFLICT (service_id) DO NOTHING;

-- Insert sample service features
INSERT INTO service_features (service_id, label, sort_order)
SELECT s.id, f.feature, f.sort_order
FROM services s
CROSS JOIN (
    VALUES 
        ('All rooms cleaned', 1),
        ('Bathroom sanitization', 2),
        ('Kitchen deep clean', 3),
        ('Dusting and vacuuming', 4)
) AS f(feature, sort_order)
WHERE s.slug = 'standard-cleaning'
ON CONFLICT (service_id, label) DO NOTHING;

-- Insert sample service extras relationships
INSERT INTO service_extras (service_id, extra_id, required)
SELECT s.id, e.id, false
FROM services s
CROSS JOIN extras e
WHERE s.slug = 'standard-cleaning'
ON CONFLICT (service_id, extra_id) DO NOTHING;

-- 19. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generates URL-friendly slugs from text';
COMMENT ON FUNCTION update_service_slug() IS 'Trigger function to auto-generate service slugs';
COMMENT ON FUNCTION update_extra_slug() IS 'Trigger function to auto-generate extra slugs';
COMMENT ON FUNCTION update_suburb_slug() IS 'Trigger function to auto-generate suburb slugs';

-- 20. CREATE HELPER VIEWS FOR COMMON QUERIES
CREATE OR REPLACE VIEW active_services_view AS
SELECT 
    s.id,
    s.name,
    s.description,
    s.base_fee,
    s.slug,
    sp.per_bedroom,
    sp.per_bathroom,
    sp.service_fee_flat,
    sp.service_fee_pct
FROM services s
LEFT JOIN service_pricing sp ON s.id = sp.service_id
WHERE s.active = true
ORDER BY s.name;

CREATE OR REPLACE VIEW active_extras_view AS
SELECT 
    e.id,
    e.name,
    e.description,
    e.price,
    e.slug
FROM extras e
WHERE e.active = true
ORDER BY e.name;

CREATE OR REPLACE VIEW active_areas_view AS
SELECT 
    s.id,
    s.name,
    s.postcode,
    s.delivery_fee,
    s.price_adjustment_pct,
    s.slug,
    r.name as region_name,
    r.state
FROM suburbs s
JOIN regions r ON s.region_id = r.id
WHERE s.active = true
ORDER BY r.name, s.name;

-- Add comments for views
COMMENT ON VIEW active_services_view IS 'View of all active services with pricing information';
COMMENT ON VIEW active_extras_view IS 'View of all active extras';
COMMENT ON VIEW active_areas_view IS 'View of all active areas with region information';
