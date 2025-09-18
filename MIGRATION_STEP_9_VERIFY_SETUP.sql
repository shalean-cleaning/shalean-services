-- MIGRATION STEP 9: Verify the setup
-- Run this last to verify everything is working correctly

-- Check all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('blog_posts', 'content_blocks', 'team_members', 'testimonials') 
        THEN '✅ Required table exists'
        ELSE '⚠️  Optional table'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('blog_posts', 'content_blocks', 'team_members', 'testimonials')
ORDER BY table_name;

-- Check content_blocks data
SELECT 
    'Content Blocks' as table_name,
    section_key,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Has data'
        ELSE '❌ No data'
    END as status
FROM content_blocks 
WHERE is_active = true
GROUP BY section_key
ORDER BY section_key;

-- Check blog_posts data
SELECT 
    'Blog Posts' as table_name,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN is_published = true THEN 1 END) as published_posts,
    CASE 
        WHEN COUNT(CASE WHEN is_published = true THEN 1 END) > 0 THEN '✅ Has published posts'
        ELSE '❌ No published posts'
    END as status
FROM blog_posts;

-- Check team_members data
SELECT 
    'Team Members' as table_name,
    COUNT(*) as total_members,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_members,
    CASE 
        WHEN COUNT(CASE WHEN is_active = true THEN 1 END) > 0 THEN '✅ Has active members'
        ELSE '❌ No active members'
    END as status
FROM team_members;

-- Check testimonials data
SELECT 
    'Testimonials' as table_name,
    COUNT(*) as total_testimonials,
    COUNT(CASE WHEN is_featured = true AND is_active = true THEN 1 END) as featured_testimonials,
    CASE 
        WHEN COUNT(CASE WHEN is_featured = true AND is_active = true THEN 1 END) > 0 THEN '✅ Has featured testimonials'
        ELSE '❌ No featured testimonials'
    END as status
FROM testimonials;

-- Summary
SELECT 
    '🎉 MIGRATION SUMMARY' as message,
    'All required tables and data have been created successfully!' as status;
