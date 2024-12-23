const request = require('supertest')
const express = require('express');
const Database = require('../src/utils/dynamoDB.js');
const sum = require('../src/api/home.js')

let server;

// mock database
jest.mock('../src/utils/dynamoDB.js');

const app = express();
app.use(express.json())

// mocked database instance
const mockDatabase = new Database('Dosers');

beforeAll(() => {
    server = app.listen(3001);
});

app.post('/add-user', async(req, res) => {
    const { userID, name, email } = req.body;
    const creation = new Date().toISOString();

    try {
        const result = await mockDatabase.addUser(userID, creation, name, email);
        if(result.success) {
            res.status(200).json({ message: 'User added successfully!'});
        } else {
            res.status(500).json({ error: result.message });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'});
    }
});


// testing
describe('API Tests', () => {
    test('POST /add-user - Success', async() => {

        //mock successful response
        mockDatabase.addUser.mockResolvedValue({ success: true });

        const response = await request(app)
            .post('/add-user')
            .send({
                userID: 'test1',
                name: 'Test One',
                email: 'test@one.com',
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User added successfully!');
    });

    test('POST /add-user - Failure', async () => {
        // when the userID is already in the database
        // Mock failure response
        mockDatabase.addUser.mockResolvedValue({ success: false, message: 'Error adding user.' });

        const response = await request(app)
            .post('/add-user')
            .send({
                userID: 'user123',
                name: 'John Doe',
                email: 'john@example.com',
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Error adding user.');
    });

    // test('POST /add-user - User ID already exists', async () => {
    //     // Mock the database's `get` method to simulate that the user already exists
    //     mockDatabase.addUser.mockImplementation(async (userID, creationDate, name, email) => {
    //         // Simulating that userID already exists
    //         if (userID === 'user123') {
    //             return { success: false, message: 'User ID already exists' };
    //         }

    //         // Otherwise proceed with adding the user (simulated)
    //         return { success: true, message: 'User added successfully' };
    //     });

    //     const response = await request(app)
    //         .post('/add-user')
    //         .send({
    //             userID: 'user123', // Simulated existing user ID
    //             name: 'John Doe',
    //             email: 'john@example.com',
    //         });

    //     expect(response.status).toBe(500); // You can change this to 400 or 409 for conflict
    //     expect(response.body.error).toBe('User ID already exists');
    // });



    test('POST /add-user - User ID already exists', async () => {
        // Mock the database's `get` method to simulate that the user already exists
        mockDatabase.addUser.mockImplementation(async (userID, creationDate, name, email) => {
            // Simulating that userID already exists
            if (userID === 'user123') {
                return { success: false, message: 'User ID already exists' };
            }
    
            // Otherwise proceed with adding the user (simulated)
            return { success: true, message: 'User added successfully' };
        });
    
        const response = await request(app)
            .post('/add-user')
            .send({
                userID: 'user123', // Simulated existing user ID
                name: 'John Doe',
                email: 'john@example.com',
            });
    
        expect(response.status).toBe(500); // You can change this to 400 or 409 for conflict
        expect(response.body.error).toBe('User ID already exists');
    });
    
});



afterAll(() => {
    server.close();
})