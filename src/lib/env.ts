import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL").optional(),
});

const serverEnvSchema = z.object({
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email("RESEND_FROM_EMAIL must be a valid email").optional(),
  RESEND_FROM_NAME: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required for admin operations"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL").optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url("NEXT_PUBLIC_BASE_URL must be a valid URL").optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Safe environment variable getter for client-side variables
 * Throws descriptive errors if required variables are missing
 */
export function getClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Missing or invalid client environment variables:\n${missingVars}\n\nPlease check your .env.local file and ensure all required variables are set.`);
    }
    throw error;
  }
}

/**
 * Safe environment variable getter for server-side variables
 * Throws descriptive errors if required variables are missing
 */
export function getServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse({
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`Missing or invalid server environment variables:\n${missingVars}\n\nPlease check your .env.local file and ensure all required variables are set.`);
    }
    throw error;
  }
}

// Legacy exports for backward compatibility
export const clientEnv: ClientEnv = getClientEnv();
export const serverEnv: ServerEnv = getServerEnv();


