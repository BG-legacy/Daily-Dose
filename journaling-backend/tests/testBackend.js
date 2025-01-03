const axios = require('axios');
const Database = require('../src/utils/dynamoDB')
const db = new Database();
async function testNewUser() {
    try {
        const response = await axios.post('http://localhost:3000/newUser', {
            userID: 'test1',
            email: 'testuser1@test.com',
            password: 'hellofriend',
            name: 'Test User1'
        });
        
        // email and password is specifically used for auth
        await db.addUser(response);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const person = await db.getUser(response.data.userID);
        if(person) {
            console.log('user found:', person);
        } else {
            console.log('user not found');
        }

        console.log('new user response:', response.data);
    } catch(error) {
        console.error('error:', error.message);
    }
}


async function testLogin() {
    try {
        const response = await axios.get('http://localhost:3000/loginUser', {
            email: 'testuser1@test.com',
            password: 'hellofriend'
        });

        console.log('login user response:', response.data)
        // i would need to get their userID

    } catch(error) {
        console.error('error:', error.message);
    }   
}

async function runTests() {
    await testNewUser();
    await testLogin();
}
  
runTests();