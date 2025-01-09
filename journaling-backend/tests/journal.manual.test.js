const UserManager = require('../src/utils/dynamoDB');
const JournalManager = require('../src/utils/journalsTable');
const OpenAIService = require('../src/utils/openAI');

async function testJournalFeature() {
    try {
        console.log('\n🔄 Starting Journal Feature Test');
        console.log('================================');
        
        // Initialize services
        const userDB = new UserManager();
        const journalsDB = new JournalManager();
        const openAIService = new OpenAIService();

        // Test user data
        const testUser = {
            UserID: "test-user-1",
            Name: "Test User",
            Email: "test@example.com",
            CreationDate: new Date().toISOString()
        };

        // Test thought
        const testThought = "Today was challenging but productive. I managed to complete my major tasks despite feeling overwhelmed at times.";

        console.log('\n1️⃣ Creating test user...');
        await userDB.addUser(testUser);
        console.log('✅ Test user created:', testUser.UserID);

        console.log('\n2️⃣ Getting user ID by email...');
        const userID = await userDB.getUserByEmail(testUser.Email);
        console.log('✅ User ID retrieved:', userID);

        console.log('\n3️⃣ Generating AI insights...');
        const aiInsights = await openAIService.generateInsights(testThought);
        console.log('✅ AI Insights generated:', JSON.stringify(aiInsights, null, 2));

        console.log('\n4️⃣ Creating journal entry...');
        const journalEntry = {
            UserID: testUser.UserID,
            Content: testThought,
            Quote: aiInsights.quote,
            MentalHealthTip: aiInsights.mentalHealthTip,
            Hack: aiInsights.productivityHack,
            Timestamp: new Date().toISOString()
        };

        const result = await journalsDB.addJournalEntry(journalEntry);
        console.log('✅ Journal entry created successfully!');
        
        // Get the journal entry ID from the result
        const journalID = result.JournalID || journalEntry.JournalID;

        console.log('\n5️⃣ Verifying saved journal entry...');
        const savedEntry = await journalsDB.getJournalEntry(journalID);
        
        console.log('\n📝 Saved Journal Entry Details:');
        console.log('================================');
        console.log('Journal ID:', savedEntry.JournalID);
        console.log('User ID:', savedEntry.UserID);
        console.log('Timestamp:', savedEntry.CreationDate);
        console.log('Content:', savedEntry.Thoughts);
        console.log('\nAI Insights:');
        console.log('------------');
        console.log('Quote:', savedEntry.Quote);
        console.log('Mental Health Tip:', savedEntry.MentalHealthTip);
        console.log('Productivity Hack:', savedEntry.Hack);

        // Verify data integrity
        console.log('\n🔍 Verifying Data Integrity:');
        console.log('================================');
        const verificationResults = {
            'User ID matches': savedEntry.UserID === testUser.UserID,
            'Content matches': savedEntry.Thoughts === testThought,
            'Quote matches': savedEntry.Quote === aiInsights.quote,
            'Mental Health Tip matches': savedEntry.MentalHealthTip === aiInsights.mentalHealthTip,
            'Productivity Hack matches': savedEntry.Hack === aiInsights.productivityHack
        };

        Object.entries(verificationResults).forEach(([check, passed]) => {
            console.log(`${passed ? '✅' : '❌'} ${check}`);
        });

        // Optional: Clean up test data
        // console.log('\n🧹 Cleaning up test data...');
        // await journalsDB.deleteJournalEntry(journalID);
        // await userDB.deleteUser(testUser.UserID);
        // console.log('✅ Test data cleaned up');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
}

// Run the test
testJournalFeature(); 