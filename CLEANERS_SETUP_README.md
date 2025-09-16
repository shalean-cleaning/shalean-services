# Cleaners Setup Implementation

This implementation provides a robust cleaners setup that ensures the "Choose Cleaner" step always works by:

1. **Ensuring the schema exists** - Idempotent migration that safely creates/updates tables
2. **Seeding realistic data** - 5 sample cleaners with proper relationships
3. **Providing an RPC with graceful fallback** - `available_cleaners` function with fallback logic
4. **Avoiding enum/type errors** - Safe status comparisons and flexible area matching

## Files Created/Modified

### 1. Migration File
- `supabase/migrations/20250916_cleaners_setup.sql` - Complete database setup

### 2. Server Helper
- `src/server/cleaners.ts` - Server-side function to fetch available cleaners

### 3. Updated API Routes
- `src/app/api/cleaners/availability/route.ts` - Updated to use new RPC
- `src/app/api/cleaners/available/route.ts` - Updated to use new RPC

### 4. Test Files
- `src/app/api/cleaners/availability/__tests__/route.test.ts` - Updated tests
- `scripts/test-cleaners-setup.js` - Manual test script

## How to Apply

### Option 1: Supabase SQL Editor
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250916_cleaners_setup.sql`
4. Run the migration

### Option 2: Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

### Option 3: Manual Application
Run the SQL commands from the migration file directly in your database.

## Testing the Setup

### Automated Test Script
```bash
# Make sure your environment variables are set
node scripts/test-cleaners-setup.js
```

### Manual Testing
1. Start your development server: `npm run dev`
2. Navigate to the booking flow
3. Complete the location/scheduling steps
4. Verify that cleaners appear in the "Choose Cleaner" step

## Key Features

### 1. Idempotent Migration
The migration safely handles existing data and can be run multiple times without issues.

### 2. Graceful Fallback
If the RPC fails, the system falls back to a simple query that returns active cleaners.

### 3. Flexible Area Matching
The RPC uses fuzzy matching for areas (e.g., "CBD" matches "Cape Town CBD").

### 4. Enum-Safe Status Comparison
Uses `::text` casting to avoid enum comparison issues.

### 5. Realistic Sample Data
- 5 cleaners with South African names
- Proper ratings (4.86-4.95)
- Service area coverage
- Availability windows (Mon-Sat, 8AM-6PM)

## API Usage

### Server-Side (Recommended)
```typescript
import { fetchAvailableCleaners } from '@/server/cleaners';

const cleaners = await fetchAvailableCleaners({
  area: 'CBD',
  serviceSlug: 'standard-cleaning',
  startISO: '2024-01-15T10:00:00Z',
  endISO: '2024-01-15T11:00:00Z',
  limit: 20
});
```

### Client-Side API
```typescript
const response = await fetch('/api/cleaners/availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    regionId: 'region-1',
    suburbId: 'suburb-1',
    date: '2024-01-15',
    timeSlot: '10:00',
    bedrooms: 2,
    bathrooms: 1
  })
});

const { cleaners } = await response.json();
```

## Database Schema

### Core Tables
- `cleaners` - Main cleaner records with `full_name`, `rating`, `jobs_count`, `is_active`
- `cleaner_service_areas` - Many-to-many mapping of cleaners to service areas
- `cleaner_services` - Many-to-many mapping of cleaners to service types
- `cleaner_availability` - Weekly availability windows for each cleaner

### RPC Function
- `available_cleaners(p_area, p_service_slug, p_start, p_end, p_limit)` - Returns available cleaners with filtering

## Environment Variables Required

Make sure these are set in your environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for server-side operations)

## Troubleshooting

### No Cleaners Appearing
1. Check if the migration ran successfully
2. Verify environment variables are set
3. Check browser console for API errors
4. Run the test script: `node scripts/test-cleaners-setup.js`

### RPC Errors
The system has built-in fallback logic, but if you see RPC errors:
1. Check Supabase logs for detailed error messages
2. Verify the `available_cleaners` function exists in your database
3. Ensure RLS policies allow public read access

### Area Mapping Issues
Currently using hardcoded "CBD" area. To improve:
1. Create a mapping from `suburb_id` to area names
2. Update the API routes to use proper area mapping
3. Consider using the existing `suburbs` table for area names

## Next Steps

1. **Run the migration** using one of the methods above
2. **Test the implementation** using the provided test script
3. **Enhance area mapping** to use actual suburb names instead of hardcoded "CBD"
4. **Add more cleaners** by inserting additional records into the `cleaners` table
5. **Customize service types** by updating the service slugs in the migration

The implementation is designed to be robust and handle edge cases gracefully, ensuring the "Choose Cleaner" step always works for your users.
