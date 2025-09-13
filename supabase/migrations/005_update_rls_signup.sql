-- Migration: Update RLS Policies for Signup
-- Description: Ensure proper policies for user signup and profile creation

-- Allow profile creation during signup (this should already exist but let's ensure it)
DROP POLICY IF EXISTS "Allow profile creation on signup" ON profiles;
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to read public cleaner information (for booking purposes)
CREATE POLICY "Public can read cleaner profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cleaners 
      WHERE cleaners.profile_id = profiles.id 
      AND cleaners.is_available = true
    )
  );

-- Allow admins to create profiles for other users (for admin management)
CREATE POLICY "Admins can create profiles" ON profiles
  FOR INSERT WITH CHECK (is_admin());

-- Ensure the signup trigger function has proper permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
