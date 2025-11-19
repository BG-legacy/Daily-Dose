require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const journalRoutes = require('./src/api/journal');
const UserManager = require('./src/utils/userManager');
const mongoConnection = require('./src/utils/mongodb');
const moodRoutes = require('./src/api/mood');
const { loginUser } = require('./src/utils/auth');
const { performanceMiddleware, getMetricsSummary } = require('./src/utils/performance');

// Load environment variables
const PORT = process.env.PORT || 3011;

// Initialize Google OAuth client with credentials
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'https://daily-dose-640q.onrender.com/auth/google/callback'
});

const app = express();

// Performance monitoring middleware - place early to measure entire request cycle
app.use(performanceMiddleware);

// Debug middleware - Logs all incoming requests
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

// CORS configuration for cross-origin requests
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:3001', 'https://www.daily-dose.me'], // Frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'cache-control', 'pragma', 'expires']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for monitoring
app.get('/health', async (req, res) => {
  const dbHealth = mongoConnection.isHealthy() ? 'ok' : 'unhealthy';
  const overallStatus = dbHealth === 'ok' ? 'ok' : 'degraded';
  
  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
      auth: 'ok'
    }
  });
});

// Performance metrics endpoint (protected with basic auth for security)
app.get('/metrics', (req, res) => {
  // Basic auth check - in production, you'd use a more secure approach
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required for metrics' });
  }
  
  // In production, validate credentials properly
  // This is just a simple example with hardcoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [username, password] = credentials.split(':');
  
  // TEMPORARY: Using hardcoded password for testing
  if (username !== 'admin' || password !== 'dailydose') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Return metrics
  res.json(getMetricsSummary());
});

// Authentication middleware for protected routes
const authMiddleware = async (req, res, next) => {
  console.log('=== Auth Middleware ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Auth Header:', req.headers.authorization);

  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader === 'Bearer null') {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Check token type (Google or Regular)
    if (token.includes('.')) {
      // Google OAuth token handling
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      req.user = {
        uid: payload.sub,
        email: payload.email,
        name: payload.name
      };
    } else {
      // Regular auth token (format: "user_[userId]")
      // Keep the full token as the userID since that's how it's stored in the database
      const userID = token;
      console.log('Looking up user with ID:', userID);

      const userManager = new UserManager();
      const user = await userManager.getUser(userID);

      if (!user) {
        console.log('User not found:', userID);
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        uid: userID,
        email: user.Email,
        name: user.Name
      };
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Session verification endpoint
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
    // Check if it's a Google token (they are typically longer and contain dots)
    if (token.includes('.')) {
      // Verify Google token
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
          picture: payload.picture,
        }
      });
    } else {
      // Handle our custom session token
      // TODO: Implement proper token verification
      const userManager = new UserManager();
      // For now, assume token is userID
      const user = await userManager.getUser(token);

      if (!user) {
        return res.status(401).json({
          authenticated: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        authenticated: true,
        user: {
          uid: user.UserID,
          email: user.Email,
          name: user.Name,
        }
      });
    }
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(401).json({
      authenticated: false,
      message: 'Invalid token'
    });
  }
});

// Mount journal routes with authentication
app.use('/api/journal', authMiddleware, (req, res, next) => {
  console.log('=== Journal Route Hit ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  next();
}, journalRoutes);

// Mount mood routes with authentication
app.use('/api/mood', authMiddleware, moodRoutes);

// Google OAuth routes
app.get('/auth/google', (req, res) => {
  // Generate Google OAuth URL and redirect user
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    redirect_uri: 'https://daily-dose-640q.onrender.com/auth/google/callback'
  });
  console.log('Redirecting to Google OAuth URL:', authUrl);
  res.redirect(authUrl);
});

// Google OAuth callback handler
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    console.log('Received callback with code:', code);

    const { tokens } = await googleClient.getToken({
      code,
      redirect_uri: 'https://daily-dose-640q.onrender.com/auth/google/callback'
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

    // Use id_token as the session token
    const sessionToken = tokens.id_token;

    // Construct the frontend callback URL with user data and token
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.daily-dose.me';
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.daily-dose.me';
    res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
  }
});

// Traditional login endpoint
app.post('/auth/login', async (req, res) => {
  console.log('=== Login Request ===');
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      authenticated: false,
      message: 'Email and password are required'
    });
  }

  try {
    const userManager = new UserManager();
    const userID = await userManager.getUserByEmail(email);

    if (!userID) {
      return res.status(401).json({
        authenticated: false,
        message: 'User not found'
      });
    }

    const user = await userManager.getUser(userID);

    // TODO: Add proper password verification
    // Currently accepts any password for testing

    // Use userID as the session token for traditional login
    const sessionToken = userID;  // This matches what we check in authMiddleware

    return res.status(200).json({
      authenticated: true,
      token: sessionToken,
      user: {
        uid: user.UserID,
        email: user.Email,
        name: user.Name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      authenticated: false,
      message: 'Internal server error'
    });
  }
});

// Registration endpoint
app.post('/register', async (req, res) => {
  console.log('=== Registration Request ===');
  const { email, password, displayName } = req.body;

  if (!email || !password || !displayName) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and display name are required'
    });
  }

  try {
    const userManager = new UserManager();

    // Check if user already exists
    const existingUser = await userManager.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'email-already-in-use'
      });
    }

    // Create new user
    const userID = Date.now().toString(); // Simple ID generation - consider using UUID in production
    await userManager.addUser({
      UserID: userID,
      Name: displayName,
      Email: email,
      CreationDate: new Date().toISOString()
      // TODO: Add hashed password storage
    });

    // Generate session token (replace with proper JWT implementation)
    const sessionToken = 'temp-session-token'; // Replace with proper JWT

    return res.status(200).json({
      success: true,
      token: sessionToken,
      user: {
        uid: userID,
        email: email,
        name: displayName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('=== Error Handler ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, async () => {
  console.log('=== Server Started ===');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('CORS configured for: https://www.daily-dose.me');
  
  // Initialize MongoDB connection
  try {
    await mongoConnection.connect();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('⚠️  Server will continue but database operations will fail');
  }
  
  console.log('Routes mounted:');
  console.log('- GET /health');
  console.log('- GET /auth/session');
  console.log('- POST /api/journal');
  console.log('- GET /api/journal');
  console.log('- GET /api/journal/summary/weekly');
  console.log('- GET /api/journal/:thoughtId');
  console.log('- DELETE /api/journal/:thoughtId');
  console.log('- POST /api/mood');
  console.log('- GET /api/mood/summary/weekly');
});

