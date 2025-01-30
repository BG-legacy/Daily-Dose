// Load environment variables from .env file
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

// Import AWS DynamoDB clients and commands
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand } = require('@aws-sdk/lib-dynamodb');


class MoodManager {
    constructor() {
        // Initialize DynamoDB client with AWS credentials from environment
        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        // Create document client for easier JSON handling
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = 'Journals';
    }

    async addMood(moodData) {
        // Prepare mood entry for DynamoDB storage
        const item = {
            UserID: moodData.UserID,
            Timestamp: moodData.Timestamp,
            Type: 'MOOD', // Discriminator field to distinguish from other journal types
            Content: moodData.Content,
            CreationDate: new Date().toISOString() // Metadata for entry creation time
        };

        // Create DynamoDB put command
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
        });

        try {
            // Attempt to store mood entry in DynamoDB
            await this.docClient.send(command);
            return item;
        } catch (error) {
            console.error("Error adding mood:", error);
            throw error;
        }
    }

    async getWeeklyMoodSummary(userID) {
        // Calculate date range for weekly summary
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Create query to fetch mood entries from the last 7 days
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'UserID = :uid AND Timestamp >= :weekAgo',
            FilterExpression: '#type = :moodType',
            ExpressionAttributeNames: {
                '#type': 'Type'  // Use expression attribute name for reserved word
            },
            ExpressionAttributeValues: {
                ':uid': userID,
                ':weekAgo': oneWeekAgo.toISOString(),
                ':moodType': 'MOOD'
            }
        });

        try {
            // Execute query and return results
            const response = await this.docClient.send(command);
            return response.Items || [];
        } catch (error) {
            console.error("Error getting weekly mood summary:", error);
            throw error;
        }
    }
}

module.exports = MoodManager;