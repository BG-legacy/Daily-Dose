const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const journalRoutes = require('./src/api/journal');
const UserManager = require('./src/utils/dynamoDB');


// Load environment variables
const PORT = process.env.PORT || 3011;

// Initialize Google OAuth client
const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: 'http://localhost:3011/auth/google/callback'
});

const app = express();

// Debug middleware
app.use((req, res, next) => {
    console.log('=== Incoming Request ===');
    console.log(`${req.method} ${req.url}`);
    console.log('Origin:', req.headers.origin);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (req.body) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('======================');
    next();
});

// Update CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL
        : 'http://localhost:3001', // Updated frontend port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add health check endpoint (before other routes)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            database: 'ok',  // You can add actual DB health check later
            auth: 'ok'       // You can add actual auth health check later
        }
    });
});

// Auth middleware (only for /api routes)
const authMiddleware = (req, res, next) => {
    console.log('=== Auth Middleware ===');
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    console.log('Auth Header:', req.headers.authorization);
    
    // Skip OPTIONS requests
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('No auth header present');
        return res.status(401).json({ error: 'No authorization header' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
        console.log('Invalid auth header format');
        return res.status(401).json({ error: 'Invalid authorization format' });
    }

    // Extract and verify token
    const token = authHeader.split(' ')[1];
    console.log('Token received:', token.substring(0, 20) + '...');
    
    next();
};

// Add session endpoint (before other routes)
app.get('/auth/session', async (req, res) => {
    console.log('=== Session Check ===');
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            authenticated: false,
            message: 'Invalid authorization format' 
        });
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // Verify the Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const userManager = new UserManager();
        const userID = await userManager.getUserByEmail(payload.email);

        if (!userID) {
            return res.status(401).json({
                authenticated: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            authenticated: true,
            user: {
                uid: userID,
                email: payload.email,
                name: payload.name,
                picture: payload.picture
            }
        });
    } catch (error) {
        console.error('Session verification error:', error);
        return res.status(401).json({
            authenticated: false,
            message: 'Invalid token'
        });
    }
});

// Mount journal routes with auth middleware
app.use('/api/journal', authMiddleware, (req, res, next) => {
    console.log('=== Journal Route Hit ===');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    next();
}, journalRoutes);

// Update Google OAuth routes
app.get('/auth/google', (req, res) => {
    const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        redirect_uri: 'http://localhost:3011/auth/google/callback'
    });

    console.log('Redirecting to Google OAuth URL:', authUrl);
    res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
    try {
        const { code } = req.query;
        console.log('Received callback with code:', code);
        
        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: 'http://localhost:3011/auth/google/callback'
        });

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google auth payload:', payload);

        // Generate a unique user ID if needed
        const userID = payload.sub;

        // Create or update user in database
        const userManager = new UserManager();
        let dbUser = await userManager.getUserByEmail(payload.email);

        if (!dbUser) {
            // Create new user
            await userManager.addUser({
                UserID: userID,
                Name: payload.name,
                Email: payload.email,
                CreationDate: new Date().toISOString()
            });
            console.log('Created new user:', userID);
        }

        // Generate session token (you might want to use a proper JWT library)
        const sessionToken = tokens.id_token;

        // Construct the frontend callback URL with user data and token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const redirectUrl = `${frontendUrl}/auth/callback?token=${sessionToken}&user=${encodeURIComponent(JSON.stringify({
            uid: userID,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        }))}`;

        console.log('Redirecting to frontend:', redirectUrl);
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Google auth error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('=== Error Handler ===');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log('=== Server Started ===');
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('CORS configured for: http://localhost:3001');
    console.log('Routes mounted:');
    console.log('- GET /health');
    console.log('- GET /auth/session');
    console.log('- POST /api/journal');
    console.log('- GET /api/journal');
    console.log('- GET /api/journal/summary/weekly');
    console.log('- GET /api/journal/:thoughtId');
    console.log('- DELETE /api/journal/:thoughtId');
});

