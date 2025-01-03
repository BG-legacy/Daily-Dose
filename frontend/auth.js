const auth = require("./firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = require("firebase/auth");

const signUp = async ({userID, name, email, password}) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created:', userCredential.user.uid);
        const creation = new Date().toISOString();
        const item = {userID: userID, name:name, email: email, password:password}

        const response = await fetch('http://localhost:3002/api/newUser', {
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
    }
};


const signIn = async ({email, password}) => {
    // TODO: send credentials to backend to store in database
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      const response = await fetch('http://localhost:3002/api/loginUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });



      console.log('User signed in:', userCredential.user);
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
    }
};

module.exports = { signUp, signIn, logout };