-- Seed Data for Shalean Services
-- Description: Sample data for development and testing
-- Note: All UUIDs are generated using gen_random_uuid() to avoid invalid UUID syntax errors
-- Note: Profiles are not seeded here as they require auth.users entries. They should be created through the auth system.

-- Insert service categories
INSERT INTO service_categories (id, name, description, icon, sort_order) VALUES
(gen_random_uuid(), 'Regular Cleaning', 'Standard cleaning services for homes and offices', 'home', 1),
(gen_random_uuid(), 'Deep Cleaning', 'Thorough cleaning for special occasions or move-in/out', 'sparkles', 2),
(gen_random_uuid(), 'Commercial Cleaning', 'Professional cleaning for businesses and offices', 'building', 3),
(gen_random_uuid(), 'Specialized Services', 'Carpet cleaning, window cleaning, and other specialized services', 'star', 4);

-- Insert services using CTEs to reference category IDs
WITH categories AS (
  SELECT id, name FROM service_categories ORDER BY sort_order
),
regular_cleaning AS (
  SELECT id FROM categories WHERE name = 'Regular Cleaning'
),
deep_cleaning AS (
  SELECT id FROM categories WHERE name = 'Deep Cleaning'
),
commercial_cleaning AS (
  SELECT id FROM categories WHERE name = 'Commercial Cleaning'
),
specialized_services AS (
  SELECT id FROM categories WHERE name = 'Specialized Services'
)
INSERT INTO services (id, category_id, name, description, base_price, duration_minutes, sort_order) VALUES
-- Regular Cleaning Services
(gen_random_uuid(), (SELECT id FROM regular_cleaning), 'Standard House Cleaning', 'Complete cleaning of all living areas including kitchen, bathrooms, bedrooms, and common areas', 120.00, 120, 1),
(gen_random_uuid(), (SELECT id FROM regular_cleaning), 'Apartment Cleaning', 'Thorough cleaning of apartment units including all rooms and appliances', 100.00, 90, 2),
(gen_random_uuid(), (SELECT id FROM regular_cleaning), 'Office Cleaning', 'Professional office cleaning including desks, common areas, and restrooms', 150.00, 120, 3),

-- Deep Cleaning Services
(gen_random_uuid(), (SELECT id FROM deep_cleaning), 'Move-in/Move-out Cleaning', 'Comprehensive cleaning for new tenants or departing residents', 200.00, 180, 4),
(gen_random_uuid(), (SELECT id FROM deep_cleaning), 'Post-Construction Cleaning', 'Specialized cleaning after construction or renovation work', 250.00, 240, 5),
(gen_random_uuid(), (SELECT id FROM deep_cleaning), 'Holiday Deep Clean', 'Thorough cleaning to prepare for holidays and special events', 180.00, 150, 6),

-- Commercial Services
(gen_random_uuid(), (SELECT id FROM commercial_cleaning), 'Retail Store Cleaning', 'Complete cleaning of retail spaces including floors, displays, and restrooms', 200.00, 150, 7),
(gen_random_uuid(), (SELECT id FROM commercial_cleaning), 'Restaurant Cleaning', 'Specialized cleaning for restaurants including kitchen areas and dining spaces', 300.00, 180, 8),

-- Specialized Services
(gen_random_uuid(), (SELECT id FROM specialized_services), 'Carpet Cleaning', 'Professional carpet and upholstery cleaning service', 80.00, 60, 9),
(gen_random_uuid(), (SELECT id FROM specialized_services), 'Window Cleaning', 'Interior and exterior window cleaning service', 60.00, 45, 10);

-- Insert service items using CTEs to reference service IDs
WITH services AS (
  SELECT id, name FROM services ORDER BY sort_order
),
standard_house AS (
  SELECT id FROM services WHERE name = 'Standard House Cleaning'
),
move_in_out AS (
  SELECT id FROM services WHERE name = 'Move-in/Move-out Cleaning'
)
INSERT INTO service_items (id, service_id, name, description, is_included, additional_price, sort_order) VALUES
-- Standard House Cleaning items
(gen_random_uuid(), (SELECT id FROM standard_house), 'Kitchen Cleaning', 'Clean countertops, appliances, sink, and cabinets', true, 0.00, 1),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Bathroom Cleaning', 'Clean toilets, showers, sinks, and mirrors', true, 0.00, 2),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Bedroom Cleaning', 'Dust furniture, vacuum floors, make beds', true, 0.00, 3),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Living Area Cleaning', 'Dust surfaces, vacuum/sweep floors, clean windows', true, 0.00, 4),

