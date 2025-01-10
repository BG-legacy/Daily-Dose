const JournalManager = require('../src/utils/journalsTable');
const { QueryCommand } = require('@aws-sdk/lib-dynamodb');

async function testGSI() {
    try {
        console.log('\n🔍 Testing GSI (UserID-index)');
        console.log('================================');

        const journalsDB = new JournalManager();

        // 1. First verify table access
        console.log('1️⃣ Verifying table access...');
        await journalsDB.verifyTableAccess();
        console.log('✅ Table access verified');

        // 2. Try to query using the GSI
        console.log('\n2️⃣ Testing GSI query...');
        try {
            const command = new QueryCommand({
                TableName: 'Journals',
                IndexName: 'UserID-index',
                KeyConditionExpression: 'UserID = :uid',
                ExpressionAttributeValues: {
                    ':uid': 'test-user-1'
                },
                Limit: 1  // Just test with 1 item
            });

            const result = await journalsDB.docClient.send(command);
            console.log('✅ GSI query successful');
            console.log(`📊 Items found: ${result.Items?.length || 0}`);
            
            if (result.Items?.length > 0) {
                console.log('\n📝 Sample Item:');
                console.log('UserID:', result.Items[0].UserID);
                console.log('JournalID:', result.Items[0].id);
                console.log('CreationDate:', result.Items[0].CreationDate);
            }
        } catch (error) {
            if (error.message.includes('backfilling')) {
                console.log('⏳ GSI is still backfilling data. Please wait a few minutes...');
            } else if (error.message.includes('index') || error.message.includes('Index')) {
                console.error('❌ GSI not found. Please verify the index was created correctly');
                console.error('Expected index name: UserID-index');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
            throw error;
        }

        console.log('\n✨ GSI verification complete!');

    } catch (error) {
        console.error('\n❌ GSI Test failed:', error.message);
        if (error.message.includes('AccessDenied')) {
            console.error('\n⚠️ AWS Permission Issue:');
            console.error('Ensure your IAM user has these permissions:');
            console.error('- dynamodb:Query');
            console.error('- dynamodb:DescribeTable');
            console.error('For both the table AND the GSI:');
            console.error('arn:aws:dynamodb:REGION:ACCOUNT:table/Journals');
            console.error('arn:aws:dynamodb:REGION:ACCOUNT:table/Journals/index/*');
        }
        process.exit(1);
    }
}

// Run the test
testGSI(); 