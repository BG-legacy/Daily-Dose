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
        const { content } = req.body;
        
        // Validate mood content
        const validMoods = ['happy', 'sad', 'upset'];
        if (!validMoods.includes(content.toLowerCase())) {
            throw new Error('Invalid mood value');
        }

        if (!req.user || !req.user.uid) {
            throw new Error('User not authenticated');
        }
        
        const moodManager = new MoodManager();
        const result = await moodManager.addMood({
            UserID: req.user.uid,
            Content: content.toLowerCase()
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating mood entry:', error);
        const status = error.message === 'User not authenticated' ? 401 :
                      error.message === 'Invalid mood value' ? 400 : 500;
        res.status(status).json({ error: error.message });
    }
});

// GET /api/mood/summary/weekly - Get weekly mood summary
router.get('/summary/weekly', async (req, res) => {
    console.log('Received weekly mood summary request'); // Debug log
    try {
        if (!req.user || !req.user.uid) {
            console.log('User not authenticated:', req.user); // Debug log
            throw new Error('User not authenticated');
        }
        const userID = req.user.uid;
        console.log('Fetching mood summary for user:', userID); // Debug log
        
        const moodManager = new MoodManager();
        const weeklyMoods = await moodManager.getWeeklyMoodSummary(userID);
        
        console.log('Weekly moods response:', weeklyMoods); // Debug log
        res.json(weeklyMoods);
    } catch (error) {
        console.error('Error fetching weekly mood summary:', error);
        res.status(error.message === 'User not authenticated' ? 401 : 500)
           .json({ error: error.message || 'Failed to fetch mood summary' });
    }
});

// TODO: Implement these route handlers
app.post('/inputMood')
app.get('/view-mood-chart')

module.exports = router;