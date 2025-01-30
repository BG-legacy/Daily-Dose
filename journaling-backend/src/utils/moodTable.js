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
        // Extract just the date portion for consistent daily entries
        const dateStr = new Date().toISOString().split('T')[0];
        
        // Structure mood entry for database:
        // - UserID: Unique identifier for the user
        // - Timestamp: Start of day (00:00:00) for consistent querying
        // - Type: 'MOOD' to distinguish from other entry types
        // - Content: The actual mood ('happy', 'sad', 'upset')
        // - CreationDate: Exact time for audit purposes
        const item = {
            UserID: moodData.UserID,
            Timestamp: `${dateStr}T00:00:00.000Z`,
            Type: 'MOOD',
            Content: moodData.Content,
            CreationDate: new Date().toISOString()
        };

        // Create DynamoDB put command
        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            // Only allow one mood entry per day
            ConditionExpression: 'attribute_not_exists(#ts) OR begins_with(#ts, :date)',
            ExpressionAttributeNames: {
                '#ts': 'Timestamp'
            },
            ExpressionAttributeValues: {
                ':date': dateStr
            }
        });

        try {
            await this.docClient.send(command);
            return item;
        } catch (error) {
            if (error.name === 'ConditionalCheckFailedException') {
                // Update existing mood for today
                const updateCommand = new UpdateCommand({
                    TableName: this.tableName,
                    Key: {
                        UserID: moodData.UserID,
                        Timestamp: item.Timestamp
                    },
                    UpdateExpression: 'SET Content = :content, CreationDate = :creationDate',
                    ExpressionAttributeValues: {
                        ':content': moodData.Content,
                        ':creationDate': item.CreationDate
                    },
                    ReturnValues: 'ALL_NEW'
                });
                const response = await this.docClient.send(updateCommand);
                return response.Attributes;
            }
            console.error("Error adding mood:", error);
            throw error;
        }
    }

    async getWeeklyMoodSummary(userID) {
        // Calculate the current week's date range (Sunday to Saturday)
        const now = new Date();
        const currentDay = now.getDay();  // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDay);  // Go back to Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);  // Forward to Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: 'UserID = :uid',
            FilterExpression: '#type = :moodType AND #timestamp BETWEEN :weekStart AND :weekEnd',
            ExpressionAttributeNames: {
                '#type': 'Type',
                '#timestamp': 'Timestamp'
            },
            ExpressionAttributeValues: {
                ':uid': userID,
                ':moodType': 'MOOD',
                ':weekStart': startOfWeek.toISOString(),
                ':weekEnd': endOfWeek.toISOString()
            }
        });

        try {
            const response = await this.docClient.send(command);
            const items = response.Items || [];
            
            // Map mood strings to numerical values for chart positioning:
            // - happy = 3 (top, yellow)
            // - sad = 2 (middle, blue)
            // - upset = 1 (bottom, red)
            const moodValues = {
                'happy': 3,
                'sad': 2,
                'upset': 1
            };

            // Create arrays for each day of the current week
            const days = [];
            const dayLabels = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                days.push(date.toISOString().split('T')[0]);
                dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            }

            // Map database entries to mood values for each day
            const moodData = days.map(day => {
                const dayMood = items.find(item => 
                    item.Timestamp.startsWith(day)
                );
                return dayMood ? moodValues[dayMood.Content] || 2 : null;
            });

            console.log('Weekly Mood Data:', {
                startOfWeek: startOfWeek.toISOString(),
                endOfWeek: endOfWeek.toISOString(),
                items,
                moodData
            });

            // Return formatted data for Chart.js
            return {
                labels: dayLabels,  // Short day names (Sun, Mon, etc.)
                data: moodData     // Numerical mood values (3, 2, 1, or null)
            };
        } catch (error) {
            console.error("Error getting weekly mood summary:", error);
            throw error;
        }
    }
}

module.exports = MoodManager;