const UserManager = require('../utils/userManager');
const JournalManager = require('../utils/journalManager');
const OpenAIService = require('../utils/openAI');

// Initialize services
const openAIService = new OpenAIService();
const userManager = new UserManager();
const journalManager = new JournalManager();

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
            
            // Get all entries for the user
            const entries = await journalManager.getUserJournalEntries(userID);
            
            // Create a Map to deduplicate entries by their composite ID
            const uniqueEntries = new Map();
            
            entries.forEach(entry => {
                // Check if this is a journal entry by verifying required properties
                const isJournalEntry = 
                    entry.Content && // Has content
                    entry.Quote && // Has quote (journal entries have AI insights)
                    entry.MentalHealthTip && // Has mental health tip
                    entry.Hack && // Has productivity hack
                    !entry.MoodRating && // No mood rating
                    !entry.Thoughts && // No thoughts field (used in mood entries)
                    !entry.Mood; // No mood field

                if (isJournalEntry) {
                    const compositeId = `${entry.UserID}#${entry.CreationDate}`;
                    // If we already have this entry, only update if it's newer
                    if (!uniqueEntries.has(compositeId) || 
                        new Date(entry.CreationDate) > new Date(uniqueEntries.get(compositeId).CreationDate)) {
                        uniqueEntries.set(compositeId, entry);
                    }
                }
            });

            // Convert Map back to array and sort by date
            const journalEntries = Array.from(uniqueEntries.values())
                .sort((a, b) => new Date(b.CreationDate) - new Date(a.CreationDate));

            console.log('Filtered journal entries:', journalEntries.length);

            return res.status(200).json(
                journalEntries.map(entry => ({
                    id: `${entry.UserID}#${entry.CreationDate}`,
                    UserID: entry.UserID,
                    Content: entry.Content,
                    CreationDate: entry.CreationDate,
                    Quote: entry.Quote,
                    MentalHealthTip: entry.MentalHealthTip,
                    Hack: entry.Hack
                }))
            );
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
     * @param {string} req.params.userID - User ID
     * @param {string} req.params.timestamp - Entry timestamp
     * @param {Object} req.user - Authenticated user object
     * @param {Object} res - Express response object
     * @returns {Promise<Object>} Journal entry with insights
     */
    async getThought(req, res) {
        try {
            const thoughtId = req.params.userID; // This now contains the full composite ID
            console.log('Fetching thought:', thoughtId);
            
            // Extract userID from the composite key (everything before the first #)
            const userID = thoughtId.split('#')[0];
            
            // Security check: verify user owns the entry
            if (userID !== req.user.uid) {
                console.log('Unauthorized access attempt:', { 
                    requestUser: req.user.uid, 
                    entryUser: userID 
                });
                return res.status(403).json({ error: 'Unauthorized access to journal entry' });
            }

            // Get the entry using the full composite ID
            const entry = await journalManager.getJournalEntry(thoughtId);
            
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
    },

    /**
     * Gets weekly summary of journal entries
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getWeeklySummary(req, res) {
        try {
            const userID = req.user.uid;
            
            // Calculate date range for current week
            const now = new Date();
            console.log('Current date/time on server:', now.toISOString());
            
            // Get today's date string for direct comparison
            const todayStr = now.toISOString().split('T')[0];
            console.log('Today as string:', todayStr);
            
            // Calculate day of week (0 = Sunday, 1 = Monday, etc.)
            const currentDay = now.getDay();
            console.log('Current day of week:', currentDay);
            
            // Calculate start of week (Sunday)
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - currentDay);
            startOfWeek.setHours(0, 0, 0, 0);
            console.log('Start of week:', startOfWeek.toISOString());

            // Calculate end of week (Saturday)
            const endOfWeek = new Date(now);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            console.log('End of week:', endOfWeek.toISOString());

            // Get ALL entries for the week
            const entries = await journalManager.getEntriesInDateRange(userID, startOfWeek, endOfWeek);
            console.log('Found entries:', entries.length);
            
            // Log entry dates for debugging
            entries.forEach(entry => {
                console.log('Entry date:', entry.CreationDate, 'as day string:', entry.CreationDate.split('T')[0]);
            });

            // Format data for response - create array of 7 days (Sun to Sat)
            const days = [];
            
            // Check for each day of the week if there's an entry
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dayStr = date.toISOString().split('T')[0];
                
                // Check if there's an entry for this day
                const hasEntry = entries.some(entry => 
                    entry.CreationDate.split('T')[0] === dayStr
                );
                
                days.push(hasEntry);
                console.log(`Day ${i} (${dayStr}): ${hasEntry ? 'Has entry' : 'No entry'}`);
            }
            
            // Double-check for today's entries specifically
            const todayEntries = entries.filter(entry => 
                entry.CreationDate.split('T')[0] === todayStr
            );
            
            // If we have entries for today but it's not showing in our days array, fix it
            if (todayEntries.length > 0 && !days[currentDay]) {
                console.log(`Found ${todayEntries.length} entries for today but days[${currentDay}] is false. Fixing...`);
                days[currentDay] = true;
            }
            
            console.log('Final weekly summary:', days);

            return res.status(200).json({
                labels: days.map((_, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    return date.toLocaleDateString('en-US', { weekday: 'short' });
                }),
                data: days.map(hasEntry => hasEntry ? 1 : 0), // For the Chart component
                summary: days, // For the Streak component
                debug: {
                    now: now.toISOString(),
                    todayStr,
                    currentDay,
                    startOfWeek: startOfWeek.toISOString(),
                    endOfWeek: endOfWeek.toISOString(),
                    numEntries: entries.length,
                    todayEntries: todayEntries.length
                }
            });
        } catch (error) {
            console.error('Error getting weekly summary:', error);
            return res.status(500).json({ error: 'Failed to get weekly summary' });
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
