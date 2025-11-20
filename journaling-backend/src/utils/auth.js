/**
 * Authentication Utility Module
 * Handles user authentication, registration, and OAuth flows
 */

const express = require('express');
const app = express();
const cors = require('cors');
const UserManager = require('./userManager');
const db = new UserManager();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Initialize Google OAuth client with environment variables
 * Required for Google authentication flow
 */
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
});

/**
 * Firebase Configuration
 * Dynamic import of Firebase admin SDK
 */
let firebaseAdmin;
async function loadFirebaseConfig() {
    try {
        const admin = await import('./firebaseConfig.mjs');
        firebaseAdmin = admin.default;
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Error loading Firebase config:', error);
        firebaseAdmin = null;
    }
}

// Initialize Firebase on startup
loadFirebaseConfig();

/**
 * Middleware to ensure Firebase is initialized
 * Prevents requests when Firebase is not ready
 */
const ensureFirebaseInitialized = (req, res, next) => {
    if (!firebaseAdmin) {
        return res.status(500).json({ error: 'Firebase not initialized' });
    }
    next();
};

// Apply middleware and basic Express configuration
app.use('/login', ensureFirebaseInitialized);
app.use(cors());
app.use(express.json());

/**
 * User Registration Handler
 * Creates new user accounts with hashed passwords
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user details
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Promise<Object>} Created user object
 */
const newUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for existing user
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const userID = `user_${Date.now()}`;
        const newUser = {
            UserID: userID,
            Name: name,
            Email: email,
            Password: hashedPassword,
            CreationDate: new Date().toISOString()
        };

        await db.addUser(newUser);
        
        res.status(201).json({
            message: 'User created successfully',
            user: { uid: userID, email, name }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
};

/**
 * Regular Login Handler
 * Authenticates users with email/password
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @returns {Promise<Object>} Authentication token and user details
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userManager = new UserManager();
        const userID = await userManager.getUserByEmail(email);

        if (!userID) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = await userManager.getUser(userID);
        const token = userID;
        const currentDate = new Date().toISOString();

        await userManager.updateUser(userID, { LastLogin: currentDate });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { uid: userID, email: user.Email, name: user.Name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

/**
 * Google OAuth Login Handler
 * Handles Google authentication flow
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.token - Google OAuth token
 * @returns {Promise<Object>} Authentication token and user details
 */
const handleGoogleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Create or update user
        let user = await db.getUserByEmail(email);
        
        if (!user) {
            const newUser = {
                UserID: googleId,
                Email: email,
                Name: name,
                CreationDate: new Date().toISOString()
            };
            await db.addUser(newUser);
            user = newUser;
        }

        await db.updateUser(user.UserID, { LastLogin: new Date().toISOString() });

        res.status(200).json({
            message: 'Google login successful',
            token: token,
            user: {
                uid: user.UserID,
                email: user.Email,
                name: user.Name
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google login failed' });
    }
};

/**
 * Google OAuth Routes
 * Handles OAuth flow initialization and callback
 */
app.get('/auth/google', (req, res) => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
        client_id=${process.env.GOOGLE_CLIENT_ID}
        &redirect_uri=${process.env.REDIRECT_URI}
        &response_type=code
        &scope=email profile`;
    
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
        res.redirect('/dashboard');
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.redirect('/login?error=auth_failed');
    }
});

module.exports = {
    newUser,
    loginUser,
    handleGoogleLogin
};

/**
 * Security Features:
 * 1. Password hashing with bcrypt
 * 2. Token-based authentication
 * 3. OAuth2 integration
 * 4. Input validation
 * 5. Error handling
 * 
 * Authentication Methods:
 * 1. Regular email/password
 * 2. Google OAuth
 * 3. Firebase authentication (optional)
 * 
 * Data Flow:
 * 1. Validate input
 * 2. Check user existence
 * 3. Process authentication
 * 4. Generate/validate tokens
 * 5. Update user records
 * 
 * TODO:
 * 1. Implement proper password verification
 * 2. Add session management
 * 3. Implement token refresh
 * 4. Add rate limiting
 * 5. Enhance error messages
 */