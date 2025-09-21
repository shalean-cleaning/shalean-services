const { createClient } = require('@supabase/supabase-js');

// Hardcode the values for testing
const supabaseUrl = 'https://gcmndztkikfwnxbfqctn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbW5kenRraWtmd254YmZxY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDcyNTksImV4cCI6MjA3MzI4MzI1OX0.9HQwytJGisUPT_gwb4TyU9rDe76TBA5iw1QOxlgWON0';

// Test the draft API functionality
async function testDraftAPI() {
  console.log('Testing Draft API...');
  
  // Test 1: Check if the migration was applied
  console.log('\n1. Testing database connection and migration...');
  
  console.log('Using hardcoded values for testing');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Key:', supabaseKey ? 'Found' : 'Missing');
  
  console.log('✅ Environment variables found');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 2: Check if session_id column exists
  console.log('\n2. Checking if session_id column exists...');
  try {
    const { error } = await supabase
      .from('bookings')
      .select('session_id')
      .limit(1);
    
    if (error) {
      console.error('❌ Error checking session_id column:', error.message);
    } else {
      console.log('✅ session_id column exists');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  // Test 3: Check if we can create a minimal draft
  console.log('\n3. Testing minimal draft creation...');
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        status: 'DRAFT',
        scheduled_date: new Date().toISOString().split('T')[0],
        session_id: 'test-session-123'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating draft:', error.message);
      console.error('Details:', error.details);
      console.error('Hint:', error.hint);
    } else {
      console.log('✅ Draft created successfully:', data.id);
      
      // Clean up
      await supabase
        .from('bookings')
        .delete()
        .eq('id', data.id);
      console.log('✅ Test draft cleaned up');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
  
  // Test 4: Check if helper functions exist
  console.log('\n4. Checking if helper functions exist...');
  try {
    const { error } = await supabase.rpc('generate_session_id');
    
    if (error) {
      console.error('❌ generate_session_id function not found:', error.message);
    } else {
      console.log('✅ generate_session_id function exists');
    }
  } catch (err) {
    console.error('❌ Error checking functions:', err.message);
  }
}

// Run the test
testDraftAPI().catch(console.error);
