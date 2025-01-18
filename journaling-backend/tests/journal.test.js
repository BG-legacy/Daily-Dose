const UserManager = require('../src/utils/dynamoDB');
const JournalManager = require('../src/utils/journalsTable');
const OpenAIService = require('../src/utils/openAI');
require('dotenv').config();

// Increase timeout for OpenAI calls
jest.setTimeout(30000);

describe('Journal Feature', () => {
    let userDB;
    let journalsDB;
    let openAIService;
    let testUser;
    let journalIds = [];
    
    const testThoughts = [
        "Today was challenging but productive. I managed to complete my major tasks despite feeling overwhelmed at times.",
        "Had a great breakthrough at work today! Everything seemed to flow naturally and I feel energized.",
        "Feeling a bit anxious about tomorrow's presentation, but I've practiced it 5 times already."
    ];

    beforeAll(async () => {
        // Initialize services
        userDB = new UserManager();
        journalsDB = new JournalManager();
        openAIService = new OpenAIService();

        // Verify AWS Configuration
        const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'OPENAI_API_KEY'];
        requiredEnvVars.forEach(varName => {
            expect(process.env[varName]).toBeDefined();
        });

        // Verify DynamoDB access
        await expect(journalsDB.verifyTableAccess()).resolves.not.toThrow();
    });

    beforeEach(async () => {
        // Create test user
        testUser = {
            UserID: `test-user-${Date.now()}`,
            Name: "Test User",
            Email: `test-${Date.now()}@example.com`,
            CreationDate: new Date().toISOString()
        };
        await userDB.addUser(testUser);
    });

    afterEach(async () => {
        // Cleanup test data
        for (const journalId of journalIds) {
            try {
                await journalsDB.deleteJournalEntry(journalId);
            } catch (error) {
                console.warn(`Warning: Could not delete journal entry ${journalId}`);
            }
        }
        try {
            await userDB.deleteUser(testUser.UserID);
        } catch (error) {
            console.warn(`Warning: Could not delete test user ${testUser.UserID}`);
        }
        journalIds = []; // Reset for next test
    });

    test('should create and validate journal entry', async () => {
        const aiInsights = await openAIService.generateInsights(testThoughts[0]);
        
        // Create journal entry with Content (like in manual test)
        const journalEntry = {
            UserID: testUser.UserID,
            Content: testThoughts[0],  // Using Content for creation
            Mood: aiInsights.mood,
            MoodIntensity: aiInsights.intensity,
            Quote: aiInsights.quote,
            MentalHealthTip: aiInsights.mentalHealthTip,
            Hack: aiInsights.productivityHack,
            Timestamp: new Date().toISOString()
        };

        const savedEntry = await journalsDB.addJournalEntry(journalEntry);
        expect(savedEntry).toHaveProperty('id');
        journalIds.push(`${testUser.UserID}#${journalEntry.Timestamp}`); // Match manual test ID format

        // Retrieve and verify entry using Thoughts (like in manual test)
        const retrievedEntry = await journalsDB.getJournalEntry(journalIds[0]);
        expect(retrievedEntry).toBeDefined();
        expect(retrievedEntry.Thoughts).toBe(testThoughts[0]); // Using Thoughts for retrieval
    });

    test('should handle multiple journal entries', async () => {
        // Create entries sequentially to maintain order
        const createdEntries = [];
        const timestamps = [];
        
        for (let i = 0; i < testThoughts.length; i++) {
            const thought = testThoughts[i];
            
            // Generate AI insights
            const aiInsights = await openAIService.generateInsights(thought);
            
            // Create timestamp with increasing values to ensure proper ordering
            const timestamp = new Date(Date.now() + i * 1000).toISOString();
            timestamps.push(timestamp);
            
            const entry = {
                UserID: testUser.UserID,
                Content: thought,
                Mood: aiInsights.mood,
                MoodIntensity: aiInsights.intensity,
                Quote: aiInsights.quote,
                MentalHealthTip: aiInsights.mentalHealthTip,
                Hack: aiInsights.productivityHack,
                Timestamp: timestamp
            };
            
            const savedEntry = await journalsDB.addJournalEntry(entry);
            journalIds.push(`${testUser.UserID}#${timestamp}`);
            createdEntries.push(savedEntry);
        }

        expect(createdEntries).toHaveLength(testThoughts.length);

        // Get history and verify order
        const history = await journalsDB.getUserJournalEntries(testUser.UserID);
        expect(history).toHaveLength(testThoughts.length);

        // Sort history by timestamp to ensure correct order
        const sortedHistory = history.sort((a, b) => 
            new Date(a.CreationDate).getTime() - new Date(b.CreationDate).getTime()
        );

        // Verify content matches in order
        sortedHistory.forEach((entry, index) => {
            expect(entry.Thoughts).toBe(testThoughts[index]);
            expect(entry.CreationDate).toBe(timestamps[index]);
        });
    });

    test('should delete journal entry', async () => {
        const aiInsights = await openAIService.generateInsights(testThoughts[0]);
        const entry = {
            UserID: testUser.UserID,
            Content: testThoughts[0],  // Using Content for creation
            Mood: aiInsights.mood,
            MoodIntensity: aiInsights.intensity,
            Quote: aiInsights.quote,
            MentalHealthTip: aiInsights.mentalHealthTip,
            Hack: aiInsights.productivityHack,
            Timestamp: new Date().toISOString()
        };

        const savedEntry = await journalsDB.addJournalEntry(entry);
        journalIds.push(`${testUser.UserID}#${entry.Timestamp}`);

        const deleteResult = await journalsDB.deleteJournalEntry(journalIds[0]);
        expect(deleteResult).toHaveProperty('message');

        const history = await journalsDB.getUserJournalEntries(testUser.UserID);
        expect(history).toHaveLength(0);
    });
}); 