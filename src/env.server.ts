import 'server-only';
import { z } from 'zod';

const ServerEnv = z.object({
  // server-only secrets
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required for server-side operations'),
  PAYSTACK_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),

  // needed on both sides but validated here, too
  NEXT_PUBLIC_APP_URL: z.string().min(1).default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
});

// Build-time environment schema (more lenient)
const BuildTimeEnv = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

// Lazy validation to prevent client-side evaluation
let _env: z.infer<typeof ServerEnv> | null = null;

export const env = new Proxy({} as z.infer<typeof ServerEnv>, {
  get(_target, prop) {
    if (!_env) {
      // Check if we're in build mode
      const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL === undefined;
      
      try {
        if (isBuildTime) {
          // Use lenient schema during build
          const buildEnv = BuildTimeEnv.parse({
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
            RESEND_API_KEY: process.env.RESEND_API_KEY,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          });
          
          // Convert to full schema with fallbacks
          _env = {
            SUPABASE_SERVICE_ROLE_KEY: buildEnv.SUPABASE_SERVICE_ROLE_KEY || 'build-time-fallback',
            PAYSTACK_SECRET_KEY: buildEnv.PAYSTACK_SECRET_KEY,
            RESEND_API_KEY: buildEnv.RESEND_API_KEY,
            NEXT_PUBLIC_APP_URL: buildEnv.NEXT_PUBLIC_APP_URL,
            NEXT_PUBLIC_SUPABASE_URL: buildEnv.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: buildEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'build-time-fallback',
          } as z.infer<typeof ServerEnv>;
        } else {
          // Use strict schema during runtime
          _env = ServerEnv.parse({
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
            PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
            RESEND_API_KEY: process.env.RESEND_API_KEY,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('❌ Environment validation failed:', error);
        // eslint-disable-next-line no-console
        console.error('Please check your environment variables and ensure all required values are set.');
        // eslint-disable-next-line no-console
        console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
      }
    }
    return _env[prop as keyof typeof _env];
  }
});
