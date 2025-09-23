-- Add active columns to services and extras tables for backward compatibility
-- This migration ensures the API can work with both old and new schema

-- Add active column to services table if it doesn't exist
ALTER TABLE IF EXISTS services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add active column to extras table if it doesn't exist  
ALTER TABLE IF EXISTS extras ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Add base_fee column to services table for backward compatibility
ALTER TABLE IF EXISTS services ADD COLUMN IF NOT EXISTS base_fee DECIMAL(10,2);

-- Add price column to extras table for backward compatibility
ALTER TABLE IF EXISTS extras ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Populate base_fee from base_price_cents for existing records
UPDATE services 
SET base_fee = base_price_cents / 100.0
WHERE base_fee IS NULL AND base_price_cents IS NOT NULL;

-- Populate price from price_cents for existing records
UPDATE extras 
SET price = price_cents / 100.0
WHERE price IS NULL AND price_cents IS NOT NULL;

-- Set all existing services and extras as active
UPDATE services SET active = true WHERE active IS NULL;
UPDATE extras SET active = true WHERE active IS NULL;
