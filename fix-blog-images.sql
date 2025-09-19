-- Fix blog post featured images to use existing placeholder images
-- This resolves 400 errors for missing blog images

UPDATE blog_posts 
SET featured_image = '/images/placeholder-card.svg'
WHERE featured_image IS NULL 
   OR featured_image = '' 
   OR featured_image NOT LIKE '/images/placeholder%'
   OR featured_image LIKE '/images/blog/%';

-- Verify the update
SELECT id, title, slug, featured_image 
FROM blog_posts 
ORDER BY published_at DESC;