-- Deep Cleaning additional items
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Inside Appliances', 'Clean inside of oven, microwave, and refrigerator', true, 0.00, 5),
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Baseboards and Trim', 'Clean baseboards, door frames, and window sills', true, 0.00, 6),
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Light Fixtures', 'Clean ceiling fans and light fixtures', true, 0.00, 7);

-- Insert extras
INSERT INTO extras (id, name, description, price, duration_minutes, sort_order) VALUES
(gen_random_uuid(), 'Inside Refrigerator', 'Deep clean inside refrigerator including shelves and drawers', 25.00, 30, 1),
(gen_random_uuid(), 'Inside Oven', 'Clean inside oven including racks and door', 30.00, 45, 2),
(gen_random_uuid(), 'Laundry Service', 'Wash, dry, and fold one load of laundry', 20.00, 60, 3),
(gen_random_uuid(), 'Garage Cleaning', 'Clean garage floor and organize items', 40.00, 60, 4),
(gen_random_uuid(), 'Patio Cleaning', 'Clean outdoor patio furniture and surfaces', 35.00, 45, 5),
(gen_random_uuid(), 'Pet Hair Removal', 'Extra attention to pet hair on furniture and floors', 15.00, 30, 6),
(gen_random_uuid(), 'Window Cleaning', 'Clean interior windows and window sills', 20.00, 30, 7),
(gen_random_uuid(), 'Cabinet Organization', 'Organize kitchen cabinets and pantry', 25.00, 45, 8);

-- Insert pricing rules
INSERT INTO pricing_rules (id, name, rule_type, condition_json, price_modifier, is_percentage, is_active) VALUES
(gen_random_uuid(), 'Bedroom Surcharge', 'bedroom', '{"min_bedrooms": 4}', 10.00, false, true),
(gen_random_uuid(), 'Bathroom Surcharge', 'bathroom', '{"min_bathrooms": 3}', 15.00, false, true),
(gen_random_uuid(), 'Weekly Discount', 'frequency_discount', '{"frequency": "weekly"}', 0.10, true, true),
(gen_random_uuid(), 'Bi-weekly Discount', 'frequency_discount', '{"frequency": "biweekly"}', 0.05, true, true),
(gen_random_uuid(), 'Service Fee', 'service_fee', '{}', 0.10, true, true);

-- Insert regions
INSERT INTO regions (id, name, state, is_active) VALUES
(gen_random_uuid(), 'Greater Sydney', 'NSW', true),
(gen_random_uuid(), 'Melbourne Metro', 'VIC', true),
(gen_random_uuid(), 'Brisbane Metro', 'QLD', true),
(gen_random_uuid(), 'Perth Metro', 'WA', true);

-- Insert suburbs using CTEs to reference region IDs
WITH regions AS (
  SELECT id, name FROM regions ORDER BY name
),
sydney AS (
  SELECT id FROM regions WHERE name = 'Greater Sydney'
),
melbourne AS (
  SELECT id FROM regions WHERE name = 'Melbourne Metro'
),
brisbane AS (
  SELECT id FROM regions WHERE name = 'Brisbane Metro'
)
INSERT INTO suburbs (id, region_id, name, postcode, delivery_fee, is_active) VALUES
-- Sydney suburbs
(gen_random_uuid(), (SELECT id FROM sydney), 'Bondi', '2026', 5.00, true),
(gen_random_uuid(), (SELECT id FROM sydney), 'Surry Hills', '2010', 0.00, true),
(gen_random_uuid(), (SELECT id FROM sydney), 'Paddington', '2021', 3.00, true),
(gen_random_uuid(), (SELECT id FROM sydney), 'Newtown', '2042', 2.00, true),
(gen_random_uuid(), (SELECT id FROM sydney), 'Manly', '2095', 8.00, true),

-- Melbourne suburbs
(gen_random_uuid(), (SELECT id FROM melbourne), 'Fitzroy', '3065', 0.00, true),
(gen_random_uuid(), (SELECT id FROM melbourne), 'St Kilda', '3182', 4.00, true),
(gen_random_uuid(), (SELECT id FROM melbourne), 'Carlton', '3053', 2.00, true),

-- Brisbane suburbs
(gen_random_uuid(), (SELECT id FROM brisbane), 'Fortitude Valley', '4006', 0.00, true),
(gen_random_uuid(), (SELECT id FROM brisbane), 'New Farm', '4005', 3.00, true);

-- Note: Profiles, cleaners, cleaner_locations, availability_slots, and blog_posts 
-- are not seeded here as they require auth.users entries. These should be created 
-- through the Supabase Auth system or through the application interface.