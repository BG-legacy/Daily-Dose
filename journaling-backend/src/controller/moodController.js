const moodDB = require('../utils/moodTable')

const moodManager = new moodDB();


// TODO: how can i pass in the logged in user's ID?
const moodController = {
    async inputMood(req, res) {
        try {
            const { mood } = req.body;
            const userID = req.user.UserID; // since it's set with hooks, it can be passed in 
            if (!mood) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const moodEntry = {
                UserID: userID,
                Mood: mood
            };

            await moodManager.addMood(moodEntry);

            return res.status(201).json({ message: 'Mood saved successfully' });
        } catch (error) {
            console.error('Error saving mood:', error);
            return res.status(500).json({ error: 'Failed to save mood' });
        }
    },


    // this gets the entire mood history over 7 or 30 days
    async viewMoodChart(req, res) {
        try {
            const userID = req.user.UserID; // adjust if necessary to get the userID from the state
            const {time}  = req.body; // time range to query the table

            if(![7, 30].includes(time)) {
                return res.status(400).json({ error: 'Invalid time period. Must be 7 or 30 days' });
            }

            const moodHistory = await moodManager.viewMoodChart(userID, time);
            //TODO: this data is to be converted into a chart on the frontend
            return res.status(200).json(moodHistory);
        } catch (error) {
            console.error('Error fetching mood history:', error);
            return res.status(500).json({ error: 'Failed to fetch mood history' });
        }
    }, 

    // input should be one mood, the time range that will be used to query the table
    async getMood(req, res) {
        try {
            const { mood, time } = req.params;
            const userID = req.user.UserID; // adjust if necessary to get the userID from the state
            const moodHistory = await moodManager.getMood(userID, time, mood);
            
            if (!moodHistory) {
                return res.status(404).json({ error: 'Mood entry not found' });
            }
            
            return res.status(200).json(moodHistory);
        } catch (error) {
            console.error('Error fetching mood entry:', error);
            return res.status(500).json({ error: 'Failed to fetch mood entry' });
        }


    }
};