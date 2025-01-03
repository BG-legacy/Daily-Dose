require('dotenv').config();
const express = require('express');
const app = express();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const cors = require('cors');
app.use(cors());
const UserManager = require('../utils/dynamoDB');
const db = new UserManager();
app.use(express.json());



const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const jwtSK = process.env.JWT_SECRET_KEY;

if (!jwtSK) {
    throw new Error("JWT secret key not set!");
}

// Sign-up function -> should be collecting token and adding user info to the database
const newUser = async (req, res) => {
    // we want the name and username from the frontend too
    const { userID, name, email, password } = req.body;
    try {

        if(!email || !password || !name || !userID) {
            return res.status(400).json({ error: 'Missing required fields'});
        }

        // check if the user already exists
        const existingUser = await db.getUser(userID);
        if(existingUser) {
            return res.status(409).json({error: 'User already exists'});
        }

        const creation = new Date().toISOString();
        const item = {UserID: userID, Name:name, Email: email, CreationDate: creation}

        // add user to database
        await db.addUser(item);
        console.log('User created successfully');
        res.status(200).send({ message: 'User signed up successfully'});

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send({ error: error.message });
    }
};
  
  // Login function
const loginUser = async (req, res) => {
    // TODO: handle authentication and tokens


    // handled on the frontend
    const { email, password } = req.body;
    
    if(!email || !password) {
        return res.status(400).json({ error: 'Missing required fields'});
    }

    try {

      const userID = await db.getUserByEmail(email);
      if(!userID) {
        return res.status(404).json({ error: 'User not found' });
      }


    // TODO: generate a token
      const token = jwt.sign({ userID }, jwtSK, { expiresIn: '1h' });

      res.status(200).send({ message: 'User logged in successfully' });
      console.log('User logged successfully');
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
};
  

module.exports = { newUser, loginUser };