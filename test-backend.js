// Test script for backend API
const http = require('http');

console.log('🧪 Testing Coversheet Automation Backend...\n');

// Test health check endpoint
function testHealthCheck() {
    return new Promise((resolve, reject) => {
        console.log('1️⃣ Testing health check endpoint...');

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/health',
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status === 'ok') {
                        console.log('   ✅ Health check passed');
                        console.log('   Response:', response);
                        resolve(true);
                    } else {
                        console.log('   ❌ Health check failed');
                        resolve(false);
                    }
                } catch (error) {
                    console.log('   ❌ Invalid response:', error.message);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => {
            console.log('   ❌ Connection failed:', error.message);
            console.log('   💡 Make sure backend is running: npm start');
            resolve(false);
        });

        req.end();
    });
}

// Run tests
async function runTests() {
    const healthCheckPassed = await testHealthCheck();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Test Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Health Check: ${healthCheckPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (healthCheckPassed) {
        console.log('✅ Backend is running correctly!');
        console.log('🌐 Access the application at: http://localhost:3000/coversheet-generator.html');
    } else {
        console.log('❌ Backend is not responding');
        console.log('💡 Start the backend with: npm start');
    }
}

runTests();
