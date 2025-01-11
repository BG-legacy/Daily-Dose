import dotenv from 'dotenv';
dotenv.config();
import path from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });
import { useState } from 'react';

// TODO: use useState hooks for login and logout :)


import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  getIdToken } from "firebase/auth";


  
const firebaseConfig = {
    apiKey: process.env.LOCAL_FIREBASE_API_KEY,
    authDomain: process.env.LOCAL_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.LOCAL_FIREBASE_PROJECT_ID,
    storageBucket: process.env.LOCAL_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.LOCAL_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.LOCAL_FIREBASE_APP_ID,
    measurementId: process.env.LOCAL_FIREBASE_MEASUREMENT_ID
};

  
  
// initialize firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
  
const useAuth = () => {
  const [userID, setUserID] = useState(null);
  // have a loading state to track when an auth operation is in progress

  const signUp = async ({userID, name, email, password}) => {
    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.uid);
        const creation = new Date().toISOString();
        const item = {userID: userID, name:name, email: email, password:password}

        const response = await fetch('http://localhost:3011/newUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });

        

        if(!response.ok){
          const responseText = await response.text();
          throw new Error(`Failed to create user in database: ${responseText}`);

        }
    

        console.log('User signed up');
    } catch (error) {
        console.error('Error signing up:', error.message);
        throw error;
    }
  };

  //TODO: once signed in, navigate to account page
  const signIn = async ({email, password}) => {
      try {

        console.log('Signing in with email:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await getIdToken(userCredential.user);
        

        const response = await fetch('http://localhost:3001/home', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to log in');
        }

        // TODO: send userID back to frontend
        const { userID } = data;
        console.log('retrieved user:', userID);

        setUserID(userID);

        console.log('User signed in');
        return token;
      } catch (error) {
        console.error('Error signing in:', error.message);
      }
  };


  const logout = async () => {
      try {
        await signOut(auth);
        console.log('User signed out');
        setUserID(null);
      } catch (error) {
        console.error('Error signing out:', error.message);
        throw error;
      }
  };

// export { signUp, signIn, logout };
  return { signUp, signIn, logout, userID };

};
export default useAuth;