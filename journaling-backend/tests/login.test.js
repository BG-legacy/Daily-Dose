const { render, act, fireEvent, waitFor } = require('@testing-library/react');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');
const React = require('react');
const { useState, useEffect } = require('react');

// Mock the Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

// Mock Login Component
function LoginComponent({ onLoginSuccess }) {
    const [userID, setUserID] = useState(null);
    const [error, setError] = useState(null);

    const handleLogin = async (token) => {
        try {
            const response = await fetch('http://localhost:3001/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserID(data.userID);
                onLoginSuccess && onLoginSuccess(data.userID);
            } else {
                setError(data.error);
            }
        } catch (error) {
            setError('Failed to login');
            console.error('Login error:', error);
        }
    };

    return {
        userID,
        error,
        handleLogin
    };
}

// Test suite
describe('Login Flow with State Management', () => {
    let app;
    let auth;
    let testComponent;

    beforeAll(async () => {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    });

    beforeEach(() => {
        // Reset component state before each test
        testComponent = LoginComponent({
            onLoginSuccess: jest.fn()
        });
    });

    test('successful login should set userID in state', async () => {
        // Generate a test token
        const { generateTestToken } = require('./generate-firebase-token.js');
        const customToken = await generateTestToken();

        // Get ID token
        const userCredential = await signInWithCustomToken(auth, customToken);
        const idToken = await userCredential.user.getIdToken();

        // Attempt login
        await act(async () => {
            await testComponent.handleLogin(idToken);
        });

        // Check if userID was set in state
        await waitFor(() => {
            expect(testComponent.userID).not.toBeNull();
            expect(testComponent.error).toBeNull();
        });
    });

    test('failed login should set error state', async () => {
        // Attempt login with invalid token
        await act(async () => {
            await testComponent.handleLogin('invalid-token');
        });

        // Check if error was set in state
        await waitFor(() => {
            expect(testComponent.userID).toBeNull();
            expect(testComponent.error).not.toBeNull();
        });
    });

    test('login success callback should be called with userID', async () => {
        const mockOnLoginSuccess = jest.fn();
        testComponent = LoginComponent({
            onLoginSuccess: mockOnLoginSuccess
        });

        // Generate a test token
        const { generateTestToken } = require('./generate-firebase-token.js');
        const customToken = await generateTestToken();

        // Get ID token
        const userCredential = await signInWithCustomToken(auth, customToken);
        const idToken = await userCredential.user.getIdToken();

        // Attempt login
        await act(async () => {
            await testComponent.handleLogin(idToken);
        });

        // Check if callback was called with userID
        await waitFor(() => {
            expect(mockOnLoginSuccess).toHaveBeenCalled();
            expect(mockOnLoginSuccess).toHaveBeenCalledWith(testComponent.userID);
        });
    });
});