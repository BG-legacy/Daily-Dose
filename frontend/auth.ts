import firebase from 'firebase-admin';
import { initializeApp } from 'firebase-admin/app';
import 'firebase-admin/auth';
import { getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged as firebaseOnAuthStateChanged, 
  User, 
  getIdToken } from 'firebase/auth';

// firebase configuration
const serviceAccount = require('../frontend/firebase.config.json');

// initialize firebase
if(!firebase.apps.length) {
  firebase.initializeApp(serviceAccount);
} else {
  firebase.app()
}
const auth = getAuth();

// sign up a user
export const signUp = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;
    console.log("User signed up:", user);
    return user;
  }catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};


// sign in 
export const signIn = async(email: string, password: string): Promise<User | null> => {
  try {
    const userCredentials = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredentials.user;
    console.log("User signed in:", user);
    return user;

  } catch(error) {
    console.error("Error signing in:", error);
    throw new Error("error signing in ")
  }
};

// sign out
export const signOut = async(): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log('User signed out');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};


// get firebase id token for backend
export const getToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if(user) {
    const token = await getIdToken(user);
    console.log("Firebase token:", token);
    return token;
  } else {
    throw new Error('No user signed in');
  }
};

module.exports = {getToken, signOut, signIn, signUp}