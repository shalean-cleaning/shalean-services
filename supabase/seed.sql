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
INSERT INTO service_items (id, service_id, name, description, price, sort_order) VALUES
-- Standard House Cleaning items
(gen_random_uuid(), (SELECT id FROM standard_house), 'Kitchen Cleaning', 'Clean countertops, appliances, sink, and cabinets', 0.00, 1),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Bathroom Cleaning', 'Clean toilets, showers, sinks, and mirrors', 0.00, 2),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Bedroom Cleaning', 'Dust furniture, vacuum floors, make beds', 0.00, 3),
(gen_random_uuid(), (SELECT id FROM standard_house), 'Living Area Cleaning', 'Dust surfaces, vacuum/sweep floors, clean windows', 0.00, 4),

-- Deep Cleaning additional items
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Inside Appliances', 'Clean inside of oven, microwave, and refrigerator', 0.00, 5),
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Baseboards and Trim', 'Clean baseboards, door frames, and window sills', 0.00, 6),
(gen_random_uuid(), (SELECT id FROM move_in_out), 'Light Fixtures', 'Clean ceiling fans and light fixtures', 0.00, 7);

-- Insert extras
INSERT INTO extras (id, name, description, price, sort_order) VALUES
(gen_random_uuid(), 'Inside Refrigerator', 'Deep clean inside refrigerator including shelves and drawers', 25.00, 1),
(gen_random_uuid(), 'Inside Oven', 'Clean inside oven including racks and door', 30.00, 2),
(gen_random_uuid(), 'Laundry Service', 'Wash, dry, and fold one load of laundry', 20.00, 3),
(gen_random_uuid(), 'Garage Cleaning', 'Clean garage floor and organize items', 40.00, 4),
(gen_random_uuid(), 'Patio Cleaning', 'Clean outdoor patio furniture and surfaces', 35.00, 5),
(gen_random_uuid(), 'Pet Hair Removal', 'Extra attention to pet hair on furniture and floors', 15.00, 6),
(gen_random_uuid(), 'Window Cleaning', 'Clean interior windows and window sills', 20.00, 7),
(gen_random_uuid(), 'Cabinet Organization', 'Organize kitchen cabinets and pantry', 25.00, 8);

-- Insert frequency discounts
INSERT INTO frequency_discounts (id, name, frequency_weeks, discount_percentage, is_active) VALUES
(gen_random_uuid(), 'Weekly Discount', 1, 10.00, true),
(gen_random_uuid(), 'Bi-weekly Discount', 2, 5.00, true),
(gen_random_uuid(), 'Monthly Discount', 4, 15.00, true);

-- Insert regions
INSERT INTO regions (id, name, description, sort_order) VALUES
(gen_random_uuid(), 'Greater Sydney', 'Sydney metropolitan area and surrounding suburbs', 1),
(gen_random_uuid(), 'Melbourne Metro', 'Melbourne metropolitan area and surrounding suburbs', 2),
(gen_random_uuid(), 'Brisbane Metro', 'Brisbane metropolitan area and surrounding suburbs', 3),
(gen_random_uuid(), 'Perth Metro', 'Perth metropolitan area and surrounding suburbs', 4);

-- Insert suburbs using CTEs to reference region IDs
WITH regions AS (
  SELECT id, name FROM regions ORDER BY sort_order
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
INSERT INTO suburbs (id, region_id, name, postcode, sort_order) VALUES
-- Sydney suburbs
(gen_random_uuid(), (SELECT id FROM sydney), 'Bondi', '2026', 1),
(gen_random_uuid(), (SELECT id FROM sydney), 'Surry Hills', '2010', 2),
(gen_random_uuid(), (SELECT id FROM sydney), 'Paddington', '2021', 3),
(gen_random_uuid(), (SELECT id FROM sydney), 'Newtown', '2042', 4),
(gen_random_uuid(), (SELECT id FROM sydney), 'Manly', '2095', 5),

-- Melbourne suburbs
(gen_random_uuid(), (SELECT id FROM melbourne), 'Fitzroy', '3065', 6),
(gen_random_uuid(), (SELECT id FROM melbourne), 'St Kilda', '3182', 7),
(gen_random_uuid(), (SELECT id FROM melbourne), 'Carlton', '3053', 8),

-- Brisbane suburbs
(gen_random_uuid(), (SELECT id FROM brisbane), 'Fortitude Valley', '4006', 9),
(gen_random_uuid(), (SELECT id FROM brisbane), 'New Farm', '4005', 10);

-- Insert areas for some suburbs
WITH suburbs AS (
  SELECT id, name FROM suburbs ORDER BY name
)
INSERT INTO areas (id, suburb_id, name, description, sort_order) VALUES
(gen_random_uuid(), (SELECT id FROM suburbs WHERE name = 'Bondi'), 'Bondi Beach', 'Beachside area of Bondi', 1),
(gen_random_uuid(), (SELECT id FROM suburbs WHERE name = 'Surry Hills'), 'Surry Hills Central', 'Central Surry Hills area', 2),
(gen_random_uuid(), (SELECT id FROM suburbs WHERE name = 'Fitzroy'), 'Fitzroy North', 'Northern part of Fitzroy', 3);

-- Note: Profiles, cleaners, cleaner_locations, availability_slots, and blog_posts 
-- are not seeded here as they require auth.users entries. These should be created 
-- through the Supabase Auth system or through the application interface.