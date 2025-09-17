-- Migration: Add Customer Detail Fields to Bookings
-- Description: Add address, postcode, bedrooms, bathrooms fields to bookings table
--              Add DRAFT status to booking_status enum
--              Add partial unique index for draft idempotency
--              All new fields are nullable to maintain backward compatibility

-- Add DRAFT status to booking_status enum
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'DRAFT';
ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'READY_FOR_PAYMENT';

-- Add new customer detail columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS postcode TEXT,
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms INTEGER;

-- Add CHECK constraints for data validation (safe for NULLs)
-- Note: We'll add these constraints without IF NOT EXISTS since PostgreSQL doesn't support it
DO $$
BEGIN
    -- Add bedrooms constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_bedrooms_positive'
    ) THEN
        ALTER TABLE bookings 
        ADD CONSTRAINT check_bedrooms_positive 
        CHECK (bedrooms IS NULL OR bedrooms >= 0);
    END IF;
    
    -- Add bathrooms constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_bathrooms_positive'
    ) THEN
        ALTER TABLE bookings 
        ADD CONSTRAINT check_bathrooms_positive 
        CHECK (bathrooms IS NULL OR bathrooms >= 0);
    END IF;
END $$;

-- Add partial unique index for draft idempotency
-- This ensures only one DRAFT booking per customer
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_draft_per_customer 
ON bookings (customer_id) 
WHERE status = 'DRAFT';

-- Add indexes for performance on new fields
CREATE INDEX IF NOT EXISTS idx_bookings_address ON bookings(address) WHERE address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_postcode ON bookings(postcode) WHERE postcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_bedrooms ON bookings(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_bathrooms ON bookings(bathrooms) WHERE bathrooms IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN bookings.address IS 'Customer address - required for finalization, optional for drafts';
COMMENT ON COLUMN bookings.postcode IS 'Customer postcode - required for finalization, optional for drafts';
COMMENT ON COLUMN bookings.bedrooms IS 'Number of bedrooms - required for finalization, optional for drafts';
COMMENT ON COLUMN bookings.bathrooms IS 'Number of bathrooms - required for finalization, optional for drafts';
COMMENT ON INDEX uniq_bookings_draft_per_customer IS 'Ensures only one DRAFT booking per customer for idempotency';
