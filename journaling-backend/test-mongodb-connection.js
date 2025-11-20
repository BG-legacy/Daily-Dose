/**
 * Quick MongoDB Connection Test Script
 * Run this to verify your MongoDB Atlas connection
 * 
 * Usage: node test-mongodb-connection.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🧪 Testing MongoDB Atlas Connection...\n');
  
  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.error('   Make sure you have a .env file with MONGODB_URI set');
    process.exit(1);
  }

  // Redact password for security
  const uriForDisplay = process.env.MONGODB_URI.replace(
    /:(.*?)@/,
    ':****@'
  );
  console.log('📝 Connection String (redacted):', uriForDisplay);
  console.log('');

  try {
    console.log('⏳ Attempting connection...');
    
    const startTime = Date.now();
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      tls: true,
      retryWrites: true,
      retryReads: true,
    });

    const duration = Date.now() - startTime;

    console.log('');
    console.log('✅ CONNECTION SUCCESSFUL!');
    console.log('─────────────────────────────────────');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Port: ${mongoose.connection.port}`);
    console.log(`   Connection Time: ${duration}ms`);
    console.log(`   Ready State: ${mongoose.connection.readyState} (1 = connected)`);
    console.log('─────────────────────────────────────');
    console.log('');
    
    // Test a simple query
    console.log('🔍 Testing database query...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));
    
    await mongoose.disconnect();
    console.log('');
    console.log('✅ Test completed successfully!');
    console.log('   Your MongoDB Atlas connection is working properly.');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.log('');
    console.error('❌ CONNECTION FAILED');
    console.error('─────────────────────────────────────');
    console.error('Error:', error.message);
    console.error('');
    
    // Provide specific guidance based on error type
    if (error.message.includes('tlsv1 alert') || error.message.includes('SSL')) {
      console.error('🔧 TLS/SSL ERROR DETECTED');
      console.error('');
      console.error('This error means MongoDB Atlas is blocking your connection.');
      console.error('');
      console.error('SOLUTION:');
      console.error('1. Go to MongoDB Atlas Console: https://cloud.mongodb.com/');
      console.error('2. Click "Network Access" under Security');
      console.error('3. Click "Add IP Address"');
      console.error('4. Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)');
      console.error('5. Click "Confirm" and wait 1-2 minutes');
      console.error('');
    } else if (error.message.includes('Authentication failed')) {
      console.error('🔧 AUTHENTICATION ERROR');
      console.error('');
      console.error('Your username or password is incorrect.');
      console.error('');
      console.error('SOLUTION:');
      console.error('1. Check your MONGODB_URI connection string');
      console.error('2. Verify username and password are correct');
      console.error('3. Make sure special characters in password are URL-encoded');
      console.error('   Example: p@ssw0rd! should be p%40ssw0rd%21');
      console.error('');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('🔧 DNS/HOSTNAME ERROR');
      console.error('');
      console.error('Cannot find your MongoDB cluster hostname.');
      console.error('');
      console.error('SOLUTION:');
      console.error('1. Verify your connection string format');
      console.error('2. Check if your cluster is paused (resume it)');
      console.error('3. Ensure your cluster URL is correct');
      console.error('');
    } else {
      console.error('🔧 GENERAL ERROR');
      console.error('');
      console.error('Check the following:');
      console.error('1. Is your MongoDB Atlas cluster running?');
      console.error('2. Is your connection string correct?');
      console.error('3. Is your IP whitelisted in Network Access?');
      console.error('4. Check MongoDB Atlas status: https://status.mongodb.com/');
      console.error('');
    }
    
    console.error('─────────────────────────────────────');
    console.error('');
    console.error('For detailed troubleshooting, see: MONGODB_ATLAS_FIX.md');
    console.error('');
    
    process.exit(1);
  }
}

// Run the test
testConnection();

