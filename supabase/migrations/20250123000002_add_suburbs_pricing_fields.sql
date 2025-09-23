-- Add missing pricing and status fields to suburbs table
-- This migration adds the fields that the API expects for suburbs

-- Add active column to suburbs table
ALTER TABLE IF EXISTS suburbs ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add delivery_fee column to suburbs table
ALTER TABLE IF EXISTS suburbs ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;

-- Add price_adjustment_pct column to suburbs table
ALTER TABLE IF EXISTS suburbs ADD COLUMN IF NOT EXISTS price_adjustment_pct DECIMAL(5,2) DEFAULT 0;

-- Set all existing suburbs as active
UPDATE suburbs SET active = true WHERE active IS NULL;

-- Set default delivery fees for existing suburbs
UPDATE suburbs SET delivery_fee = 0 WHERE delivery_fee IS NULL;

-- Set default price adjustment for existing suburbs
UPDATE suburbs SET price_adjustment_pct = 0 WHERE price_adjustment_pct IS NULL;
