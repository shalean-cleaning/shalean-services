-- MIGRATION STEP 6: Seed sample blog posts
-- Run this sixth in Supabase SQL Editor

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, is_published, published_at) VALUES
    (
        'The ultimate deep-clean checklist',
        'deep-clean-checklist',
        'Everything you need for a thorough home deep clean.',
        'A comprehensive guide to deep cleaning your home. Learn the essential steps, tools, and techniques to achieve a spotless, healthy living environment.',
        true,
        NOW() - INTERVAL '7 days'
    ),
    (
        'Pet-friendly cleaning: what to know',
        'pet-friendly-cleaning',
        'Safe cleaning products and methods for pet owners.',
        'Keep your home clean while keeping your pets safe. Discover pet-friendly cleaning products and methods that protect your furry family members.',
        true,
        NOW() - INTERVAL '14 days'
    ),
    (
        'Move-out day: a spotless plan',
        'move-out-cleaning-guide',
        'How to leave your rental in perfect condition.',
        'Step-by-step guide to move-out cleaning. Ensure you get your security deposit back with our comprehensive cleaning checklist.',
        true,
        NOW() - INTERVAL '21 days'
    )
ON CONFLICT (slug) DO NOTHING;

-- Verify the inserts
SELECT id, title, slug, is_published, published_at FROM blog_posts ORDER BY published_at DESC;
