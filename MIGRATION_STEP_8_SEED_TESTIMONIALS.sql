-- MIGRATION STEP 8: Seed testimonials (if testimonials table exists)
-- Run this eighth in Supabase SQL Editor

-- Check if testimonials table exists, if not create it
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

-- Enable RLS if not already enabled
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create RLS policy if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'testimonials' 
        AND policyname = 'Anyone can read active testimonials'
    ) THEN
        CREATE POLICY "Anyone can read active testimonials" ON testimonials
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, customer_location, rating, comment, is_featured) VALUES
    (
        'Sarah Johnson',
        'Cape Town',
        5,
        'Excellent service! The cleaner was professional and thorough. My home has never looked better. Will definitely book again.',
        true
    ),
    (
        'Mike Chen',
        'Sea Point',
        5,
        'Great value for money. The team was punctual, friendly, and did an amazing job. Highly recommended!',
        true
    ),
    (
        'Lisa Williams',
        'Claremont',
        4,
        'Very satisfied with the cleaning quality. The cleaner was respectful and left everything spotless.',
        true
    ),
    (
        'David Brown',
        'Constantia',
        5,
        'Reliable and trustworthy service. They''ve been cleaning my home for months and I''m always impressed with the results.',
        true
    ),
    (
        'Emma Davis',
        'Rondebosch',
        5,
        'Outstanding service! The cleaner went above and beyond. My home feels fresh and clean.',
        false
    )
ON CONFLICT DO NOTHING;

-- Verify the inserts
SELECT * FROM testimonials WHERE is_featured = true ORDER BY created_at DESC;
