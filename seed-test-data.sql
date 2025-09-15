-- Seed script for testing cleaner availability
-- This creates minimal test data to ensure the availability API works

-- Insert a test region
INSERT INTO regions (id, name, state, is_active) 
VALUES ('test-region-1', 'Test Region', 'NSW', true)
ON CONFLICT (id) DO NOTHING;

-- Insert a test suburb
INSERT INTO suburbs (id, region_id, name, postcode, delivery_fee, is_active)
VALUES ('test-suburb-1', 'test-region-1', 'Test Suburb', '2000', 15.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert a test profile for cleaner
INSERT INTO profiles (id, email, first_name, last_name, phone, role, is_active)
VALUES ('test-profile-1', 'cleaner@test.com', 'John', 'Doe', '+61400000000', 'CLEANER', true)
ON CONFLICT (id) DO NOTHING;

-- Insert a test cleaner
INSERT INTO cleaners (id, profile_id, bio, experience_years, hourly_rate, is_available, rating, total_ratings)
VALUES ('test-cleaner-1', 'test-profile-1', 'Professional cleaner with 5 years experience', 5, 35.00, true, 4.8, 127)
ON CONFLICT (id) DO NOTHING;

-- Insert cleaner location relationship
INSERT INTO cleaner_locations (id, cleaner_id, suburb_id)
VALUES ('test-location-1', 'test-cleaner-1', 'test-suburb-1')
ON CONFLICT (id) DO NOTHING;

-- Insert a test service
INSERT INTO services (id, category_id, name, slug, description, base_price, duration_minutes, is_active, sort_order)
VALUES ('test-service-1', NULL, 'Standard Cleaning', 'standard-cleaning', 'Basic house cleaning service', 120.00, 120, true, 1)
ON CONFLICT (id) DO NOTHING;
