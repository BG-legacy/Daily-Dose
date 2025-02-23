// Load and configure environment variables from .env file in the project root
const dotenv = require('dotenv');
const path = require('path');
// Construct absolute path to .env file
const envPath = path.resolve(__dirname, '../../../.env');
// Load environment variables from the specified path
const result = dotenv.config({ path: envPath });

// Import required AWS SDK v3 DynamoDB client and commands for table operations
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
// Import DynamoDB Document client and specific command interfaces for CRUD operations
const {
    DynamoDBDocumentClient,  // Higher-level client for working with JSON
    PutCommand,             // Create/Replace items
    GetCommand,             // Read single items
    UpdateCommand,          // Modify existing items
    DeleteCommand,          // Remove items
    QueryCommand,           // Search with primary key
    ScanCommand            // Search full table
} = require('@aws-sdk/lib-dynamodb');

// Class to manage mood-related operations in DynamoDB
class MoodManager {
    constructor() {
        // Initialize the base DynamoDB client with AWS credentials and region
        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        // Create a document client that marshals/unmarshals JSON automatically
        this.docClient = DynamoDBDocumentClient.from(this.client);
        // Set the target DynamoDB table name
        this.tableName = 'Journals';
    }

    // Method to add or update a mood entry for the current day
    async addMood(moodData) {
        // Get current date and format it for the timestamp
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];  // Extract YYYY-MM-DD
        
        // Prepare the item to be stored in DynamoDB
        const item = {
            UserID: moodData.UserID,           // Partition key
            Timestamp: `${dateStr}T00:00:00.000Z`,  // Sort key (normalized to start of day)
            Type: 'MOOD',                      // Entry type identifier
            Content: moodData.Content.toLowerCase(),  // Mood value (normalized to lowercase)
            CreationDate: now.toISOString()    // Actual creation timestamp
        };

        try {
            // Attempt to create a new mood entry
            const command = new PutCommand({
                TableName: this.tableName,
                Item: item,
                // Condition to prevent overwriting entries from different days
                ConditionExpression: 'attribute_not_exists(#ts) OR begins_with(#ts, :date)',
                ExpressionAttributeNames: {
                    '#ts': 'Timestamp'
                },
                ExpressionAttributeValues: {
                    ':date': dateStr
                }
            });

            await this.docClient.send(command);
            return { ...item, wasUpdated: false };  // Indicate new entry was created

        } catch (error) {
            // Handle the case where an entry already exists for today
            if (error.name === 'ConditionalCheckFailedException') {
                // Update the existing mood entry
                const updateCommand = new UpdateCommand({
                    TableName: this.tableName,
                    Key: {
                        UserID: moodData.UserID,
                        Timestamp: item.Timestamp
                    },
                    // Update the content and creation date
                    UpdateExpression: 'SET Content = :content, CreationDate = :creationDate',
                    ExpressionAttributeValues: {
                        ':content': moodData.Content,
                        ':creationDate': item.CreationDate
                    },
                    ReturnValues: 'ALL_NEW'  // Return the updated item
                });
                const response = await this.docClient.send(updateCommand);
                return { ...response.Attributes, wasUpdated: true };  // Indicate entry was updated
            }
            throw error;  // Re-throw any other errors
        }
    }

    // Method to retrieve and format mood data for the current week
    async getWeeklyMoodSummary(userID) {
        // Calculate the start and end of the current week in UTC
        const now = new Date();
        const currentDay = now.getUTCDay();  // 0 = Sunday, 6 = Saturday
        
        // Calculate start of week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setUTCDate(now.getUTCDate() - currentDay);
        startOfWeek.setUTCHours(0, 0, 0, 0);

        // Calculate end of week (Saturday)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
        endOfWeek.setUTCHours(23, 59, 59, 999);

        // Prepare query to fetch mood entries for the week
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
            // Execute the query
            const response = await this.docClient.send(command);
            const items = response.Items || [];
            
            // Define mapping of mood strings to numerical values for chart visualization
            const moodValues = {
                'happy': 3,  // Top position (yellow)
                'sad': 2,    // Middle position (blue)
                'upset': 1   // Bottom position (red)
            };

            // Generate arrays for each day of the week
            const days = [];      // Array of dates in YYYY-MM-DD format
            const dayLabels = []; // Array of short day names (Sun, Mon, etc.)
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                days.push(date.toLocaleDateString('en-CA'));  // YYYY-MM-DD format
                dayLabels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            }

            // Map database entries to mood values for each day
            const moodData = days.map(day => {
                const dayMood = items.find(item => {
                    const itemDate = item.Timestamp.split('T')[0];
                    return itemDate === day;
                });
                return dayMood ? moodValues[dayMood.Content] || null : null;
            });

            // Log debug information
            console.log('Weekly Mood Data:', {
                startOfWeek: startOfWeek.toISOString(),
                endOfWeek: endOfWeek.toISOString(),
                items,
                moodData
            });

            // Return formatted data for Chart.js visualization
            return {
                labels: dayLabels,  // Day labels (Sun, Mon, etc.)
                data: moodData      // Numerical mood values (3, 2, 1, or null)
            };
        } catch (error) {
            // Log and re-throw any errors
            console.error("Error getting weekly mood summary:", error);
            throw error;
        }
    }
}

// Export the MoodManager class for use in other modules
module.exports = MoodManager;