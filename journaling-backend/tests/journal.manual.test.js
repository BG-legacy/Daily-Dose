const UserManager = require('../src/utils/dynamoDB');
const JournalManager = require('../src/utils/journalsTable');
const OpenAIService = require('../src/utils/openAI');

async function verifyAWSConfig() {
    console.log('\n🔍 Verifying AWS Configuration');
    console.log('================================');
    
    // Check environment variables
    const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'OPENAI_API_KEY'];
    requiredEnvVars.forEach(varName => {
        const value = process.env[varName];
        if (!value) {
            throw new Error(`Missing required environment variable: ${varName}`);
        }
        console.log(`✅ ${varName}: ${value.substring(0, 5)}...`);
    });

    // Verify DynamoDB access
    const journalsDB = new JournalManager();
    await journalsDB.verifyTableAccess();
    console.log('✅ DynamoDB access verified');
}

async function testJournalFeature() {
    try {
        console.log('\n🔄 Starting Journal Feature Test');
        console.log('================================');
        
        // Verify AWS configuration first
        await verifyAWSConfig();
        
        // Initialize services
        const userDB = new UserManager();
        const journalsDB = new JournalManager();
        const openAIService = new OpenAIService();

        // Test user data
        const testUser = {
            UserID: `test-user-${Date.now()}`, // Unique test user ID
            Name: "Test User",
            Email: `test-${Date.now()}@example.com`,
            CreationDate: new Date().toISOString()
        };

        // Multiple test thoughts with varying emotional content
        const testThoughts = [
            "Today was challenging but productive. I managed to complete my major tasks despite feeling overwhelmed at times.",
            "Had a great breakthrough at work today! Everything seemed to flow naturally.",
            "Feeling a bit anxious about tomorrow's presentation, but I'm well prepared."
        ];

        console.log('\n1️⃣ Creating test user...');
        await userDB.addUser(testUser);
        console.log('✅ Test user created:', testUser.UserID);

        // Create multiple journal entries
        console.log('\n2️⃣ Creating multiple journal entries...');
        const journalIds = [];
        
        for (const [index, thought] of testThoughts.entries()) {
            console.log(`\n📝 Processing thought ${index + 1}/${testThoughts.length}:`);
            console.log('Content:', thought.substring(0, 50) + '...');
            
            try {
                const aiInsights = await openAIService.generateInsights(thought);
                console.log('✅ AI Insights generated:');
                console.log('- Quote:', aiInsights.quote.substring(0, 50) + '...');
                console.log('- Mental Health Tip:', aiInsights.mentalHealthTip.substring(0, 50) + '...');
                console.log('- Productivity Hack:', aiInsights.productivityHack.substring(0, 50) + '...');

                const journalEntry = {
                    UserID: testUser.UserID,
                    Content: thought,
                    Quote: aiInsights.quote,
                    MentalHealthTip: aiInsights.mentalHealthTip,
                    Hack: aiInsights.productivityHack,
                    Timestamp: new Date().toISOString()
                };

                const savedEntry = await journalsDB.addJournalEntry(journalEntry);
                journalIds.push(`${testUser.UserID}#${journalEntry.Timestamp}`);
                console.log('✅ Journal entry created:', savedEntry.id);
            } catch (error) {
                console.error(`❌ Failed to process thought ${index + 1}:`, error.message);
                throw error;
            }
        }

        // Test getHistory
        console.log('\n3️⃣ Testing getHistory...');
        const history = await journalsDB.getUserJournalEntries(testUser.UserID);
        console.log(`✅ Retrieved ${history.length} journal entries`);
        console.log('\nJournal History Summary:');
        console.log('================================');
        history.forEach((entry, index) => {
            console.log(`\nEntry ${index + 1}:`);
            console.log('ID:', entry.id);
            console.log('Content:', entry.Thoughts.substring(0, 50) + '...');
            console.log('Date:', entry.CreationDate);
        });

        // Test getting single entry
        console.log('\n4️⃣ Testing getJournalEntry...');
        try {
            const singleEntry = await journalsDB.getJournalEntry(journalIds[0]);
            if (singleEntry) {
                console.log('✅ Retrieved single entry');
                console.log('Content:', singleEntry.Thoughts.substring(0, 50) + '...');
            } else {
                console.log('❌ No entry found with ID:', journalIds[0]);
            }
        } catch (error) {
            console.error('❌ Error retrieving entry:', error.message);
        }

        // Test deleting an entry
        console.log('\n5️⃣ Testing deleteJournalEntry...');
        const deleteResult = await journalsDB.deleteJournalEntry(journalIds[0]);
        console.log('✅ Delete result:', deleteResult.message);

        // Verify deletion
        console.log('\n6️⃣ Verifying deletion...');
        const updatedHistory = await journalsDB.getUserJournalEntries(testUser.UserID);
        console.log(`✅ Remaining entries: ${updatedHistory.length}`);
        
        // Data integrity checks
        console.log('\n🔍 Final Verification:');
        console.log('================================');
        console.log(`✅ Original entries: ${journalIds.length}`);
        console.log(`✅ After deletion: ${updatedHistory.length}`);
        console.log(`✅ Difference: ${journalIds.length - updatedHistory.length} (should be 1)`);

        // Enhanced cleanup
        console.log('\n🧹 Cleaning up test data...');
        try {
            for (const journalId of journalIds) {
                await journalsDB.deleteJournalEntry(journalId);
                console.log(`✅ Deleted journal entry: ${journalId}`);
            }
            await userDB.deleteUser(testUser.UserID);
            console.log(`✅ Deleted test user: ${testUser.UserID}`);
        } catch (cleanupError) {
            console.error('⚠️ Cleanup warning:', cleanupError.message);
        }
        console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (error.message.includes('AccessDenied')) {
            console.error('\n⚠️ AWS Permission Issue:');
            console.error('1. Verify your AWS credentials are correct');
            console.error('2. Ensure your IAM user has the following permissions:');
            console.error('   - dynamodb:PutItem');
            console.error('   - dynamodb:GetItem');
            console.error('   - dynamodb:Query');
            console.error('   - dynamodb:DeleteItem');
            console.error('3. Check that the Journals table exists in your AWS region');
        } else if (error.message.includes('OpenAI')) {
            console.error('\n⚠️ OpenAI API Issue:');
            console.error('1. Verify your OpenAI API key is correct');
            console.error('2. Check OpenAI API status: https://status.openai.com');
        }
        process.exit(1);
    }
}

// Run the test
testJournalFeature();