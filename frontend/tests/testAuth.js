// import useAuth from '../auth.js';
// // this should simulate a react env

// const {userID, signIn, signOut, logout} = useAuth();

// Test sign up with example credentials
// signUp({
//     "userID": "icky9",
//     "name" : "rky9 cot",
//     "email": "ickycot@test89.com",
//     "password": "7844766556"
// });

// signIn({
//     email: 'rickycot@test89.com',
//     password: '7844766556'
// })

//TODO: either separate the logic and make it outside of react


import {render, act} from '@testing-library/react';
import useAuth from '../auth.js';

// mock firebase

