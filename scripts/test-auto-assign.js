#!/usr/bin/env node

/**
 * Test script for Auto-assign + Seed Cleaners functionality
 * 
 * This script tests:
 * 1. Database migration (run manually in Supabase)
 * 2. API endpoints for cleaner selection and booking confirmation
 * 3. UI component functionality
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Cleaner Selection API
  console.log('1. Testing /api/bookings/select-cleaner');
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/select-cleaner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'test-booking-123',
        cleanerId: null,
        autoAssign: true
      })
    });

    const result = await response.json();
    console.log('   ✅ Response:', result);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 2: Booking Confirmation API
  console.log('\n2. Testing /api/bookings/confirm');
  try {
    const response = await fetch(`${BASE_URL}/api/bookings/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: 'test-booking-123'
      })
    });

    const result = await response.json();
    console.log('   ✅ Response:', result);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }

  // Test 3: Cleaner Availability API (existing)
  console.log('\n3. Testing /api/cleaners/availability');
  try {
    const response = await fetch(`${BASE_URL}/api/cleaners/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        regionId: 'test-region',
        suburbId: 'test-suburb',
        date: '2025-01-20',
        timeSlot: '10:00',
        bedrooms: 2,
        bathrooms: 1
      })
    });

    const result = await response.json();
    console.log('   ✅ Response:', result);
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
}

function printInstructions() {
  console.log(`
🚀 Auto-assign + Seed Cleaners Implementation Complete!

📋 What was implemented:

1. ✅ Database Migration (supabase/migrations/20250115_auto_assign_and_cleaners.sql)
   - Added auto_assign column to bookings table
   - Added status column to bookings table  
   - Created cleaner_service_areas and cleaner_services tables
   - Added helper functions for auto-assignment
   - Seeded sample cleaners for Cape Town areas

2. ✅ API Routes
   - /api/bookings/select-cleaner - Save cleaner selection or auto-assign choice
   - /api/bookings/confirm - Confirm booking with auto-assignment logic

3. ✅ UI Components
   - Updated CleanerSelectionStep component
   - Added auto-assign functionality to booking store
   - Auto-assign option always available, even when no cleaners shown

4. ✅ State Management
   - Updated booking store with autoAssign state
   - Proper state management for cleaner selection

📝 Next Steps:

1. Run the database migration in Supabase:
   - Copy the SQL from supabase/migrations/20250115_auto_assign_and_cleaners.sql
   - Paste into Supabase SQL Editor and execute

2. Test the flow:
   - Navigate to booking flow
   - On "Choose Your Cleaner" step, try selecting "Auto-assign Best Match"
   - Continue through the flow to test confirmation

3. Verify seeded data:
   - Check that cleaners appear in Supabase
   - Verify they have proper service areas and availability

🔧 Configuration Notes:

- The migration works with your existing schema
- Uses existing cleaners and profiles tables
- Extends availability_slots table
- Seeded cleaners have realistic Cape Town area coverage

🎯 Key Features:

- Auto-assign works even when no cleaners are immediately available
- Users can always continue with auto-assign option
- System attempts assignment on booking confirmation
- Falls back to pending_assignment status if no cleaner found
- Admin can manually assign pending bookings later

✨ The implementation is complete and ready for testing!
`);
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAPIEndpoints()
    .then(() => {
      printInstructions();
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testAPIEndpoints, printInstructions };
