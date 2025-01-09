// testEnv.js
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../../.env');
console.log('\n🔍 Environment Configuration Test');
console.log('================================');
console.log('Looking for .env file at:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('❌ Error loading .env file:', result.error);
} else {
    console.log('✅ .env file loaded successfully');
}

// Add OpenAI API key to the environment variables to check
const envVars = [
    'AWS_ACCESS_KEY_ID', 
    'AWS_SECRET_ACCESS_KEY', 
    'AWS_REGION',
    'OPENAI_API_KEY'  // Added OpenAI API key check
];

console.log('\n📋 Environment Variables Status:');
console.log('================================');
envVars.forEach(varName => {
    const isDefined = process.env[varName] ? '✅' : '❌';
    console.log(`${isDefined} ${varName} is ${process.env[varName] ? 'defined' : 'undefined'}`);
    
    // Additional check for key format
    if (varName === 'OPENAI_API_KEY' && process.env[varName]) {
        if (process.env[varName].startsWith('sk-')) {
            console.log('   └─ OpenAI API key format appears correct');
        } else {
            console.log('   └─ ⚠️ Warning: OpenAI API key format may be incorrect');
        }
    }
});

console.log('\n📂 Directory Information:');
console.log('================================');
console.log('Current directory:', __dirname);

// Safely display partial keys (if they exist)
console.log('\n🔑 Key Previews (first 5 characters):');
console.log('================================');
envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`${varName}: ${value.substring(0, 5)}...`);
    } else {
        console.log(`${varName}: Not set`);
    }
});
