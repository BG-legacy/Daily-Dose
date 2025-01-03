const { signUp, signIn } = require('../auth');

// // Test sign up with example credentials
// signUp({
//     "userID": "ben109000",
//     "name" : "ben10 dave9000",
//     "email": "ben10@test9000.com",
//     "password": "7844766556"
// });

signIn({
    email: 'ben10@test9000.com',
    password: '7844766556'
})
