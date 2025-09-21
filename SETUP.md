# Shalean Services Setup Guide

## Environment Variables Setup

The application requires environment variables to be configured. Follow these steps:

### 1. Create Environment Files

Create a `.env.local` file in the project root with the following content:

```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Start Supabase Local Development

```bash
supabase start
```

### 3. Start the Next.js Development Server

```bash
npm run dev
```

## Required Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase API URL (local: http://127.0.0.1:54321)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (for local development)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for local development)
- `NEXT_PUBLIC_APP_URL`: Application base URL

## Optional Environment Variables

- `PAYSTACK_SECRET_KEY`: For payment processing
- `RESEND_API_KEY`: For email notifications

## Local Development URLs

- **Application**: http://localhost:3001
- **Supabase Studio**: http://127.0.0.1:54323
- **Supabase API**: http://127.0.0.1:54321
- **Inbucket (Email Testing)**: http://127.0.0.1:54324

## Troubleshooting

If you encounter environment validation errors:

1. Ensure `.env.local` file exists in the project root
2. Verify all required environment variables are set
3. Restart the development server after making changes
4. Check that Supabase is running with `supabase status`
