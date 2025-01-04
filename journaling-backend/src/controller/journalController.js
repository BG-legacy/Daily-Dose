const Database = require('../utils/dynamoDB');
const OpenAIService = require('../utils/openAI');
const db = new Database();

const journalController = {
    async addThought(req, res) {
        try {
            const { thought } = req.body;
            const userID = req.user.UserID; // Assuming auth middleware adds user to req

            if (!thought) {
                return res.status(400).json({ error: 'Thought content is required' });
            }

            // Get AI-generated insights
            const aiInsights = await OpenAIService.generateInsights(thought);
            // divide this into 3


            //call get user by email function


            // send ai insights back to user


            // Save thought and insights to database
            const journalEntry = {
                UserID: userID,
                Timestamp: new Date().toISOString(),
                Content: thought,
                AIInsights: aiInsights
            };

            // You'll need to implement this method in your Database class
            await db.addJournalEntry(journalEntry);

            return res.status(201).json({
                message: 'Journal entry saved successfully',
                insights: aiInsights
            });
        } catch (error) {
            console.error('Error saving journal entry:', error);
            return res.status(500).json({ error: 'Failed to save journal entry' });
        }
    },

    async getHistory(req, res) {
        try {
            const userID = req.user.UserID;
            // You'll need to implement this method in your Database class
            const entries = await db.getUserJournalEntries(userID);
            return res.status(200).json(entries);
        } catch (error) {
            console.error('Error fetching journal history:', error);
            return res.status(500).json({ error: 'Failed to fetch journal history' });
        }
    },

    async getThought(req, res) {
        try {
            const { thoughtId } = req.params;
            const userID = req.user.UserID;
            
            // You'll need to implement this method in your Database class
            const entry = await db.getJournalEntry(userID, thoughtId);
            
            if (!entry) {
                return res.status(404).json({ error: 'Journal entry not found' });
            }
            
            return res.status(200).json(entry);
        } catch (error) {
            console.error('Error fetching journal entry:', error);
            return res.status(500).json({ error: 'Failed to fetch journal entry' });
        }
    },

    async deleteThought(req, res) {
        try {
            const { thoughtId } = req.params;
            const userID = req.user.UserID;
            
            // You'll need to implement this method in your Database class
            const result = await db.deleteJournalEntry(userID, thoughtId);
            
            if (!result.success) {
                return res.status(404).json({ error: 'Journal entry not found' });
            }
            
            return res.status(200).json({ message: 'Journal entry deleted successfully' });
        } catch (error) {
            console.error('Error deleting journal entry:', error);
            return res.status(500).json({ error: 'Failed to delete journal entry' });
        }
    }
};

module.exports = journalController;

// const authenticateToken = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];
//     if (!token) return res.sendStatus(401); // No token provided
  
//     jwt.verify(token, 'your_secret_key', (err, decoded) => {
//       if (err) return res.sendStatus(403); // Invalid token
//       req.userID = decoded.userID; // Add userID to request object
//       next();
//     });
//   };