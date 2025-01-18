const MoodManager = require('../src/utils/moodTable');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

describe('Mood Management Features', () => {
    let moodManager;
    let testUserID;

    beforeAll(() => {
        moodManager = new MoodManager();
        testUserID = `test-user-${Date.now()}`;
    });

    describe('Mood Creation and Retrieval', () => {
        const moodData = [
            { mood: 'happy', daysAgo: 0 },  // today
            { mood: 'sad', daysAgo: 1 },    // yesterday
            { mood: 'anxious', daysAgo: 3 }, 
            { mood: 'excited', daysAgo: 5 },
            { mood: 'stressed', daysAgo: 8 }, // More than a week ago
            { mood: 'sad', daysAgo: 2 },     // Another sad day
        ];

        beforeAll(async () => {
            // Create test moods
            for (const { mood, daysAgo } of moodData) {
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);
                await moodManager.addMood(testUserID, mood, date.toISOString().split('T')[0]);
            }
            // Wait for DynamoDB consistency
            await new Promise(resolve => setTimeout(resolve, 1000));
        });

        test('should create moods with different dates', async () => {
            const allMoods = await moodManager.viewMoodChart(testUserID, 30);
            expect(Object.keys(allMoods).length).toBeGreaterThan(0);
        });

        test('should get correct number of sad moods in last 7 days', async () => {
            const weeklyMood = await moodManager.getMood(testUserID, 7, 'sad');
            expect(weeklyMood.length).toBe(2); // We added 2 sad moods within 7 days
        });

        test('should get correct number of happy moods in last 30 days', async () => {
            const monthlyMood = await moodManager.getMood(testUserID, 30, 'happy');
            expect(monthlyMood.length).toBe(1); // We added 1 happy mood
        });

        test('should generate 7-day mood chart', async () => {
            const moodChart = await moodManager.viewMoodChart(testUserID, 7);
            const chartDates = Object.keys(moodChart);
            
            // Should have entries
            expect(chartDates.length).toBeGreaterThan(0);
            
            // Verify dates are within range
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
            
            chartDates.forEach(date => {
                expect(date >= sevenDaysAgoStr).toBeTruthy();
            });
        });

        test('should generate 30-day mood chart', async () => {
            const moodChart = await moodManager.viewMoodChart(testUserID, 30);
            const chartDates = Object.keys(moodChart);
            
            // Should have entries
            expect(chartDates.length).toBeGreaterThan(0);
            
            // Verify dates are within range
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
            
            chartDates.forEach(date => {
                expect(date >= thirtyDaysAgoStr).toBeTruthy();
            });
        });
    });

    describe('Error Handling', () => {
        test('should throw error for invalid time period', async () => {
            await expect(
                moodManager.viewMoodChart(testUserID, 15)
            ).rejects.toThrow('Invalid time period. Must be 7 or 30.');
        });

        test('should handle non-existent user', async () => {
            const nonExistentUserID = 'non-existent-user';
            const result = await moodManager.getMood(nonExistentUserID, 7, 'happy');
            expect(result).toEqual([]);
        });
    });
}); 