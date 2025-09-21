-- Migration: Make Draft Creation Reliable
-- Description: Allow minimal draft creation with proper constraints and guest user support
-- This migration enables reliable draft creation with only customer_id OR session_id

-- 1. ADD SESSION_ID FIELD FOR GUEST USERS
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_id TEXT;

-- 2. ADD MISSING COLUMNS IF THEY DON'T EXIST
-- These columns may have been dropped in previous migrations
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_date DATE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS end_time TIME;

-- 3. MAKE FIELDS NULLABLE FOR DRAFT STATUS
-- These fields can be null when status = 'DRAFT' but required for other statuses
ALTER TABLE bookings ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN area_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN service_id DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN booking_date DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN start_time DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN end_time DROP NOT NULL;
ALTER TABLE bookings ALTER COLUMN total_price DROP NOT NULL;

-- 4. ADD CONDITIONAL CONSTRAINTS
-- Ensure that for non-DRAFT statuses, required fields are not null
ALTER TABLE bookings ADD CONSTRAINT check_customer_id_when_not_draft 
    CHECK (status = 'DRAFT' OR customer_id IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_area_id_when_not_draft 
    CHECK (status = 'DRAFT' OR area_id IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_service_id_when_not_draft 
    CHECK (status = 'DRAFT' OR service_id IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_booking_date_when_not_draft 
    CHECK (status = 'DRAFT' OR booking_date IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_start_time_when_not_draft 
    CHECK (status = 'DRAFT' OR start_time IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_end_time_when_not_draft 
    CHECK (status = 'DRAFT' OR end_time IS NOT NULL);

ALTER TABLE bookings ADD CONSTRAINT check_total_price_when_not_draft 
    CHECK (status = 'DRAFT' OR total_price IS NOT NULL);

-- 5. ENSURE EITHER CUSTOMER_ID OR SESSION_ID IS PROVIDED
ALTER TABLE bookings ADD CONSTRAINT check_customer_or_session 
    CHECK (customer_id IS NOT NULL OR session_id IS NOT NULL);

-- 6. CREATE UNIQUE INDEX FOR ONE DRAFT PER CUSTOMER/SESSION
-- This prevents duplicate drafts for the same user/session
CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_draft_per_customer 
    ON bookings (customer_id) 
    WHERE status = 'DRAFT' AND customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_bookings_draft_per_session 
    ON bookings (session_id) 
    WHERE status = 'DRAFT' AND session_id IS NOT NULL;

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(session_id);

-- 8. UPDATE EXISTING DRAFT BOOKINGS
-- Set default values for existing drafts that might have null values
UPDATE bookings 
SET 
    total_price = COALESCE(total_price, 0),
    booking_date = COALESCE(booking_date, CURRENT_DATE),
    start_time = COALESCE(start_time, '09:00'),
    end_time = COALESCE(end_time, '11:00')
WHERE status = 'DRAFT' 
AND (total_price IS NULL OR booking_date IS NULL OR start_time IS NULL OR end_time IS NULL);

-- 9. ADD HELPER FUNCTION TO VALIDATE DRAFT COMPLETENESS
CREATE OR REPLACE FUNCTION is_draft_complete(booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    booking_record RECORD;
BEGIN
    SELECT * INTO booking_record FROM bookings WHERE id = booking_id;
    
    -- Check if all required fields are present
    RETURN (
        booking_record.customer_id IS NOT NULL AND
        booking_record.area_id IS NOT NULL AND
        booking_record.service_id IS NOT NULL AND
        booking_record.booking_date IS NOT NULL AND
        booking_record.start_time IS NOT NULL AND
        booking_record.end_time IS NOT NULL AND
        booking_record.total_price IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql;

-- 10. ADD TRIGGER TO VALIDATE DRAFT TRANSITIONS
CREATE OR REPLACE FUNCTION validate_draft_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- If transitioning from DRAFT to non-DRAFT, ensure all required fields are present
    IF OLD.status = 'DRAFT' AND NEW.status != 'DRAFT' THEN
        IF NOT is_draft_complete(NEW.id) THEN
            RAISE EXCEPTION 'Cannot transition from DRAFT to %: missing required fields', NEW.status;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_draft_transition
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_draft_transition();

-- 11. UPDATE RLS POLICIES TO HANDLE GUEST USERS
-- Drop existing policies that don't handle session_id
DROP POLICY IF EXISTS "Customers can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own pending bookings" ON bookings;

-- Create new policies that handle both authenticated and guest users
CREATE POLICY "Users can read own bookings" ON bookings
    FOR SELECT USING (
        -- Authenticated users can read their own bookings
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id) OR
        -- Guest users can read bookings with their session_id
        (auth.uid() IS NULL AND session_id IS NOT NULL AND 
         session_id = current_setting('request.jwt.claims', true)::json->>'session_id') OR
        -- Admins can read all bookings
        is_admin()
    );

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (
        -- Authenticated users can create bookings for themselves
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id) OR
        -- Guest users can create bookings with their session_id
        (auth.uid() IS NULL AND session_id IS NOT NULL AND 
         session_id = current_setting('request.jwt.claims', true)::json->>'session_id') OR
        -- Admins can create any booking
        is_admin()
    );

CREATE POLICY "Users can update own draft bookings" ON bookings
    FOR UPDATE USING (
        -- Authenticated users can update their own draft/pending bookings
        (auth.uid() IS NOT NULL AND auth.uid() = customer_id AND 
         status IN ('DRAFT', 'PENDING', 'READY_FOR_PAYMENT')) OR
        -- Guest users can update their own draft bookings
        (auth.uid() IS NULL AND session_id IS NOT NULL AND 
         session_id = current_setting('request.jwt.claims', true)::json->>'session_id' AND
         status = 'DRAFT') OR
        -- Admins can update any booking
        is_admin()
    );

-- 12. ADD HELPER FUNCTION FOR SESSION ID MANAGEMENT
CREATE OR REPLACE FUNCTION generate_session_id()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 13. ADD FUNCTION TO TRANSFER GUEST BOOKING TO AUTHENTICATED USER
CREATE OR REPLACE FUNCTION transfer_guest_booking_to_user(
    p_session_id TEXT,
    p_customer_id UUID
)
RETURNS UUID AS $$
DECLARE
    booking_id UUID;
BEGIN
    -- Find the guest booking
    SELECT id INTO booking_id 
    FROM bookings 
    WHERE session_id = p_session_id 
    AND status = 'DRAFT' 
    AND customer_id IS NULL;
    
    IF booking_id IS NULL THEN
        RAISE EXCEPTION 'No draft booking found for session_id: %', p_session_id;
    END IF;
    
    -- Check if user already has a draft
    IF EXISTS (SELECT 1 FROM bookings WHERE customer_id = p_customer_id AND status = 'DRAFT') THEN
        RAISE EXCEPTION 'User already has a draft booking';
    END IF;
    
    -- Transfer the booking
    UPDATE bookings 
    SET 
        customer_id = p_customer_id,
        session_id = NULL,
        updated_at = NOW()
    WHERE id = booking_id;
    
    RETURN booking_id;
END;
$$ LANGUAGE plpgsql;
