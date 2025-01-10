const UserManager = require('../src/utils/dynamoDB');
const { loginUser } = require('../src/utils/auth');
const path = require('path');
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Firebase config
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Mock React's useState
function createStateMock() {
    let state = null;
    return {
        useState(initialValue) {
            state = state ?? initialValue;
            const setState = (newValue) => {
                state = newValue;
            };
            return [state, setState];
        },
        getState() {
            return state;
        }
    };
}

describe('Authentication Flow', () => {
    let stateMock;
    let userDB;
    let customToken;
    let idToken;
    let decodedToken;

    beforeAll(async () => {
        // Initialize state mock
        stateMock = createStateMock();
        userDB = new UserManager();
    });

    test('should generate and verify Firebase token', async () => {
        // Generate token
        const { generateTestToken } = await import('./generate-firebase-token.js');
        customToken = await generateTestToken();
        expect(customToken).toBeTruthy();

        // Exchange custom token for ID token
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const userCredential = await signInWithCustomToken(auth, customToken);
        idToken = await userCredential.user.getIdToken();
        expect(idToken).toBeTruthy();

        // Verify token
        const admin = (await import('../src/utils/firebaseConfig.mjs')).default;
        decodedToken = await admin.auth().verifyIdToken(idToken);
        expect(decodedToken).toBeTruthy();
        expect(decodedToken.uid).toBeTruthy();
        expect(decodedToken.email).toBeTruthy();
    });

    test('should find user in DynamoDB', async () => {
        const dbUserID = await userDB.getUserByEmail(decodedToken.email);
        expect(dbUserID).toBeTruthy();

        const userDetails = await userDB.getUser(dbUserID);
        expect(userDetails).toBeTruthy();
        expect(userDetails.UserID).toBe(dbUserID);
        expect(userDetails.Email).toBe(decodedToken.email);
    });

    test('should handle login and state management', async () => {
        // Setup state
        const [userID, setUserID] = stateMock.useState(null);
        expect(userID).toBeNull();

        // Mock request and response
        const mockReq = {
            body: { token: idToken }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockImplementation((data) => {
                if (data.userID) {
                    setUserID(data.userID);
                }
                return mockRes;
            }),
            json: jest.fn().mockReturnThis()
        };

        // Test login
        await loginUser(mockReq, mockRes);

        // Verify response
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.send).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'User logged in successfully',
                userID: expect.any(String)
            })
        );

        // Verify state management
        const finalState = stateMock.getState();
        expect(finalState).toBeTruthy();

        // Verify data access with state
        const userDetails = await userDB.getUser(finalState);
        expect(userDetails).toBeTruthy();
        expect(userDetails.Email).toBe(decodedToken.email);
    });

    test('should handle login errors', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const mockReq = {
            body: { token: 'invalid-token' }
        };
        const mockRes = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        await loginUser(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: 'Invalid token'
            })
        );
        consoleSpy.mockRestore();
    });
});