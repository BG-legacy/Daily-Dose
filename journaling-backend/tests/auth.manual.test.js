const UserManager = require('../src/utils/dynamoDB');
const path = require('path');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

// Mock React's useState hook with closure to maintain state
function createStateMock() {
    let state = null;
    return {
        useState(initialValue) {
            state = state ?? initialValue;
            const setState = (newValue) => {
                state = newValue;
                console.log('State updated:', state);
            };
            return [state, setState];
        },
        getState() {
            return state;
        }
    };
}

// Load environment variables from the correct path
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Firebase client config (this should match your Firebase project settings)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

async function testAuthFlow() {
    console.log('\n🔐 Testing Authentication Flow');
    console.log('================================');

    try {
        // Create state mock
        const stateMock = createStateMock();
        console.log('\n🔄 Setting up React state mock...');
        const [userID, setUserID] = stateMock.useState(null);
        console.log('Initial userID state:', userID);

        // Step 1: Generate Custom Token
        console.log('\n1️⃣ Generating Firebase Custom Token...');
        const { generateTestToken } = await import('./generate-firebase-token.js');
        const customToken = await generateTestToken();
        
        if (!customToken) {
            throw new Error('Failed to generate Firebase token');
        }
        console.log('✅ Custom Token generated successfully');

        // Step 2: Exchange Custom Token for ID Token
        console.log('\n2️⃣ Exchanging Custom Token for ID Token...');
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const userCredential = await signInWithCustomToken(auth, customToken);
        const idToken = await userCredential.user.getIdToken();
        console.log('✅ ID Token obtained successfully');

        // Step 3: Verify ID Token
        console.log('\n3️⃣ Verifying ID Token...');
        const admin = (await import('../src/utils/firebaseConfig.mjs')).default;
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('✅ Token verified successfully');
        console.log('📝 Token details:');
        console.log('- UID:', decodedToken.uid);
        console.log('- Email:', decodedToken.email);

        // Step 4: Check User in DynamoDB
        console.log('\n4️⃣ Checking DynamoDB User...');
        const userDB = new UserManager();
        const dbUserID = await userDB.getUserByEmail(decodedToken.email);

        if (dbUserID) {
            console.log('✅ User found in DynamoDB');
            console.log('📝 User details:');
            const userDetails = await userDB.getUser(dbUserID);
            console.log('- UserID:', userDetails.UserID);
            console.log('- Name:', userDetails.Name);
            console.log('- Email:', userDetails.Email);
            console.log('- Creation Date:', userDetails.CreationDate);
        } else {
            console.log('❌ User not found in DynamoDB');
        }

        // Step 5: Simulate Login Request with State Management
        console.log('\n5️⃣ Simulating Login Request with State Management...');
        const mockReq = {
            body: { token: idToken }
        };
        const mockRes = {
            status: (code) => {
                console.log('Response Status:', code);
                return mockRes;
            },
            send: (data) => {
                console.log('Response Data:', data);
                // Simulate setting the userID in state when login is successful
                if (data.userID) {
                    setUserID(data.userID);
                    console.log('✅ UserID state updated:', data.userID);
                }
                return mockRes;
            },
            json: (data) => {
                console.log('Response JSON:', data);
                return mockRes;
            }
        };

        const { loginUser } = require('../src/utils/auth');
        await loginUser(mockReq, mockRes);

        // Step 6: Verify State Management
        console.log('\n6️⃣ Verifying State Management...');
        const finalState = stateMock.getState();
        if (finalState) {
            console.log('✅ UserID state set successfully');
            console.log('📝 Current userID state:', finalState);
            
            // Test accessing user data with the state
            console.log('\n7️⃣ Testing Data Access with UserID...');
            const userDetails = await userDB.getUser(finalState);
            
            if (userDetails) {
                console.log('✅ Successfully accessed user data with state userID');
                console.log('📝 Retrieved User Details:');
                console.log('- Name:', userDetails.Name);
                console.log('- Email:', userDetails.Email);
                console.log('- Creation Date:', userDetails.CreationDate);
            } else {
                console.log('❌ Failed to access user data with state userID');
            }
        } else {
            console.log('❌ UserID state not set after login');
            throw new Error('State management failed - userID not set');
        }

        console.log('\n✨ Auth Flow Test Complete!');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        
        // Enhanced error handling
        if (error.code === 'auth/argument-error') {
            console.error('Firebase token validation failed. Check if:');
            console.error('1. Firebase config is properly set up in .env');
            console.error('2. Token is properly formatted');
        } else if (error.code === 'auth/id-token-expired') {
            console.error('Token has expired. Generate a new token.');
        } else if (error.message.includes('AWS')) {
            console.error('DynamoDB operation failed. Check if:');
            console.error('1. AWS credentials are properly set up in .env');
            console.error('2. DynamoDB table exists and is accessible');
        } else if (error.message.includes('state management')) {
            console.error('State management failed. Check if:');
            console.error('1. Login response includes userID');
            console.error('2. State setter function is working correctly');
        }
        
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testAuthFlow();
}

module.exports = { testAuthFlow }; 