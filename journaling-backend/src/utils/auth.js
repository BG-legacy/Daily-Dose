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
  // TODO: handle authentication and tokens


  // handled on the frontend
  // only thing that should be returned is the token
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


    res.status(200).send({ message: 'User logged in successfully' });
    console.log('User logged successfully');
  } catch (error) {
    res.status(400).send({ error: error.message });
    console.log('Error logging in user:', error.message);
  }
};


module.exports = { newUser, loginUser };