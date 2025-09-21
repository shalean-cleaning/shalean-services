import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
});

// Environment variables for client-side
const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

let envClient: z.infer<typeof ClientEnv>;

try {
  envClient = ClientEnv.parse(clientEnv);
} catch (error) {
  // In client-side, we can't use the logger, so we'll use console for now
  // eslint-disable-next-line no-console
  console.error('❌ Client environment validation failed:', error);
  // eslint-disable-next-line no-console
  console.error('Please check your environment variables and ensure all required values are set.');
  // eslint-disable-next-line no-console
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw error;
}

export { envClient };
