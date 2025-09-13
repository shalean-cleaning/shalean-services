-- Migration: Create Quotes Table
-- Description: Table to store quick quote requests from customers

-- Create quotes table
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    suburb_id UUID REFERENCES suburbs(id) ON DELETE CASCADE,
    bedrooms INTEGER DEFAULT 0,
    bathrooms DECIMAL(3,1) DEFAULT 0,
    frequency TEXT DEFAULT 'one-time',
    extras JSONB DEFAULT '[]'::JSONB,
    total_price DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'expired')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_quotes_email ON quotes(email);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quotes_service_id ON quotes(service_id);
CREATE INDEX idx_quotes_suburb_id ON quotes(suburb_id);

-- Add RLS policies
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Allow public to insert quotes
CREATE POLICY "Allow public to insert quotes" ON quotes
    FOR INSERT WITH CHECK (true);

-- Allow admins to view all quotes
CREATE POLICY "Allow admins to view all quotes" ON quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Allow admins to update quotes
CREATE POLICY "Allow admins to update quotes" ON quotes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'ADMIN'
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
