-- Migration: Add Missing Tables for PRD Compliance
-- Description: Add blog_posts table and fix content_blocks structure to match task requirements

-- 1. CREATE BLOG_POSTS TABLE (Required by PRD)
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image_url TEXT,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FIX CONTENT_BLOCKS TABLE STRUCTURE (Match task requirements)
-- Drop existing content_blocks table and recreate with correct structure
DROP TABLE IF EXISTS content_blocks CASCADE;

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

-- 3. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section_key, order_index);
CREATE INDEX IF NOT EXISTS idx_content_blocks_active ON content_blocks(is_active);

-- 4. ENABLE RLS ON NEW TABLES
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- Blog posts policies
CREATE POLICY "Anyone can read published blog posts" ON blog_posts
    FOR SELECT USING (is_published = true);

CREATE POLICY "Authors can read own blog posts" ON blog_posts
    FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Authors can update own blog posts" ON blog_posts
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can create own blog posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can manage all blog posts" ON blog_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Content blocks policies
CREATE POLICY "Anyone can read active content blocks" ON content_blocks
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage content blocks" ON content_blocks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- 6. SEED INITIAL CONTENT BLOCKS (Match task requirements)
INSERT INTO content_blocks (section_key, title, description, icon_name, order_index) VALUES
    -- Hero section
    ('hero', 'Reliable home cleaning, on your schedule', 'Book trusted local cleaners in minutes. 100% satisfaction guaranteed.', 'home', 1),
    
    -- How It Works section
    ('how-it-works', 'Choose your service', 'Select rooms & add-ons as you need.', 'check-circle', 1),
    ('how-it-works', 'Pick date & time', 'We''ll match you with an available pro.', 'calendar', 2),
    ('how-it-works', 'Relax & track', 'Get updates and manage bookings online.', 'settings', 3),
    
    -- Why Choose Us section
    ('why-choose-us', 'Trusted Cleaners', 'Background-checked, well-reviewed cleaners.', 'shield-check', 1),
    ('why-choose-us', 'Affordable Prices', 'Clear rates. No surprises.', 'dollar-sign', 2),
    ('why-choose-us', 'Flexible Scheduling', 'Pick a time that works. We''ll handle the rest.', 'calendar', 3),
    ('why-choose-us', '100% Satisfaction Guarantee', 'We stand behind our work with a satisfaction guarantee.', 'heart', 4)
ON CONFLICT DO NOTHING;

-- 7. SEED SAMPLE BLOG POSTS
INSERT INTO blog_posts (title, slug, excerpt, content, is_published, published_at) VALUES
    (
        'The ultimate deep-clean checklist',
        'deep-clean-checklist',
        'Everything you need for a thorough home deep clean.',
        'A comprehensive guide to deep cleaning your home...',
        true,
        NOW() - INTERVAL '7 days'
    ),
    (
        'Pet-friendly cleaning: what to know',
        'pet-friendly-cleaning',
        'Safe cleaning products and methods for pet owners.',
        'Keeping your home clean while keeping your pets safe...',
        true,
        NOW() - INTERVAL '14 days'
    ),
    (
        'Move-out day: a spotless plan',
        'move-out-cleaning-guide',
        'How to leave your rental in perfect condition.',
        'Step-by-step guide to move-out cleaning...',
        true,
        NOW() - INTERVAL '21 days'
    )
ON CONFLICT (slug) DO NOTHING;

-- 8. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE blog_posts IS 'Company blog content for homepage preview';
COMMENT ON TABLE content_blocks IS 'Dynamic homepage content blocks for Hero, How It Works, and Why Choose Us sections';
COMMENT ON COLUMN content_blocks.section_key IS 'Section identifier: hero, how-it-works, why-choose-us';
COMMENT ON COLUMN content_blocks.icon_name IS 'Lucide icon name for display';
COMMENT ON COLUMN content_blocks.order_index IS 'Display order within section';
