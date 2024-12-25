// testEnv.js
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../../../.env');
console.log('Looking for .env file at:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('.env file loaded successfully');
}

const envVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];
envVars.forEach(varName => {
    console.log(`${varName} is ${process.env[varName] ? 'defined' : 'undefined'}`);
});

console.log('Current directory:', __dirname);

console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
