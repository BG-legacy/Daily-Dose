const request = require('supertest');
const express = require('express');
const router = require('../src/api/home'); // Adjust to your router file path

const app = express();
app.use(router);

describe('User Routes', () => {
    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/newUser')
            .send({
                userID: 'testuser72',
                name: 'Test User',
                email: 'testuser72@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200); // Expect a successful response
        expect(response.body).toHaveProperty('message', 'User signed up successfully');
    });

    it('should log in an existing user', async () => {
        const response = await request(app)
            .post('/api/loginUser')
            .send({
                email: 'testuser72@example.com',
                password: 'password123',
            });

        expect(response.status).toBe(200); // Expect a successful response
        expect(response.body).toHaveProperty('message', 'User logged in successfully');
    });

    it('should return error for missing fields', async () => {
        const response = await request(app)
            .post('/api/loginUser')
            .send({
                email: 'testuser72@example.com',
            });

        expect(response.status).toBe(400); // Expect a bad request response
        expect(response.body).toHaveProperty('error', 'Missing required fields');
    });
});
