-- Migration: Create Content Blocks Table
-- Description: Generic content blocks for homepage sections

-- Create content_blocks table for dynamic homepage content
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT NOT NULL, -- 'hero', 'how-it-works', 'why-choose-us', etc.
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT, -- Lucide icon name
    order_index INTEGER DEFAULT 0,
    metadata JSONB, -- Additional data like CTA text, links, etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_content_blocks_section ON content_blocks(section_key);
CREATE INDEX idx_content_blocks_active ON content_blocks(is_active);
CREATE INDEX idx_content_blocks_order ON content_blocks(section_key, order_index);

-- Apply updated_at trigger
CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert homepage content blocks
INSERT INTO content_blocks (section_key, title, description, icon_name, order_index, metadata) VALUES
-- Hero section content
('hero', 'All the help your home needs.', 'Professional cleaning services, trusted housekeepers, and reliable home care solutions. From one-time cleans to full-time help, we''ve got you covered.', null, 0, '{"cta_primary": "Get a Free Quote", "cta_secondary": "Apply to Work", "cta_primary_link": "/quote", "cta_secondary_link": "/apply"}'),

-- How It Works section
('how-it-works', 'Getting your home in order has never been easier.', 'Three quick steps: choose a service, book online, and manage everything in one place.', null, 0, '{}'),
('how-it-works', 'Choose', 'Pick the service and extras you need.', 'check-circle', 1, '{}'),
('how-it-works', 'Book', 'Secure your date & time in minutes.', 'calendar', 2, '{}'),
('how-it-works', 'Manage', 'Track and reschedule from your dashboard.', 'settings', 3, '{}'),

-- Why Choose Us section
('why-choose-us', 'Why Choose Shalean Services?', 'We provide reliable, professional cleaning services with a focus on quality and customer satisfaction.', null, 0, '{}'),
('why-choose-us', 'Professional Cleaners', 'All our cleaners are vetted, insured, and trained to deliver exceptional results.', 'shield-check', 1, '{}'),
('why-choose-us', 'Flexible Scheduling', 'Book cleaning services that fit your schedule, from one-time cleans to regular maintenance.', 'calendar', 2, '{}'),
('why-choose-us', '100% Satisfaction', 'We guarantee your satisfaction with every cleaning service we provide.', 'heart', 3, '{}'),
('why-choose-us', 'Eco-Friendly Products', 'We use environmentally safe cleaning products that are safe for your family and pets.', 'leaf', 4, '{}'),
('why-choose-us', 'Transparent Pricing', 'No hidden fees. Get upfront pricing for all our cleaning services.', 'dollar-sign', 5, '{}'),
('why-choose-us', '24/7 Support', 'Our customer support team is available around the clock to help with any questions.', 'phone', 6, '{}');

-- Insert team members data
INSERT INTO profiles (id, email, first_name, last_name, role, avatar_url) VALUES
(gen_random_uuid(), 'sarah.johnson@shalean.com', 'Sarah', 'Johnson', 'ADMIN', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'),
(gen_random_uuid(), 'mike.chen@shalean.com', 'Mike', 'Chen', 'ADMIN', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'),
(gen_random_uuid(), 'emma.davis@shalean.com', 'Emma', 'Davis', 'ADMIN', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'),
(gen_random_uuid(), 'david.wilson@shalean.com', 'David', 'Wilson', 'ADMIN', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face');

-- Insert testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_role TEXT,
    author_image TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO testimonials (quote, author_name, author_role, author_image, rating, is_featured) VALUES
('Shalean Services transformed our home! The cleaners are professional, thorough, and trustworthy. I can finally relax knowing our home is in good hands.', 'Jennifer Martinez', 'Homeowner', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face', 5, true),
('Outstanding service! The team arrived on time, worked efficiently, and left our apartment spotless. Highly recommend for anyone looking for reliable cleaning services.', 'Robert Thompson', 'Apartment Owner', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', 5, true),
('As a busy professional, Shalean Services has been a lifesaver. They handle everything professionally and I never have to worry about the quality of their work.', 'Lisa Anderson', 'Business Owner', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', 5, true),
('The eco-friendly products they use give me peace of mind, especially with young children at home. Great service and environmentally conscious!', 'Mark Rodriguez', 'Father of Two', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', 5, true);

-- Apply updated_at trigger to testimonials
CREATE TRIGGER update_testimonials_updated_at 
    BEFORE UPDATE ON testimonials 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, is_published, published_at) VALUES
('10 Tips for Maintaining a Clean Home Between Professional Cleanings', 'maintaining-clean-home-tips', 'Keep your home spotless between professional cleaning visits with these expert tips and tricks.', 'Professional cleaning services are wonderful, but maintaining a clean home between visits is equally important...', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop', true, NOW() - INTERVAL '2 days'),
('The Benefits of Eco-Friendly Cleaning Products', 'eco-friendly-cleaning-benefits', 'Discover why eco-friendly cleaning products are better for your health, home, and the environment.', 'Traditional cleaning products often contain harsh chemicals that can be harmful to your family and pets...', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop', true, NOW() - INTERVAL '5 days'),
('How to Choose the Right Cleaning Service for Your Home', 'choosing-right-cleaning-service', 'Learn what to look for when selecting a professional cleaning service that meets your specific needs.', 'With so many cleaning services available, it can be overwhelming to choose the right one for your home...', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop', true, NOW() - INTERVAL '1 week');

