-- MIGRATION STEP 5: Seed Why Choose Us section content
-- Run this fifth in Supabase SQL Editor

-- Insert Why Choose Us features
INSERT INTO content_blocks (section_key, title, description, icon_name, order_index) VALUES
    ('why-choose-us', 'Trusted Cleaners', 'Background-checked, well-reviewed cleaners.', 'shield-check', 1),
    ('why-choose-us', 'Affordable Prices', 'Clear rates. No surprises.', 'dollar-sign', 2),
    ('why-choose-us', 'Flexible Scheduling', 'Pick a time that works. We''ll handle the rest.', 'calendar', 3),
    ('why-choose-us', '100% Satisfaction Guarantee', 'We stand behind our work with a satisfaction guarantee.', 'heart', 4)
ON CONFLICT DO NOTHING;

-- Verify the inserts
SELECT * FROM content_blocks WHERE section_key = 'why-choose-us' ORDER BY order_index;
