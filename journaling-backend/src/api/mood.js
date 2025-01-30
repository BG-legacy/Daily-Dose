// route to get mood history that'll be represented as some type of graph or chart
const express = require('express');
const bodyParser = require('body-parser')
const router = express.Router();
const MoodManager = require('../utils/moodTable');

// Initialize Express and add JSON parsing middleware
const app = express();
app.use(bodyParser.json());

// POST /api/mood - Create new mood entry
router.post('/', async (req, res) => {
    try {
        // Extract mood content from request body
        const { content } = req.body;
        
        // Verify user authentication via middleware-injected user object
        if (!req.user || !req.user.uid) {
            throw new Error('User not authenticated');
        }
        const userID = req.user.uid;
        
        // Create new mood entry using MoodManager utility
        const moodManager = new MoodManager();
        const result = await moodManager.addMood({
            UserID: userID,
            Content: content,
            Timestamp: new Date().toISOString() // Store current time in ISO format
        });

        // Return created mood entry with 201 status
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating mood entry:', error);
        // Return appropriate error status: 401 for auth errors, 500 for server errors
        res.status(error.message === 'User not authenticated' ? 401 : 500)
           .json({ error: error.message || 'Failed to create mood entry' });
    }
});

// GET /api/mood/summary/weekly - Get weekly mood summary
router.get('/summary/weekly', async (req, res) => {
    try {
        // Verify user authentication
        if (!req.user || !req.user.uid) {
            throw new Error('User not authenticated');
        }
        const userID = req.user.uid;
        
        // Fetch weekly mood summary from database
        const moodManager = new MoodManager();
        const weeklyMoods = await moodManager.getWeeklyMoodSummary(userID);
        
        // Return mood summary data
        res.json(weeklyMoods);
    } catch (error) {
        console.error('Error fetching weekly mood summary:', error);
        // Return appropriate error status with message
        res.status(error.message === 'User not authenticated' ? 401 : 500)
           .json({ error: error.message || 'Failed to fetch mood summary' });
    }
});

// TODO: Implement these route handlers
app.post('/inputMood')
app.get('/view-mood-chart')

module.exports = router;