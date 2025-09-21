#!/usr/bin/env node

/**
 * Reset Migrations Script
 * 
 * This script deletes all migrations and starts fresh
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Resetting Migrations...\n');

// 1. Backup current migrations directory
console.log('1. Backing up current migrations...');
const migrationsDir = 'supabase/migrations';
const backupDir = 'supabase/migrations_backup';

if (fs.existsSync(migrationsDir)) {
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  fs.renameSync(migrationsDir, backupDir);
  console.log('✅ Migrations backed up to supabase/migrations_backup');
}

// 2. Create fresh migrations directory
console.log('\n2. Creating fresh migrations directory...');
fs.mkdirSync(migrationsDir, { recursive: true });
console.log('✅ Fresh migrations directory created');

// 3. Create initial schema migration
console.log('\n3. Creating initial schema migration...');
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
const initialMigrationName = `${timestamp}_initial_schema.sql`;
const initialMigrationPath = `supabase/migrations/${initialMigrationName}`;

const initialSchema = `-- Initial Schema Migration
-- This migration creates the complete database schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'CUSTOMER' CHECK (role IN ('CUSTOMER', 'CLEANER', 'ADMIN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suburbs table
CREATE TABLE IF NOT EXISTS suburbs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    postcode TEXT NOT NULL,
    region_id UUID REFERENCES regions(id),
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_adjustment_pct DECIMAL(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    base_fee DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cleaners table
CREATE TABLE IF NOT EXISTS cleaners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    contact_info TEXT,
    bio TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES profiles(id),
    session_id TEXT,
    cleaner_id UUID REFERENCES cleaners(id),
    area_id UUID REFERENCES suburbs(id),
    service_id UUID REFERENCES services(id),
    service_slug TEXT,
    region_id UUID REFERENCES regions(id),
    booking_date DATE,
    start_time TIME,
    end_time TIME,
    start_ts TIMESTAMP WITH TIME ZONE,
    end_ts TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'READY_FOR_PAYMENT')),
    total_price DECIMAL(10,2),
    notes TEXT,
    special_instructions TEXT,
    auto_assign BOOLEAN DEFAULT true,
    address TEXT,
    postcode TEXT,
    bedrooms INTEGER,
    bathrooms INTEGER,
    paystack_ref TEXT,
    paystack_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_id ON bookings(session_id);
CREATE INDEX IF NOT EXISTS idx_bookings_cleaner_id ON bookings(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_suburbs_region_id ON suburbs(region_id);
CREATE INDEX IF NOT EXISTS idx_cleaners_active ON cleaners(active);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suburbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for regions (public read)
CREATE POLICY "Anyone can view regions" ON regions FOR SELECT USING (active = true);

-- Create RLS policies for suburbs (public read)
CREATE POLICY "Anyone can view suburbs" ON suburbs FOR SELECT USING (active = true);

-- Create RLS policies for services (public read)
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (active = true);

-- Create RLS policies for cleaners (public read)
CREATE POLICY "Anyone can view cleaners" ON cleaners FOR SELECT USING (active = true);

-- Create RLS policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
    auth.uid() = customer_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

CREATE POLICY "Users can create own bookings" ON bookings FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (
    auth.uid() = customer_id OR 
    session_id = current_setting('request.jwt.claims', true)::json->>'session_id'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

fs.writeFileSync(initialMigrationPath, initialSchema);
console.log(`✅ Initial schema migration created: ${initialMigrationName}`);

// 4. Create seed data migration
console.log('\n4. Creating seed data migration...');
const seedTimestamp = new Date(Date.now() + 1000).toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
const seedMigrationName = `${seedTimestamp}_seed_data.sql`;
const seedMigrationPath = `supabase/migrations/${seedMigrationName}`;

const seedData = `-- Seed Data Migration
-- This migration populates the database with initial data

-- Insert regions
INSERT INTO regions (id, name, state, active) VALUES
    ('c485a7b7-8572-42cd-bc2a-1d79a4bf44a7', 'Sydney', 'NSW', true),
    ('d596b8c8-9683-53de-bc3b-2e80b5cf55b8', 'Melbourne', 'VIC', true),
    ('e607c9d9-a794-64ef-cd4c-3f91c6dg66c9', 'Brisbane', 'QLD', true)
ON CONFLICT (id) DO NOTHING;

-- Insert suburbs
INSERT INTO suburbs (id, name, slug, postcode, region_id, delivery_fee, price_adjustment_pct, active) VALUES
    ('4cccc60f-0e49-4a37-a3c9-764549070b9a', 'Sydney CBD', 'sydney-cbd', '2000', 'c485a7b7-8572-42cd-bc2a-1d79a4bf44a7', 15.00, 0.00, true),
    ('5dddd70g-1f5a-5b48-b4da-87565a181c0b', 'Bondi', 'bondi', '2026', 'c485a7b7-8572-42cd-bc2a-1d79a4bf44a7', 20.00, 5.00, true),
    ('6eeee81h-2g6b-6c59-c5eb-98676b292d1c', 'Melbourne CBD', 'melbourne-cbd', '3000', 'd596b8c8-9683-53de-bc3b-2e80b5cf55b8', 12.00, 0.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert services
INSERT INTO services (id, name, slug, description, base_fee, active) VALUES
    ('7ffff92i-3h7c-7d6a-d6fc-a9787c3a3e2d', 'Standard Clean', 'standard-clean', 'Regular house cleaning service', 120.00, true),
    ('8gggg03j-4i8d-8e7b-e7gd-ba898d4b4f3e', 'Deep Clean', 'deep-clean', 'Thorough deep cleaning service', 200.00, true),
    ('9hhhh14k-5j9e-9f8c-f8he-cb9a9e5c5g4f', 'Move In/Out Clean', 'move-clean', 'Cleaning for moving in or out', 250.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert cleaners
INSERT INTO cleaners (id, name, contact_info, bio, active) VALUES
    ('1aaaa25l-6k0f-0g9d-g9if-dc0b0f6d6h5g', 'Sarah Johnson', 'sarah@example.com', 'Experienced cleaner with 5+ years in residential cleaning', true),
    ('2bbbb36m-7l1g-1h0e-h0jg-ed1c1g7e7i6h', 'Mike Chen', 'mike@example.com', 'Professional cleaner specializing in deep cleaning', true),
    ('3cccc47n-8m2h-2i1f-i1kh-fe2d2h8f8j7i', 'Emma Wilson', 'emma@example.com', 'Reliable cleaner with excellent customer reviews', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample admin profile
INSERT INTO profiles (id, first_name, last_name, email, role) VALUES
    ('4dddd58o-9n3i-3j2g-j2li-gf3e3i9g9k8j', 'Admin', 'User', 'admin@shalean.com', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
`;

fs.writeFileSync(seedMigrationPath, seedData);
console.log(`✅ Seed data migration created: ${seedMigrationName}`);

console.log('\n🎉 Migration reset complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npx supabase db push');
console.log('2. Restart your dev server: npm run dev');
console.log('3. Test the APIs again');
console.log('\n✨ Fresh start with clean migrations!');
console.log('\n📁 Your old migrations are backed up in: supabase/migrations_backup');
