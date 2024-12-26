const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

const { DynamoDBClient, DescribeTableCommand} = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    UpdateCommand, 
    DeleteCommand, 
    QueryCommand, 
    ScanCommand }  = require('@aws-sdk/lib-dynamodb');


class UserManager {
    constructor() {
        this.client = new DynamoDBClient({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
        this.docClient = DynamoDBDocumentClient.from(this.client);
        this.tableName = "Dosers";
    }

    // describe the table
    async describeTable() {
        const command = new DescribeTableCommand({
            TableName: "Dosers"
        });
        
        try {
            const response = await this.client.send(command);
            console.log("Table Description:", response.Table);
            return response.Table;
        } catch (error) {
            console.error("Error describing table:", error);
            throw error;
        }
    }

    // add a new user
    async addUser(userData) {
        const item = {
            UserID: String(userData.UserID),
            Name: String(userData.Name),
            Email: String(userData.Email),
            CreationDate: userData.CreationDate || new Date().toISOString()
        };

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item,
            ReturnValues: "ALL_OLD"
        });


        try {
            await this.docClient.send(command);
            // console.log("User added successfully", item);
            return { success: true, message: 'User added successfully'};
        } catch (error) {
            console.error("Error adding user: ", error);
            throw error;
        }
    }


    // get a user by ID
    async getUser(userID) {
        console.log("Getting user with ID:", userID);

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                UserID: String(userID)
                
            }
        });

        try {
            const response = await this.docClient.send(command);

            if(!response.Item) {
                console.log("User not found:", userID);
                return null;
            }   

            return response.Item;
        } catch(error) {
            console.error("Error in getUser:", error);
            throw error;
        }
    }

    // update a user
    async updateUser(userID, updateData) {
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {  UserID: String(userID)} ,
            UpdateExpression: 'set #name = :n, #email = :e',
            ExpressionAttributeNames: {
                '#name': Name,
                "#email": Email
            },
            ExpressionAttributeValues: {
                ':n': updateData.name,
                ':e': updateData.email
            },
            ReturnValues: 'UPDATED_NEW'
            
        });

        try {
            const response = await this.docClient.send(command);
            console.log('User updated successfully: ', userID);
            return response.Attributes;
        } catch(error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    }

    // delete a user
    async deleteUser(userID) {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key:{
                // TODO: should i switch this from string to like enum or something???
                UserID: String(userID)
            }
        });

        try {
            await this.docClient.send(command);
            console.log("User deleted successfully", userID);
            return { success: true, message: 'User deleted successfully'};
        } catch(error) {
            console.error("Error deleting user: ", error);
            throw error;
        }
    }
}

module.exports = UserManager;




async function main() {
    const db = new UserManager();
    try {
        await db.describeTable();

        // create new user
        const user = {
            UserID: "desola",
            Name: "Desola",
            Email: "dfujah@dd.com",
            CreationDate: new Date().toISOString()
        };

        console.log('Adding user: ', user);
        await db.addUser(user);

        await new Promise(resolve => setTimeout(resolve, 120000)); // wait a bit to ensure consistency

        // try to get the same user
        console.log("Attempting to get user with ID: desola");
        const person = await db.getUser("desola");

        if(person) {
            console.log("Retrieved user: ", person);
        } else {
            console.log("User not found");
        }
    } catch(error) {
        console.error("Error: ", error);
    }
}

main();

