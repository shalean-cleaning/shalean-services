import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
});

// Build-time client environment schema (more lenient)
const BuildTimeClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
});

// Environment variables for client-side
const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

let envClient: z.infer<typeof ClientEnv>;

try {
  // Check if we're in build mode
  const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL === undefined;
  
  if (isBuildTime) {
    // Use lenient schema during build
    const buildEnv = BuildTimeClientEnv.parse(clientEnv);
    envClient = {
      NEXT_PUBLIC_SUPABASE_URL: buildEnv.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: buildEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-time-fallback',
      NEXT_PUBLIC_APP_URL: buildEnv.NEXT_PUBLIC_APP_URL,
    } as z.infer<typeof ClientEnv>;
  } else {
    // Use strict schema during runtime
    envClient = ClientEnv.parse(clientEnv);
  }
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
