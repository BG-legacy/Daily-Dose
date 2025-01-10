const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

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

    async addMood(userID, moodData) {
        const item = {
            UserID: userID,
            CreationDate: new Date().toISOString().split('T')[0], 
            Mood: moodData
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
        });

        try {
            await this.docClient.send(command);
            return item;
        } catch (error) {
            console.error("Error adding mood entry:", error);
            throw error;
        }
        
    }
    
    // answers the question: how often has the user been sad over the past 7 or 30 days?
    async getMood(userID, timestamp, moodData) {
        if (timestamp == 30) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: "UserID = :uid AND CreationDate >= :date",
                ExpressionAttributeValues: {
                    ":uid": userID,
                    ":date": thirtyDaysAgo.toISOString().split('T')[0]
                },
                ScanIndexForward: false
            });

            try {
                const response = await this.docClient.send(command);
                return response.Items;
            } catch (error) {
                console.error("Error fetching mood entries:", error);
                throw error;
            }
        } else if (timestamp == 7) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: "UserID = :uid AND CreationDate >= :date",
                ExpressionAttributeValues: {
                    ":uid": userID,
                    ":date": sevenDaysAgo.toISOString().split('T')[0]
                },
                ScanIndexForward: false
            });

            try {
                const response = await this.docClient.send(command);
                return response.Items;
            } catch (error) {
                console.error("Error fetching mood entries:", error);
                throw error;
            }
        } else {
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
                return response.Items;
            } catch (error) {
                console.error("Error fetching mood entries:", error);
                throw error;
            }
        }
     

    }


    // this would be used the to get all the moods for a user over a certain time
    async viewMoodChart(userID, time) {
        if(![7, 30].includes(time)) {
            throw new Error("Invalid time period. Must be 7 or 30.");
        }

        // calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - time);


        // query the table
        const command = new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "UserID = :userID AND CreationDate BETWEEN :startDate AND :endDate",
            ExpressionAttributeValues: {
                ":userID": userID,
                "startDate": startDate.toISOString().split('T')[0],
                "endDate": endDate.toISOString().split('T')[0]
            },
            ScanIndexForward: true // dates in ascending order
        });

        try {
            const response = await this.docClient.send(command);
            
            // organize entries by date
            const moodsByDate = {};
            response.Items.forEach(item => {
                const { CreationDate, Mood } = item;
                if(!moodsByDate[CreationDate]) {
                    moodsByDate[CreationDate] = [];
                }
                moodsByDate[CreationDate].push(Mood);
            });

            return moodsByDate;


        } catch (error) {
            console.error("Error fetching mood entries:", error);
            throw error;
        }

    }
}


module.exports = MoodManager;