/**
 * MongoDB Journal Manager
 * Handles all journal-related operations using MongoDB
 */

const Journal = require('../models/Journal');
const mongoConnection = require('./mongodb');
const { trackDatabaseOperation } = require('./performance');

/**
 * JournalManager Class
 * Handles all journal-related operations in MongoDB
 */
class JournalManager {
    constructor() {
        // Connection will be ensured by each method when needed
    }

    /**
     * Ensure MongoDB connection is established
     */
    async ensureConnection() {
        try {
            if (!mongoConnection.isHealthy()) {
                await mongoConnection.connect();
            }
        } catch (error) {
            console.error('Failed to establish MongoDB connection:', error);
            throw error; // Re-throw to propagate the error
        }
    }

    /**
     * Verify access to the journals collection
     * @returns {Promise<boolean>} True if access is verified
     */
    async verifyTableAccess() {
        const startTime = Date.now();
        try {
            await this.ensureConnection();
            // Simple ping to verify connection
            await Journal.findOne({}).limit(1);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('verifyTableAccess', duration);
            return true;
        } catch (error) {
            console.error('MongoDB Access Error:', error.message);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('verifyTableAccess_error', duration);
            throw new Error('Unable to access journals collection');
        }
    }

    /**
     * Add a new journal entry
     * @param {Object} journalData - Journal entry data
     * @param {string} journalData.UserID - User's unique identifier
     * @param {string} journalData.Content - Journal entry content
     * @param {string} journalData.Quote - AI-generated quote
     * @param {string} journalData.MentalHealthTip - AI-generated mental health tip
     * @param {string} journalData.Hack - AI-generated productivity hack
     * @param {string} [journalData.Timestamp] - Entry creation timestamp
     * @returns {Promise<Object>} Created journal entry
     */
    async addJournalEntry(journalData) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const creationDate = journalData.Timestamp || new Date();
            
            const journal = new Journal({
                UserID: journalData.UserID,
                Content: journalData.Content,
                Quote: journalData.Quote || '',
                MentalHealthTip: journalData.MentalHealthTip || '',
                Hack: journalData.Hack || '',
                CreationDate: creationDate,
                Type: 'JOURNAL'
            });

            const savedJournal = await journal.save();
            const duration = Date.now() - startTime;
            trackDatabaseOperation('addJournalEntry', duration);

            return {
                ...savedJournal.toObject(),
                id: `${savedJournal.UserID}#${savedJournal.CreationDate.toISOString()}`
            };
        } catch (error) {
            console.error("Error adding journal entry:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('addJournalEntry_error', duration);
            throw error;
        }
    }

    /**
     * Get all journal entries for a user
     * @param {string} userID - User's unique identifier
     * @returns {Promise<Array>} List of journal entries
     * @throws {Error} If userID is not provided
     */
    async getUserJournalEntries(userID) {
        const startTime = Date.now();
        if (!userID) {
            throw new Error('UserID is required');
        }

        try {
            await this.ensureConnection();

            console.log('Fetching entries for userID:', userID);
            
            const entries = await Journal.find({ 
                UserID: userID,
                Type: 'JOURNAL'
            })
            .sort({ CreationDate: -1 })
            .lean();

            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUserJournalEntries', duration);

            return entries.map(item => ({
                ...item,
                Content: item.Content || item.Thoughts,
                id: `${item.UserID}#${new Date(item.CreationDate).toISOString()}`
            }));
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getUserJournalEntries_error', duration);
            throw error;
        }
    }

    /**
     * Get a specific journal entry
     * @param {string} compositeId - Composite ID (userID#timestamp)
     * @returns {Promise<Object|null>} Journal entry or null if not found
     */
    async getJournalEntry(compositeId) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            let userID, creationDate;
            
            if (compositeId.includes('#')) {
                [userID, creationDate] = compositeId.split('#');
            } else {
                // If no timestamp provided, get the latest entry for this user
                const entries = await this.getUserJournalEntries(compositeId);
                if (!entries || entries.length === 0) {
                    const duration = Date.now() - startTime;
                    trackDatabaseOperation('getJournalEntry_notFound', duration);
                    return null;
                }
                return entries[0];
            }

            console.log('Getting journal entry with params:', {
                UserID: userID,
                CreationDate: creationDate
            });

            const entry = await Journal.findOne({
                UserID: userID,
                CreationDate: new Date(creationDate),
                Type: 'JOURNAL'
            }).lean();

            const duration = Date.now() - startTime;
            
            if (!entry) {
                trackDatabaseOperation('getJournalEntry_notFound', duration);
                return null;
            }

            trackDatabaseOperation('getJournalEntry', duration);
            return {
                ...entry,
                id: `${userID}#${new Date(entry.CreationDate).toISOString()}`
            };
        } catch (error) {
            console.error("Error fetching journal entry:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getJournalEntry_error', duration);
            throw error;
        }
    }

    /**
     * Delete a journal entry
     * @param {string} compositeId - Composite ID (userID#timestamp)
     * @returns {Promise<Object>} Result of deletion operation
     */
    async deleteJournalEntry(compositeId) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const [userID, creationDate] = compositeId.split('#');

            const deletedEntry = await Journal.findOneAndDelete({
                UserID: userID,
                CreationDate: new Date(creationDate),
                Type: 'JOURNAL'
            });

            const duration = Date.now() - startTime;
            trackDatabaseOperation('deleteJournalEntry', duration);

            return {
                success: !!deletedEntry,
                message: deletedEntry ? 'Journal entry deleted successfully' : 'No journal entry found'
            };
        } catch (error) {
            console.error("Error deleting journal entry:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('deleteJournalEntry_error', duration);
            throw error;
        }
    }

    /**
     * Get journal entries within a date range
     * @param {string} userID - User's unique identifier
     * @param {Date} startDate - Start of date range
     * @param {Date} endDate - End of date range
     * @returns {Promise<Array>} List of journal entries
     */
    async getEntriesInDateRange(userID, startDate, endDate) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            const entries = await Journal.find({
                UserID: userID,
                Type: 'JOURNAL',
                CreationDate: {
                    $gte: startDate,
                    $lte: endDate
                }
            })
            .sort({ CreationDate: -1 })
            .lean();

            const duration = Date.now() - startTime;
            trackDatabaseOperation('getEntriesInDateRange', duration);
            
            return entries || [];
        } catch (error) {
            console.error("Error fetching entries in date range:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getEntriesInDateRange_error', duration);
            throw error;
        }
    }
}

module.exports = JournalManager;

