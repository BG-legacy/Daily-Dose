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

    async updateUser(userID, updateData) {
        // build the update expression and attribute values dynamically
        let updateExpression = 'SET';
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};
        
        // loop each fields
        Object.entries(updateData).forEach(([key, value], index) => {
            // first iteration
            const attributeName = `#attr${index}`;
            const attributeValue = `:val${index}`;
            
            // if it's the first item, add space after SETting
            // if not, add comma before the new ting
            updateExpression += `${index === 0 ? ' ' : ', '}${attributeName} = ${attributeValue}`;
            expressionAttributeNames[attributeName] = key;
            expressionAttributeValues[attributeValue] = value;
        });
    
        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: {
                UserID: String(userID)
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW'  // Returns all attributes of the updated item
        });
    
        try {
            const response = await this.docClient.send(command);
            console.log('User updated successfully:', userID);
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
            },
            ReturnValues: "ALL_OLD"
        });

        try {
            const response = await this.docClient.send(command);

            if(response.Attributes) {
                console.log(`Successfully deleted user ${userID}`);
                return {
                    success: true,
                    message: 'User deleted successfully',
                    deletedUser: response.Attributes
                };
            } else {
                console.log(`No user found with ID: ${userID}`);
                return {
                    success: false, 
                    message: 'No user found with this userID'
                };
            }
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
        

        // create new user
        const user = {
            UserID: "desola",
            Name: "Desola",
            Email: "dfujah@dd.com",
            CreationDate: new Date().toISOString()
        };

        console.log('Adding user: ', user);
        await db.addUser(user);

        await new Promise(resolve => setTimeout(resolve, 1000)); // wait a bit to ensure consistency

        // try to get the same user
        console.log("Attempting to get user with ID: desola");
        const person = await db.getUser("desola");

        if(person) {
            console.log("Retrieved user: ", person);
        } else {
            console.log("User not found");
        }

        const updated = await db.updateUser("desola", {
            Name: "updatedDesola",
            Email: "updateDes@dd.com"
        });
        console.log("updated user", updated);

        const toDelete = await db.deleteUser("desola");
        console.log("delete response", toDelete)

        const verifyUser = await db.getUser("desola");
        if(!verifyUser) {
            console.log("User deleted successfully");
        } else {
            console.log('User not deleted')
        }


    } catch(error) {
        console.error("Error: ", error);
    }
}

main();

