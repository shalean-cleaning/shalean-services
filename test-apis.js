// Simple test script for API endpoints
const https = require('https');
const http = require('http');

async function testAPI(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': body ? Buffer.byteLength(body) : 0
      }
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing API Endpoints...\n');

  // Test 1: Cleaners Availability API
  console.log('1. Testing Cleaners Availability API...');
  try {
    const testData = JSON.stringify({
      regionId: "c485a7b7-8572-42cd-bc2a-1d79a4bf44a7",
      suburbId: "4cccc60f-0e49-4a37-a3c9-764549070b9a",
      date: "2025-09-25",
      timeSlot: "08:00",
      bedrooms: 2,
      bathrooms: 1
    });

    const result = await testAPI('http://localhost:3000/api/cleaners/availability', 'POST', testData);
    console.log(`   Status: ${result.statusCode}`);
    if (result.statusCode === 200) {
      console.log('   ✅ Cleaners Availability API working');
      const response = JSON.parse(result.data);
      console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
    } else {
      console.log('   ❌ Cleaners Availability API failed');
      console.log(`   Response: ${result.data}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('');

  // Test 2: Bookings Draft API
  console.log('2. Testing Bookings Draft API...');
  try {
    const testData = JSON.stringify({
      bedrooms: 2,
      bathrooms: 1
    });

    const result = await testAPI('http://localhost:3000/api/bookings/draft', 'POST', testData);
    console.log(`   Status: ${result.statusCode}`);
    if (result.statusCode === 200) {
      console.log('   ✅ Bookings Draft API working');
      const response = JSON.parse(result.data);
      console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
    } else {
      console.log('   ❌ Bookings Draft API failed');
      console.log(`   Response: ${result.data}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('');
  console.log('🏁 Testing complete!');
}

runTests().catch(console.error);
