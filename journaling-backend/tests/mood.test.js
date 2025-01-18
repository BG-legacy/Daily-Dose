const MoodManager = require('../src/utils/moodTable');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function testMoodFeatures() {
    console.log('\n🌟 Testing Mood Management Features');
    console.log('================================');

    try {
        // Initialize MoodManager
        const moodManager = new MoodManager();
        const testUserID = `test-user-${Date.now()}`;

        // Test 1: Add different moods with different dates
        console.log('\n1️⃣ Testing mood creation with different dates...');
        const moodData = [
            { mood: 'happy', daysAgo: 0 },  // today
            { mood: 'sad', daysAgo: 1 },    // yesterday
            { mood: 'anxious', daysAgo: 3 }, 
            { mood: 'excited', daysAgo: 5 },
            { mood: 'stressed', daysAgo: 8 }, // More than a week ago
            { mood: 'sad', daysAgo: 2 },     // Another sad day
        ];

        for (const { mood, daysAgo } of moodData) {
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            
            // Override the current date in addMood
            const result = await moodManager.addMood(testUserID, mood, date.toISOString().split('T')[0]);
            console.log(`✅ Added mood: ${mood} for date: ${date.toISOString().split('T')[0]}`);
        }

        // Wait a moment to ensure all entries are saved
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test 2: Get mood frequency (7 days)
        console.log('\n2️⃣ Testing 7-day mood frequency...');
        try {
            const weeklyMood = await moodManager.getMood(testUserID, 7, 'sad');
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            
            console.log('Query parameters:', {
                userID: testUserID,
                timeframe: '7 days',
                mood: 'sad',
                startDate: startDate.toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            });
            console.log('Weekly mood frequency:', {
                mood: 'sad',
                occurrences: weeklyMood.length,
                entries: weeklyMood
            });

            // Add this to see all moods for debugging
            const allMoods = await moodManager.viewMoodChart(testUserID, 7);
            console.log('\nAll moods in the last 7 days:', allMoods);
        } catch (error) {
            console.error('❌ Failed to get weekly mood:', error.message);
        }

        // Test 3: Get mood frequency (30 days)
        console.log('\n3️⃣ Testing 30-day mood frequency...');
        try {
            const monthlyMood = await moodManager.getMood(testUserID, 30, 'happy');
            console.log('Monthly mood frequency:', {
                mood: 'happy',
                occurrences: monthlyMood.length,
                entries: monthlyMood
            });
        } catch (error) {
            console.error('❌ Failed to get monthly mood:', error.message);
        }

        // Test 4: View mood chart
        console.log('\n4️⃣ Testing mood chart generation...');
        try {
            // Test both 7 and 30 day charts
            const periods = [7, 30];
            for (const period of periods) {
                const moodChart = await moodManager.viewMoodChart(testUserID, period);
                console.log(`\nMood chart for ${period} days:`);
                console.log(JSON.stringify(moodChart, null, 2));
            }
        } catch (error) {
            console.error('❌ Failed to generate mood chart:', error.message);
        }

        // Test 5: Error handling
        console.log('\n5️⃣ Testing error handling...');
        try {
            // Test invalid time period
            await moodManager.viewMoodChart(testUserID, 15);
            console.error('❌ Should have thrown error for invalid time period');
        } catch (error) {
            console.log('✅ Successfully caught invalid time period error:', error.message);
        }

        console.log('\n✨ Mood Feature Tests Complete!');

    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
        if (error.message.includes('AccessDenied')) {
            console.error('\n⚠️ AWS Permission Issue:');
            console.error('1. Verify your AWS credentials are correct');
            console.error('2. Ensure your IAM user has the following permissions:');
            console.error('   - dynamodb:PutItem');
            console.error('   - dynamodb:GetItem');
            console.error('   - dynamodb:Query');
        }
        process.exit(1);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testMoodFeatures();
}

module.exports = { testMoodFeatures };
