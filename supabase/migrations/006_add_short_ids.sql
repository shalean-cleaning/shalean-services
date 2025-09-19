-- Migration: Add Short IDs for Opaque URLs
-- Description: Add short_id fields to quotes and bookings tables for PRD-compliant opaque URLs

-- 1. Add short_id to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- 2. Add short_id to bookings table  
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- 3. Create indexes for short_id lookups
CREATE INDEX IF NOT EXISTS idx_quotes_short_id ON quotes(short_id);
CREATE INDEX IF NOT EXISTS idx_bookings_short_id ON bookings(short_id);

-- 4. Function to generate and assign short_id
CREATE OR REPLACE FUNCTION assign_short_id(table_name TEXT, record_id UUID)
RETURNS TEXT AS $$
DECLARE
    short_id TEXT;
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    i INTEGER;
    exists_count INTEGER;
BEGIN
    -- Generate 8-character short ID
    short_id := '';
    FOR i IN 1..8 LOOP
        short_id := short_id || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if it already exists in the table
    IF table_name = 'quotes' THEN
        SELECT COUNT(*) INTO exists_count FROM quotes WHERE quotes.short_id = short_id;
    ELSIF table_name = 'bookings' THEN
        SELECT COUNT(*) INTO exists_count FROM bookings WHERE bookings.short_id = short_id;
    END IF;
    
    -- If exists, generate a new one (recursive call)
    IF exists_count > 0 THEN
        RETURN assign_short_id(table_name, record_id);
    END IF;
    
    -- Update the record with the short_id
    IF table_name = 'quotes' THEN
        UPDATE quotes SET short_id = short_id WHERE id = record_id;
    ELSIF table_name = 'bookings' THEN
        UPDATE bookings SET short_id = short_id WHERE id = record_id;
    END IF;
    
    RETURN short_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger function to auto-assign short_id on insert
CREATE OR REPLACE FUNCTION trigger_assign_short_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_id IS NULL THEN
        NEW.short_id := assign_short_id(TG_TABLE_NAME, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers
DROP TRIGGER IF EXISTS trigger_quotes_short_id ON quotes;
CREATE TRIGGER trigger_quotes_short_id
    BEFORE INSERT ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_assign_short_id();

DROP TRIGGER IF EXISTS trigger_bookings_short_id ON bookings;
CREATE TRIGGER trigger_bookings_short_id
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_assign_short_id();

-- 7. Assign short_ids to existing records
UPDATE quotes SET short_id = assign_short_id('quotes', id) WHERE short_id IS NULL;
UPDATE bookings SET short_id = assign_short_id('bookings', id) WHERE short_id IS NULL;
