const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });
const {v4: uuidv4} = require('uuid');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    QueryCommand,
    DeleteCommand,
    ScanCommand
} = require('@aws-sdk/lib-dynamodb');

class JournalManager {
    constructor() {
        // Verify AWS credentials are loaded
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
            throw new Error('AWS credentials are not properly configured');
        }

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

    async verifyTableAccess() {
        try {
            // Update the test access check to use the correct schema
            await this.docClient.send(new GetCommand({
                TableName: this.tableName,
                Key: {
                    UserID: "test-access",
                    CreationDate: new Date().toISOString()
                }
            }));
            return true;
        } catch (error) {
            console.error('DynamoDB Access Error:', error.message);
            if (error.name === 'ResourceNotFoundException') {
                throw new Error(`Table ${this.tableName} does not exist`);
            }
            if (error.code === 'AccessDeniedException') {
                throw new Error('Insufficient permissions to access DynamoDB table');
            }
            // If we get here, we have access to the table but the item doesn't exist (which is fine)
            return true;
        }
    }

    async addJournalEntry(journalData) {
        const item = {
            UserID: journalData.UserID,
            CreationDate: journalData.Timestamp || new Date().toISOString(),
            Thoughts: journalData.Content,
            Quote: journalData.Quote,
            MentalHealthTip: journalData.MentalHealthTip,
            Hack: journalData.Hack
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
        });

        try {
            await this.docClient.send(command);
            return {
                ...item,
                id: `${item.UserID}#${item.CreationDate}`
            };
        } catch (error) {
            console.error("Error adding journal entry:", error);
            throw error;
        }
    }

    async getUserJournalEntries(userID) {
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "UserID = :uid",
            ExpressionAttributeValues: {
                ":uid": userID
            },
            ScanIndexForward: false
        });

        try {
            const response = await this.docClient.send(command);
            return response.Items.map(item => ({
                ...item,
                id: `${item.UserID}#${item.CreationDate}`
            }));
        } catch (error) {
            console.error("Error fetching journal entries:", error);
            throw error;
        }
    }

    async getJournalEntry(compositeId) {
        const [userID, creationDate] = compositeId.split('#');
        
        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                UserID: userID,
                CreationDate: creationDate
            }
        });

        try {
            const response = await this.docClient.send(command);
            if (!response.Item) return null;
            return {
                ...response.Item,
                id: compositeId
            };
        } catch (error) {
            console.error("Error fetching journal entry:", error);
            throw error;
        }
    }

    async deleteJournalEntry(compositeId) {
        const [userID, creationDate] = compositeId.split('#');
        
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                UserID: userID,
                CreationDate: creationDate
            },
            ReturnValues: "ALL_OLD"
        });

        try {
            const response = await this.docClient.send(command);
            return {
                success: !!response.Attributes,
                message: response.Attributes ? 'Journal entry deleted successfully' : 'No journal entry found'
            };
        } catch (error) {
            console.error("Error deleting journal entry:", error);
            throw error;
        }
    }
}

module.exports = JournalManager;