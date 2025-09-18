-- MIGRATION STEP 2: Fix content_blocks table structure
-- Run this second in Supabase SQL Editor

-- Drop existing content_blocks table and recreate with correct structure
DROP TABLE IF EXISTS content_blocks CASCADE;

-- Create content_blocks table with proper structure (matching task requirements)
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL, -- 'hero', 'how-it-works', 'why-choose-us', etc.
    title TEXT,
    description TEXT,
    icon_name TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section_key, order_index);
CREATE INDEX IF NOT EXISTS idx_content_blocks_active ON content_blocks(is_active);

-- Enable RLS
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read active content blocks" ON content_blocks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage content blocks" ON content_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Add comment for documentation
COMMENT ON TABLE content_blocks IS 'Dynamic homepage content blocks for Hero, How It Works, and Why Choose Us sections';
COMMENT ON COLUMN content_blocks.section_key IS 'Section identifier: hero, how-it-works, why-choose-us';
COMMENT ON COLUMN content_blocks.icon_name IS 'Lucide icon name for display';
COMMENT ON COLUMN content_blocks.order_index IS 'Display order within section';
