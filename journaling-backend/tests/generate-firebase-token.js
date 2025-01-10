const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function generateTestToken() {
    try {
        // Import the Firebase admin module
        const admin = (await import('../src/utils/firebaseConfig.mjs')).default;
        
        // Create a test user in Firebase
        const testUserEmail = "test@example.com";
        const testUserData = {
            email: testUserEmail,
            emailVerified: true,
            displayName: "Test User"
        };

        // Create or get the user
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(testUserEmail);
            console.log('Using existing test user');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await admin.auth().createUser(testUserData);
                console.log('Created new test user');
            } else {
                throw error;
            }
        }

        // Generate a custom token
        const customToken = await admin.auth().createCustomToken(userRecord.uid);
        
        console.log('\n=== Test User Details ===');
        console.log('Email:', testUserEmail);
        console.log('UID:', userRecord.uid);
        console.log('\n=== Custom Token ===');
        console.log(customToken);
        
        // Also create a user in DynamoDB if needed
        const UserManager = require('../src/utils/dynamoDB');
        const db = new UserManager();
        
        try {
            const existingUser = await db.getUserByEmail(testUserEmail);
            if (!existingUser) {
                await db.addUser({
                    UserID: userRecord.uid,
                    Name: "Test User",
                    Email: testUserEmail,
                    CreationDate: new Date().toISOString()
                });
                console.log('\n✅ Test user added to DynamoDB');
            } else {
                console.log('\n✅ Test user already exists in DynamoDB');
            }
        } catch (error) {
            console.error('Error managing DynamoDB user:', error);
        }

        return customToken;
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
}

// Change the execution code to only run when file is directly executed
if (require.main === module) {
    generateTestToken()
        .then(() => {
            console.log('\n📝 Instructions:');
            console.log('1. Copy the custom token above');
            console.log('2. Use it in your login request');
            console.log('3. Token will be valid for 1 hour');
        })
        .catch(console.error)
        .finally(() => {
            setTimeout(() => process.exit(), 1000);
        });
}

// Add this export
module.exports = { generateTestToken }; 