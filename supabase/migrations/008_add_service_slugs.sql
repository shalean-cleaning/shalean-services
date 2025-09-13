-- Migration: Add slug field to services table
-- Description: Add slug field for URL-friendly service routing

-- Add slug column to services table
ALTER TABLE services ADD COLUMN slug TEXT;

-- Create a function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing services with slugs
UPDATE services SET slug = generate_slug(name) WHERE slug IS NULL;

-- Make slug unique and not null
ALTER TABLE services ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX idx_services_slug ON services(slug);

-- Add index for better performance
CREATE INDEX idx_services_slug_active ON services(slug, is_active);
