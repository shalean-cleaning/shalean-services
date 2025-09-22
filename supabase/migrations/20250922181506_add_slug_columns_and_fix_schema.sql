-- Add missing slug columns and fix schema inconsistencies
-- This migration adds slug columns to tables that need them and ensures consistency

-- Add slug columns if they don't exist
ALTER TABLE IF EXISTS service_categories ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS services ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS extras ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS regions ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE IF EXISTS suburbs ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add base_price_cents column to services table for consistency with seed_core.sql
ALTER TABLE IF EXISTS services ADD COLUMN IF NOT EXISTS base_price_cents INTEGER;

-- Add price_cents column to extras table for consistency with seed_core.sql
ALTER TABLE IF EXISTS extras ADD COLUMN IF NOT EXISTS price_cents INTEGER;

-- Create unique indexes for slug columns
CREATE UNIQUE INDEX IF NOT EXISTS service_categories_slug_key ON service_categories (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS services_slug_key ON services (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS extras_slug_key ON extras (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS regions_slug_key ON regions (slug) WHERE slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS suburbs_slug_key ON suburbs (slug) WHERE slug IS NOT NULL;

-- Populate slug columns with generated values based on names
UPDATE service_categories 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE services 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE extras 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE regions 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

UPDATE suburbs 
SET slug = lower(regexp_replace(name, '\s+', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- Populate base_price_cents from base_price (convert dollars to cents)
UPDATE services 
SET base_price_cents = (base_price * 100)::INTEGER
WHERE base_price_cents IS NULL AND base_price IS NOT NULL;

-- Populate price_cents from price (convert dollars to cents)
UPDATE extras 
SET price_cents = (price * 100)::INTEGER
WHERE price_cents IS NULL AND price IS NOT NULL;

-- Resolve any slug collisions by appending numbers
WITH duplicates AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM service_categories
  WHERE slug IS NOT NULL
)
UPDATE service_categories 
SET slug = service_categories.slug || '-' || duplicates.rn
FROM duplicates
WHERE service_categories.id = duplicates.id AND duplicates.rn > 1;

WITH duplicates AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM services
  WHERE slug IS NOT NULL
)
UPDATE services 
SET slug = services.slug || '-' || duplicates.rn
FROM duplicates
WHERE services.id = duplicates.id AND duplicates.rn > 1;

WITH duplicates AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM extras
  WHERE slug IS NOT NULL
)
UPDATE extras 
SET slug = extras.slug || '-' || duplicates.rn
FROM duplicates
WHERE extras.id = duplicates.id AND duplicates.rn > 1;

WITH duplicates AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM regions
  WHERE slug IS NOT NULL
)
UPDATE regions 
SET slug = regions.slug || '-' || duplicates.rn
FROM duplicates
WHERE regions.id = duplicates.id AND duplicates.rn > 1;

WITH duplicates AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY id) as rn
  FROM suburbs
  WHERE slug IS NOT NULL
)
UPDATE suburbs 
SET slug = suburbs.slug || '-' || duplicates.rn
FROM duplicates
WHERE suburbs.id = duplicates.id AND duplicates.rn > 1;
