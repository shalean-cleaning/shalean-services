import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
});

// Environment variables for client-side
try {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  };

  export const envClient = ClientEnv.parse(clientEnv);
} catch (error) {
  console.error('❌ Client environment validation failed:', error);
  console.error('Please check your environment variables and ensure all required values are set.');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw error;
}
