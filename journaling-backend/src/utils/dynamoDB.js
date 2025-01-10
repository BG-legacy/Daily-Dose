// aka homeController
const dotenv = require('dotenv');
dotenv.config();
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

// dosers table
function UserManager() {
    
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
    UserManager.prototype.addUser = async function (userData) {
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
            console.log("User added successfully:", item.UserID); // undefined
        } catch (error) {
            console.error("Error adding user: ", error);
            throw error;
            res.status(500).json({ message: error.message, code: 'ERROR_CODE' });

        }
    }


    // get a user by ID
    UserManager.prototype.getUser = async function (userID) {
        console.log("Getting user with ID:", userID);

        const command = new GetCommand({
            TableName: this.tableName,
            Key: {
                UserID: String(userID)

            }
        });

        try {
            const response = await this.docClient.send(command);

            if (!response.Item) {
                console.log("User not found:", userID);
                return null;
            }

            return response.Item;
        } catch (error) {
            console.error("Error in getUser:", error);
            throw error;
        }
    }
            
    UserManager.prototype.updateUser = async function (userID, updateData) {
        // build the update expression and attribute values dynamically
        let updateExpression = 'SET';
        let expressionAttributeNames = {};
        let expressionAttributeValues = {};

        // loop each field
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
        } catch (error) {
            console.error("Error updating user: ", error);
            throw error;
        }
    }


    // delete a user
    UserManager.prototype.deleteUser = async function (userID) {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: {
                UserID: String(userID)
            },
            ReturnValues: "ALL_OLD"
        });

        try {
            const response = await this.docClient.send(command);

            if (response.Attributes) {
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
        } catch (error) {
            console.error("Error deleting user: ", error);
            throw error;
        }
    }

        //TODO: TEST
    UserManager.prototype.getUserByEmail = async function(email) {
        const command = new QueryCommand({
            TableName: this.tableName,
            IndexName: 'Email-index',
            KeyConditionExpression: 'Email = :email',
            ExpressionAttributeValues: {
                ':email': email
            }
        });

        try {
            const response = await this.docClient.send(command);
            if (response.Items && response.Items.length > 0) {
                
                return response.Items[0].UserID;
            } else {
                console.log(`No user found with email: ${email}`);
                return null;
            }
        } catch (error) {
            console.error("Error getting user by email: ", error);
            throw error;
        }
    }





// LEAVING HERE FOR TESTING PURPOSES
// async function main() {
//     try {
//         const db = new UserManager();
        
//         // Chain all operations with await
//         const user = await db.addUser({
//             UserID: "desola",
//             Name: "Desola",
//             Email: "dfujah@dd.com",
//             CreationDate: new Date().toISOString()
//         });
//         const retrieved = await db.getUser("desola");
//         const updated = await db.updateUser("desola", {
//             Name: "updatedDesola",
//             Email: "updateDes@dd.com"
//         });
//         const deleted = await db.deleteUser("desola");

//         const returnedUser = await db.getUserByEmail("matt@test.com")
//         console.log(returnedUser)
        
//         return { user, retrieved, updated, deleted, returnedUser };
//     } catch (error) {
//         console.error('Error:', error);
//         throw error;
//     }
// }

// main();

module.exports = UserManager;
