const dotenv = require('dotenv');
// dotenv.config();
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });
const {v4: uuidv4} = require('uuid');
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand } = require('@aws-sdk/lib-dynamodb');

// console.log("Resolved .env path:", envPath);

// journals table
class JournalManager {
    constructor() {
        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = 'Journals';
    }
    async addJournalEntry(journalData) {
        // TODO: add unique journal entry ID as attribute
        const item ={
            JournalID: uuidv4(),
            UserID: journalData.UserID,
            CreationDate: journalData.Timestamp,
            Thoughts: journalData.Content,
            Quote: journalData.Quote,
            MentalHealthTip: journalData.MentalHealthTip,
            Hack: journalData.Hack
        }
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
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
            ScanIndexForward: false // this will return items in descending order by sort key
        });

        try {
            const response = await this.docClient.send(command);
            return response.Items;
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            throw error;
        }
    }

    async getJournalEntry(journalID) {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                JournalID: journalID
            }
        });

        try {
            const response = await this.docClient.send(command);
            return response.Item;
        } catch (error) {
            console.error("Error fetching journal entry:", error);
            throw error;
        }
    }

    async deleteJournalEntry(journalID) {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                JournalID: journalID
            },
            ReturnValues: "ALL_OLD"
        });

        try {
            const response = await this.docClient.send(command);
            if (response.Attributes) {
                return { success: true, message: 'Journal entry deleted successfully' };
            } else {
                return { success: false, message: 'No journal entry found with this ID' };
            }
        } catch (error) {
            console.error("Error deleting journal entry:", error);
            throw error;
        }
    }

    




}

module.exports = JournalManager;

async function main() {
    try {
        const journalManager = new JournalManager();
        const journalData = {
            UserID: "dfujah",
            Timestamp: new Date().toISOString(),
            Content: "This is a test journal entry",
            Quote: "This is a test quote",
            MentalHealthTip: "This is a test mental health tip",
            Hack: "This is a test hack"
        };
        await journalManager.addJournalEntry(journalData);
        console.log("Journal entry added successfully");
    } catch (error) {
        console.error("Error:", error);
    }
}


main()