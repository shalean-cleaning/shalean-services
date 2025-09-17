-- Add new fields to payments table for Paystack integration
-- Migration: 009_add_payment_fields.sql

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS amount_minor INTEGER,
ADD COLUMN IF NOT EXISTS reference TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS gateway TEXT DEFAULT 'paystack',
ADD COLUMN IF NOT EXISTS gateway_payload JSONB;

-- Add index on reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);

-- Add index on gateway for filtering
CREATE INDEX IF NOT EXISTS idx_payments_gateway ON payments(gateway);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Update existing payments to have amount_minor (convert from amount * 100)
UPDATE payments 
SET amount_minor = ROUND(amount * 100)::INTEGER 
WHERE amount_minor IS NULL;

-- Add comment explaining the new fields
COMMENT ON COLUMN payments.amount_minor IS 'Amount in minor units (cents) for precise payment processing';
COMMENT ON COLUMN payments.reference IS 'Unique payment reference from payment gateway (e.g., Paystack)';
COMMENT ON COLUMN payments.gateway IS 'Payment gateway used (e.g., paystack, stripe)';
COMMENT ON COLUMN payments.gateway_payload IS 'Raw response data from payment gateway for debugging and reconciliation';
