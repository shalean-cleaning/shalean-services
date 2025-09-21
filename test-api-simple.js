const { createClient } = require('@supabase/supabase-js');

// Test the API functionality directly
async function testAPI() {
  console.log('Testing API functionality...');
  
  const supabaseUrl = 'https://gcmndztkikfwnxbfqctn.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbW5kenRraWtmd254YmZxY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MDcyNTksImV4cCI6MjA3MzI4MzI1OX0.9HQwytJGisUPT_gwb4TyU9rDe76TBA5iw1QOxlgWON0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Create a draft with session_id
  console.log('\n1. Creating draft with session_id...');
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        status: 'DRAFT',
        scheduled_date: new Date().toISOString().split('T')[0],
        session_id: 'test-session-api-123'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating draft:', error.message);
    } else {
      console.log('✅ Draft created successfully:', data.id);
      
      // Test 2: Try to create another draft with same session_id (should fail)
      console.log('\n2. Testing duplicate prevention...');
      const { data: data2, error: error2 } = await supabase
        .from('bookings')
        .insert({
          status: 'DRAFT',
          scheduled_date: new Date().toISOString().split('T')[0],
          session_id: 'test-session-api-123'
        })
        .select()
        .single();
      
      if (error2) {
        console.log('✅ Duplicate prevention working:', error2.message);
      } else {
        console.log('❌ Duplicate prevention failed - created second draft:', data2.id);
      }
      
      // Test 3: Update the existing draft
      console.log('\n3. Testing draft update...');
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          service_id: 'test-service',
          total_price: 100
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating draft:', updateError.message);
      } else {
        console.log('✅ Draft updated successfully');
      }
      
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
}

// Run the test
testAPI().catch(console.error);
