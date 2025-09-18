-- MIGRATION STEP 3: Seed Hero section content
-- Run this third in Supabase SQL Editor

-- Insert hero section content
INSERT INTO content_blocks (section_key, title, description, icon_name, order_index) VALUES
    ('hero', 'Reliable home cleaning, on your schedule', 'Book trusted local cleaners in minutes. 100% satisfaction guaranteed.', 'home', 1)
ON CONFLICT DO NOTHING;

-- Verify the insert
SELECT * FROM content_blocks WHERE section_key = 'hero';
