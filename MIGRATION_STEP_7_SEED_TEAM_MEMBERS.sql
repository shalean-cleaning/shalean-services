-- MIGRATION STEP 7: Seed team members (if team_members table exists)
-- Run this seventh in Supabase SQL Editor

-- Check if team_members table exists, if not create it
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

-- Enable RLS if not already enabled
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policy if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'team_members' 
        AND policyname = 'Anyone can read active team members'
    ) THEN
        CREATE POLICY "Anyone can read active team members" ON team_members
            FOR SELECT USING (is_active = true);
    END IF;
END $$;

-- Insert sample team members
INSERT INTO team_members (name, role, bio, sort_order) VALUES
    (
        'Ayanda M.',
        'Professional Cleaner',
        'Friendly, punctual, and thorough. Ayanda has been cleaning homes for over 3 years and takes pride in delivering exceptional service.',
        1
    ),
    (
        'Sarah K.',
        'Professional Cleaner',
        'Detail-oriented and reliable. Sarah specializes in deep cleaning and has a keen eye for detail that ensures every corner is spotless.',
        2
    ),
    (
        'Thabo N.',
        'Professional Cleaner',
        'Professional and efficient. Thabo brings years of experience and a systematic approach to every cleaning job.',
        3
    ),
    (
        'Lisa P.',
        'Professional Cleaner',
        'Experienced and trustworthy. Lisa has been with Shalean for over 2 years and has built a loyal customer base.',
        4
    )
ON CONFLICT DO NOTHING;

-- Verify the inserts
SELECT * FROM team_members ORDER BY sort_order;
