#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), 'env.example');

// Check if .env.local already exists
if (fs.existsSync(envLocalPath)) {
  console.log('✅ .env.local already exists');
  process.exit(0);
}

// Read the example file
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found');
  process.exit(1);
}

const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

// Create .env.local with local development values
const envLocalContent = `# Shalean Services Local Development Environment
# This file is for local development only - never commit to version control

# =============================================================================
# REQUIRED - Supabase Configuration (Local Development)
# =============================================================================
# Local Supabase instance (start with: supabase start)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# =============================================================================
# REQUIRED - Application Configuration
# =============================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =============================================================================
# OPTIONAL - Email Service (for testing)
# =============================================================================
# Uncomment and add your Resend API key for email testing
# RESEND_API_KEY=your-resend-api-key-here

# =============================================================================
# OPTIONAL - Payment Integration (for testing)
# =============================================================================
# Uncomment and add your Paystack secret key for payment testing
# PAYSTACK_SECRET_KEY=your-paystack-secret-key-here
`;

try {
  fs.writeFileSync(envLocalPath, envLocalContent);
  console.log('✅ Created .env.local with local development configuration');
  console.log('📝 Next steps:');
  console.log('   1. Start Supabase: supabase start');
  console.log('   2. Start the app: npm run dev');
} catch (error) {
  console.error('❌ Failed to create .env.local:', error.message);
  process.exit(1);
}
