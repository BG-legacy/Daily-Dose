// homeController
const express = require('express');
const app = express();
const cors = require('cors');
const UserManager = require('./dynamoDB');
const db = new UserManager();


//TODO: auth needs to be defined

let firebaseAdmin;
async function loadFirebaseConfig() {
  try {
    const admin = await import('./firebaseConfig.mjs'); // Adjust path as needed
    firebaseAdmin = admin.default; // Access default export
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error loading Firebase config:', error);
    firebaseAdmin = null;
  }
}

// to start the app
loadFirebaseConfig();

// Middleware to ensure firebaseAdmin is initialized before handling requests
const ensureFirebaseInitialized = (req, res, next) => {
  if (!firebaseAdmin) {
    return res.status(500).json({ error: 'Firebase not initialized' });
  }
  next(); // Proceed to the next middleware or route handler
};


// Apply the middleware to routes that require firebaseAdmin (like login)
app.use('/login', ensureFirebaseInitialized);


app.use(cors());

app.use(express.json());


// Sign-up function -> should be collecting token and adding user info to the database
const newUser = async (req, res) => {
  // we want the name and username from the frontend too
  const { userID, name, email, password } = req.body;
  try {

    if (!email || !password || !name || !userID) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // check if the user already exists

    const existingUser = await db.getUser(userID);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const creation = new Date().toISOString();
    const item = { UserID: userID, Name: name, Email: email, CreationDate: creation }

    // add user to database
    await db.addUser(item);
    console.log('User created successfully');
    res.status(200).send({ message: 'User signed up successfully' });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).send({ error: error.message });
  }
};

// Login function
const loginUser = async (req, res) => {
  console.log('login called')

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing token ' });
    console.log('Missing token');
  }

  try {
    // verify token with firebase admin
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const { uid, email } = decodedToken;

    const userID = await db.getUserByEmail(email);
    if (!userID) {
      return res.status(404).json({ error: 'User not found' });
    }

    //TODO: check to make sure that if the streak count is zero (first time logging in), just add 1 to their streak
    const currentDate = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD

    // calculate streak count
    let streakCount = userID.StreakCount || 0
    




    await db.updateUser(userID, { LastLogin: currentDate });


    res.status(200).send({ message: 'User logged in successfully', userID });
    console.log('User logged successfully');
  } catch (error) {
    res.status(400).send({ error: error.message });
    console.log('Error logging in user:', error.message);
  }
};

// Google OAuth route
app.get('/auth/google', (req, res) => {
  // Initialize Google OAuth flow
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
    client_id=${process.env.GOOGLE_CLIENT_ID}
    &redirect_uri=${process.env.REDIRECT_URI}
    &response_type=code
    &scope=email profile`;
  
  res.redirect(authUrl);
});

// Callback route after Google OAuth
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    // Exchange code for tokens
    // Create or update user in your database
    // Set session/JWT
    res.redirect('/dashboard'); // Redirect to your frontend
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/login?error=auth_failed');
  }
});

module.exports = { newUser, loginUser };