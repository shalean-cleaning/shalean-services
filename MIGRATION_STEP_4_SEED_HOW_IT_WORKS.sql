-- MIGRATION STEP 4: Seed How It Works section content
-- Run this fourth in Supabase SQL Editor

-- Insert How It Works steps
INSERT INTO content_blocks (section_key, title, description, icon_name, order_index) VALUES
    ('how-it-works', 'Choose your service', 'Select rooms & add-ons as you need.', 'check-circle', 1),
    ('how-it-works', 'Pick date & time', 'We''ll match you with an available pro.', 'calendar', 2),
    ('how-it-works', 'Relax & track', 'Get updates and manage bookings online.', 'settings', 3)
ON CONFLICT DO NOTHING;

-- Verify the inserts
SELECT * FROM content_blocks WHERE section_key = 'how-it-works' ORDER BY order_index;
