const userDB = require('../utils/dynamoDB');
const journalsDB = require('../utils/journalsTable');
const OpenAIService = require('../utils/openAI');

// Initialize services
const openAIService = new OpenAIService();
const userManager = new userDB();
const journalManager = new journalsDB();

/**
 * Journal Controller
 * Handles business logic for journal operations
 */
const journalController = {
    /**
     * Creates a new journal entry with AI-generated insights
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.thought - Journal entry content
     * @param {Object} req.user - Authenticated user object
     * @param {Object} res - Express response object
     * @returns {Promise<Object>} Created journal entry with insights
     */
    async addThought(req, res) {
        try {
            const { thought } = req.body;

            // Validate input
            if (!thought) {
                return res.status(400).json({ error: 'Thought content is required' });
            }

            // Generate AI insights
            const aiInsights = await openAIService.generateInsights(thought);
            
            // Get user ID from auth middleware
            const userID = req.user.uid;
            
            // Prepare journal entry
            const journalEntry = {
                UserID: userID,
                Content: thought,
                Quote: aiInsights.quote,
                MentalHealthTip: aiInsights.mentalHealthTip,
                Hack: aiInsights.productivityHack,
                Timestamp: new Date().toISOString()
            };

            // Save to database
            await journalManager.addJournalEntry(journalEntry);

            return res.status(201).json({
                message: 'Journal entry saved successfully',
                insights: aiInsights
            });
        } catch (error) {
            console.error('Error saving journal entry:', error);
            return res.status(500).json({ error: 'Failed to save journal entry' });
        }
    },

    /**
     * Retrieves all journal entries for the authenticated user
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {Object} res - Express response object
     * @returns {Promise<Array>} List of journal entries
     */
    async getHistory(req, res) {
        try {
            const userID = req.user.uid;
            
            if (!userID) {
                console.log('Missing userID in request:', req.user);
                return res.status(400).json({ error: 'User ID is required' });
            }

            console.log('Fetching history for userID:', userID);
            const entries = await journalManager.getUserJournalEntries(userID);
            return res.status(200).json(entries);
        } catch (error) {
            console.error('Error fetching journal history:', error);
            return res.status(500).json({ error: 'Failed to fetch journal history' });
        }
    },

    /**
     * Retrieves a specific journal entry
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.thoughtId - Journal entry ID
     * @param {Object} req.user - Authenticated user object
     * @param {Object} res - Express response object
     * @returns {Promise<Object>} Journal entry with insights
     */
    async getThought(req, res) {
        try {
            const { thoughtId } = req.params;
            console.log('Fetching thought:', thoughtId);
            
            // Extract userID from composite key
            const [userID] = thoughtId.split('#');
            
            // Security check: verify user owns the entry
            if (userID !== req.user.uid) {
                console.log('Unauthorized access attempt:', { 
                    requestUser: req.user.uid, 
                    entryUser: userID 
                });
                return res.status(403).json({ error: 'Unauthorized access to journal entry' });
            }

            const entry = await journalManager.getJournalEntry(thoughtId);
            console.log('Retrieved entry:', entry);
            
            if (!entry) {
                return res.status(404).json({ error: 'Journal entry not found' });
            }
            
            return res.status(200).json({
                id: thoughtId,
                UserID: entry.UserID,
                Content: entry.Content,
                CreationDate: entry.CreationDate,
                Quote: entry.Quote,
                MentalHealthTip: entry.MentalHealthTip,
                Hack: entry.Hack
            });
        } catch (error) {
            console.error('Error fetching journal entry:', error);
            return res.status(500).json({ error: 'Failed to fetch journal entry' });
        }
    },

    /**
     * Deletes a specific journal entry
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.thoughtId - Journal entry ID
     * @param {Object} res - Express response object
     * @returns {Promise<Object>} Success message
     */
    async deleteThought(req, res) {
        try {
            const { thoughtId } = req.params;
            const result = await journalManager.deleteJournalEntry(thoughtId);
            
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

/**
 * Security Features:
 * 1. User authentication verification
 * 2. Entry ownership validation
 * 3. Input validation
 * 4. Error handling
 * 
 * Data Flow:
 * 1. Request validation
 * 2. User authentication
 * 3. Business logic
 * 4. Database operation
 * 5. Response formatting
 * 
 * Integration Points:
 * 1. OpenAI service for insights
 * 2. DynamoDB for storage
 * 3. Authentication middleware
 * 4. Frontend API client
 */
