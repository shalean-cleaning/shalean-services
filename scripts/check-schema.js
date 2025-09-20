#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('🔍 Checking bookings table schema...\n');
  
  const columns = [
    'id', 'customer_id', 'service_id', 'suburb_id', 
    'booking_date', 'start_time', 'end_time', 'status', 
    'total_price', 'notes', 'special_instructions', 
    'auto_assign', 'address', 'postcode', 'bedrooms', 
    'bathrooms', 'created_at', 'updated_at'
  ];
  
  const existingColumns = [];
  const missingColumns = [];
  
  for (const col of columns) {
    try {
      const { error } = await supabase
        .from('bookings')
        .select(col)
        .limit(0);
      
      if (error) {
        missingColumns.push(col);
      } else {
        existingColumns.push(col);
      }
    } catch {
      missingColumns.push(col);
    }
  }
  
  console.log('✅ Existing columns:');
  existingColumns.forEach(col => console.log(`   - ${col}`));
  
  console.log('\n❌ Missing columns:');
  missingColumns.forEach(col => console.log(`   - ${col}`));
  
  console.log('\n📋 Recommended test booking structure:');
  const testBooking = {};
  existingColumns.forEach(col => {
    if (col === 'id') return; // Skip auto-generated ID
    if (col === 'created_at' || col === 'updated_at') return; // Skip timestamps
    
    // Set default values based on column name
    if (col === 'customer_id') testBooking[col] = 'REQUIRED';
    else if (col === 'service_id') testBooking[col] = 'REQUIRED';
    else if (col === 'suburb_id') testBooking[col] = 'REQUIRED';
    else if (col === 'booking_date') testBooking[col] = 'REQUIRED';
    else if (col === 'start_time') testBooking[col] = 'REQUIRED';
    else if (col === 'end_time') testBooking[col] = 'REQUIRED';
    else if (col === 'status') testBooking[col] = 'PENDING';
    else if (col === 'total_price') testBooking[col] = 'REQUIRED';
    else testBooking[col] = 'OPTIONAL';
  });
  
  console.log(JSON.stringify(testBooking, null, 2));
}

checkSchema().catch(console.error);
