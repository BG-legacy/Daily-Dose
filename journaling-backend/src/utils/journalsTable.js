const dotenv = require('dotenv')
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand } = require('@aws-sdk/lib-dynamodb');


// journals table
class JournalManager {
    constructor() {
        this.client = new DynamoDBClient({
            region: process.env.aws.AWS_REGION,
            credentials: {
                accessKeyId: process.env.aws.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.aws.AWS_SECRET_ACCESS_KEY
            }
        });

        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = 'Journals';
    }
    async addJournalEntry(journalData) {
        const command = new PutCommand({
            TableName: this.tableName,
            Item: {
                UserID: journalData.UserID,
                CreationDate: journalData.Timestamp,
                Thoughts: journalData.Content,
                AIInsights: journalData.AIInsights
            }
        });

        try {
            await this.docClient.send(command);
            return { success: true, message: 'Journal entry added successfully' };
        } catch (error) {
            console.error("Error adding journal entry:", error);
            throw error;
        }
    }

    async getUserJournalEntries(userID) {
        const command = new QueryCommand({
            TableName: "JournalEntries",
            KeyConditionExpression: "UserID = :uid",
            ExpressionAttributeValues: {
                ":uid": userID
            },
            ScanIndexForward: false // This will return items in descending order by sort key
        });

        try {
            const response = await this.docClient.send(command);
            return response.Items;
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            throw error;
        }
    }

    // analyze journal output is stored as well

}