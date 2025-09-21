import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
});

// Environment variables for client-side
const fallbackEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcmndztkikfwnxbfqctn.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbW5kenRraWtmd254YmZxY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDcyNTksImV4cCI6MjA3MzI4MzI1OX0.9HQwytJGisUPT_gwb4TyU9rDe76TBA5iw1QOxlgWON0',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

export const envClient = ClientEnv.parse(fallbackEnv);
