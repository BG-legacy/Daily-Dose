/**
 * MongoDB Mood Manager
 * Handles all mood-related operations using MongoDB
 */

const Mood = require('../models/Mood');
const mongoConnection = require('./mongodb');
const { trackDatabaseOperation } = require('./performance');

/**
 * MoodManager Class
 * Manages mood-related operations in MongoDB
 */
class MoodManager {
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
     * Add or update a mood entry for the current day
     * @param {Object} moodData - Mood data
     * @param {string} moodData.UserID - User's unique identifier
     * @param {string} moodData.Content - Mood value (happy, sad, upset)
     * @returns {Promise<Object>} Created or updated mood entry
     */
    async addMood(moodData) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            // Get current date and normalize to start of day
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timestamp = new Date(`${dateStr}T00:00:00.000Z`);

            const moodEntry = {
                UserID: moodData.UserID,
                Content: moodData.Content.toLowerCase(),
                Timestamp: timestamp,
                Type: 'MOOD',
                CreationDate: now
            };

            // Try to update existing entry for today, or create new one
            const existingMood = await Mood.findOne({
                UserID: moodData.UserID,
                Timestamp: timestamp
            });

            let result;
            let wasUpdated = false;

            if (existingMood) {
                // Update existing mood
                result = await Mood.findOneAndUpdate(
                    { UserID: moodData.UserID, Timestamp: timestamp },
                    { 
                        $set: { 
                            Content: moodData.Content.toLowerCase(),
                            CreationDate: now 
                        }
                    },
                    { new: true, runValidators: true }
                ).lean();
                wasUpdated = true;
                
                const duration = Date.now() - startTime;
                trackDatabaseOperation('updateMood', duration);
            } else {
                // Create new mood entry
                const mood = new Mood(moodEntry);
                result = await mood.save();
                result = result.toObject();
                
                const duration = Date.now() - startTime;
                trackDatabaseOperation('addMood', duration);
            }

            return { ...result, wasUpdated };
        } catch (error) {
            const duration = Date.now() - startTime;
            trackDatabaseOperation('addMood_error', duration);
            console.error("Error adding/updating mood:", error);
            throw error;
        }
    }

    /**
     * Get weekly mood summary for a user
     * @param {string} userID - User's unique identifier
     * @returns {Promise<Object>} Weekly mood data formatted for chart
     */
    async getWeeklyMoodSummary(userID) {
        const startTime = Date.now();
        try {
            await this.ensureConnection();

            // Calculate start and end of current week (Sunday to Saturday)
            const now = new Date();
            const currentDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday

            const startOfWeek = new Date(now);
            startOfWeek.setUTCDate(now.getUTCDate() - currentDay);
            startOfWeek.setUTCHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
            endOfWeek.setUTCHours(23, 59, 59, 999);

            // Fetch mood entries for the week
            const moodEntries = await Mood.find({
                UserID: userID,
                Type: 'MOOD',
                Timestamp: {
                    $gte: startOfWeek,
                    $lte: endOfWeek
                }
            })
            .sort({ Timestamp: 1 })
            .lean();

            // Define mood value mappings for chart
            const moodValues = {
                'happy': 3,  // Top position (yellow)
                'sad': 2,    // Middle position (blue)
                'upset': 1   // Bottom position (red)
            };

            // Generate arrays for each day of the week
            // Use UTC dates consistently to avoid timezone issues
            const days = [];
            const dayLabels = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setUTCDate(startOfWeek.getUTCDate() + i);
                // Format as YYYY-MM-DD using UTC methods to avoid timezone conversion
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
                days.push(dateStr);
                dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }));
            }

            // Map mood entries to each day
            // Compare dates in UTC to match how they're stored
            const moodData = days.map(day => {
                const dayMood = moodEntries.find(entry => {
                    const entryDate = new Date(entry.Timestamp);
                    const entryYear = entryDate.getUTCFullYear();
                    const entryMonth = String(entryDate.getUTCMonth() + 1).padStart(2, '0');
                    const entryDay = String(entryDate.getUTCDate()).padStart(2, '0');
                    const entryDateStr = `${entryYear}-${entryMonth}-${entryDay}`;
                    return entryDateStr === day;
                });
                return dayMood ? moodValues[dayMood.Content] || null : null;
            });

            console.log('Weekly Mood Data:', {
                startOfWeek: startOfWeek.toISOString(),
                endOfWeek: endOfWeek.toISOString(),
                entries: moodEntries.map(e => ({
                    Content: e.Content,
                    Timestamp: e.Timestamp,
                    DateStr: `${new Date(e.Timestamp).getUTCFullYear()}-${String(new Date(e.Timestamp).getUTCMonth() + 1).padStart(2, '0')}-${String(new Date(e.Timestamp).getUTCDate()).padStart(2, '0')}`
                })),
                days: days,
                moodData
            });

            const duration = Date.now() - startTime;
            trackDatabaseOperation('getWeeklyMoodSummary', duration);

            return {
                labels: dayLabels,  // Day labels (Sun, Mon, etc.)
                data: moodData      // Numerical mood values (3, 2, 1, or null)
            };
        } catch (error) {
            console.error("Error getting weekly mood summary:", error);
            const duration = Date.now() - startTime;
            trackDatabaseOperation('getWeeklyMoodSummary_error', duration);
            throw error;
        }
    }
}

module.exports = MoodManager;

