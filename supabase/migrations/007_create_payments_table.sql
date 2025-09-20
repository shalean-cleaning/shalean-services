-- Migration: Create Payments Table for Paystack Integration
-- Description: Create the payments table to track Paystack payment transactions

-- 1. CREATE PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reference TEXT UNIQUE NOT NULL, -- Paystack transaction reference
    amount_minor INTEGER NOT NULL, -- Amount in minor units (cents)
    currency TEXT NOT NULL DEFAULT 'ZAR',
    status TEXT NOT NULL DEFAULT 'INITIALIZED', -- INITIALIZED, PAID, FAILED, CANCELLED
    payment_method TEXT NOT NULL DEFAULT 'paystack',
    transaction_id TEXT, -- Paystack transaction ID
    gateway_payload JSONB, -- Store Paystack response data
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- 3. ENABLE RLS ON PAYMENTS TABLE
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. CREATE RLS POLICIES FOR PAYMENTS
-- Customers can read their own payment records
CREATE POLICY "Customers can read own payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = payments.booking_id 
            AND bookings.customer_id = auth.uid()
        )
    );

-- Admins can read all payment records
CREATE POLICY "Admins can read all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Service role can manage all payment records (for server actions)
CREATE POLICY "Service role can manage payments" ON payments
    FOR ALL USING (auth.role() = 'service_role');

-- 5. ADD COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE payments IS 'Payment transaction records for Paystack integration';
COMMENT ON COLUMN payments.reference IS 'Unique Paystack transaction reference';
COMMENT ON COLUMN payments.amount_minor IS 'Payment amount in minor units (cents)';
COMMENT ON COLUMN payments.status IS 'Payment status: INITIALIZED, PAID, FAILED, CANCELLED';
COMMENT ON COLUMN payments.gateway_payload IS 'JSON data from Paystack API responses';
COMMENT ON COLUMN payments.transaction_id IS 'Paystack transaction ID after successful payment';
