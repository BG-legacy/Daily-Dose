import dotenv from 'dotenv';
dotenv.config();
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });


import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  getIdToken } from "firebase/auth";


  
  const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };

  
  
  // Initialize Firebase once at the start of your app
  const app = initializeApp(firebaseConfig);
  
  // After initialization, access services like auth
  const auth = getAuth(app);
  

const signUp = async ({userID, name, email, password}) => {
    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.uid);
        const creation = new Date().toISOString();
        const item = {userID: userID, name:name, email: email, password:password}

        const response = await fetch('http://localhost:3007/newUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        // Log the raw response for debugging
        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);
        

        if(!response.ok){
            throw new Error(`Failed to create user in database: ${responseText}`);

        }
    

        console.log('User signed up:', userCredential.user);
    } catch (error) {
        console.error('Error signing up:', error.message);
        throw error;
    }
};


const signIn = async ({email, password}) => {
    try {

      console.log('Signing in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdToken(userCredential.user);
      

      const response = await fetch('http://localhost:3007/loginUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token }),
      });
      

      const data = await response.json();
      console.log(response.status)
      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      console.log(data);
      console.log('User signed in:', userCredential.user);
      return token;
    } catch (error) {
      console.error('Error signing in:', error.message);
    }
};


const logout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
};

export { signUp, signIn, logout };

// import { initializeApp, getApps } from "firebase/app";
// import { 
//     getAuth, 
//     createUserWithEmailAndPassword, 
//     signInWithEmailAndPassword, 
//     signOut, 
//     getIdToken 
// } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyA1GwqWRQjy2D04mBPJtYVM4vRNxZFGcOY",
//   authDomain: "dailydose-b833c.firebaseapp.com",
//   projectId: "dailydose-b833c",
//   storageBucket: "dailydose-b833c.firebasestorage.app",
//   messagingSenderId: "699391082787",
//   appId: "1:699391082787:web:2c7671f887eee8624c4c96",
//   measurementId: "G-T1JZB7T8BY"
// };

// // Initialize Firebase with verification
// let app;
// let auth;

// try {
//     console.log('Initializing Firebase...');
    
//     // Check if Firebase is already initialized
//     if (getApps().length === 0) {
//         app = initializeApp(firebaseConfig);
//     } else {
//         app = getApps()[0];
//     }
    
//     auth = getAuth(app);
    
//     console.log('Firebase initialized successfully');
//     console.log('Auth instance created:', auth);
// } catch (error) {
//     console.error('Firebase initialization error:', error);
//     throw error;
// }

// // Add verification function
// const verifyAuth = () => {
//     if (!auth) {
//         throw new Error('Firebase auth is not initialized');
//     }
//     return auth;
// };

// const signIn = async ({email, password}) => {
//     try {
//         // Verify auth is initialized
//         const currentAuth = verifyAuth();
//         console.log('Starting sign in process...');
//         console.log('Signing in with email:', email);
        
//         const userCredential = await signInWithEmailAndPassword(currentAuth, email, password);
//         const token = await getIdToken(userCredential.user);
        
        
//         const response = await fetch('http://localhost:3003/loginUser', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ token }),
//         });

//         const data = await response.json();
//         console.log('here?')
//         console.log(response.ok)
//         if (!response.ok) {
//             throw new Error(data.error || 'Failed to log in');
//         }

//         console.log('User signed in:', userCredential.user);
//         return token;
//     } catch (error) {
//         console.error('Error signing in:', error);
//         throw error; // Make sure to throw the error
//     }
// };

// // Update other functions similarly
// const signUp = async ({userID, name, email, password}) => {
//     try {
//         const currentAuth = verifyAuth();
//         const userCredential = await createUserWithEmailAndPassword(currentAuth, email, password);
//         // ... rest of your signUp code
//     } catch (error) {
//         console.error('Error signing up:', error);
//         throw error;
//     }
// };

// const logout = async () => {
//     try {
//         const currentAuth = verifyAuth();
//         await signOut(currentAuth);
//         console.log('User signed out');
//     } catch (error) {
//         console.error('Error signing out:', error);
//         throw error;
//     }
// };

// export { signUp, signIn, logout };
