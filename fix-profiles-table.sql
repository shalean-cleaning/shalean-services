-- Fix Profiles Table and Signup Trigger
-- This script creates the missing profiles table and signup trigger

-- 1. Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CUSTOMER', 'CLEANER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        full_name,
        role
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(
            TRIM(CONCAT(
                COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
                ' ',
                COALESCE(NEW.raw_user_meta_data->>'last_name', '')
            )),
            NEW.email
        ),
        'CUSTOMER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

-- 8. Add comments for documentation
COMMENT ON TABLE profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON COLUMN profiles.full_name IS 'Computed full name from first_name and last_name';
COMMENT ON COLUMN profiles.role IS 'User role: CUSTOMER, CLEANER, or ADMIN';