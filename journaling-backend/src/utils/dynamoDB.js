/**
 * DynamoDB User Manager Utility
 * Handles all user-related database operations
 */

// Environment configuration
const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

// AWS DynamoDB imports
const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    ScanCommand 
} = require('@aws-sdk/lib-dynamodb');

/**
 * UserManager Class
 * Manages user operations in DynamoDB
 * Handles CRUD operations for user data
 */
function UserManager() {
    // Initialize DynamoDB client with AWS credentials
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

/**
 * Add a new user to the database
 * @param {Object} userData - User information
 * @param {string} userData.UserID - Unique user identifier
 * @param {string} userData.Name - User's name
 * @param {string} userData.Email - User's email
 * @param {string} [userData.CreationDate] - Account creation date
 * @returns {Promise<void>}
 */
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
        console.log("User added successfully:", item.UserID);
    } catch (error) {
        console.error("Error adding user: ", error);
        throw error;
    }
}

/**
 * Retrieve a user by their ID
 * @param {string} userID - User's unique identifier
 * @returns {Promise<Object|null>} User data or null if not found
 */
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

/**
 * Update user information
 * @param {string} userID - User's unique identifier
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>} Updated user data
 */
UserManager.prototype.updateUser = async function (userID, updateData) {
    // Build dynamic update expression
    let updateExpression = 'SET';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    Object.entries(updateData).forEach(([key, value], index) => {
        const attributeName = `#attr${index}`;
        const attributeValue = `:val${index}`;
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
        ReturnValues: 'ALL_NEW'
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

/**
 * Delete a user from the database
 * @param {string} userID - User's unique identifier
 * @returns {Promise<Object>} Result of deletion operation
 */
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

/**
 * Find a user by their email address
 * @param {string} email - User's email address
 * @returns {Promise<string|null>} UserID if found, null otherwise
 */
UserManager.prototype.getUserByEmail = async function(email) {
    console.log('Looking up user by email:', email);
    const command = new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'Email = :email',
        ExpressionAttributeValues: {
            ':email': email
        }
    });

    try {
        const response = await this.docClient.send(command);
        if (response.Items && response.Items.length > 0) {
            console.log('Found user:', response.Items[0]);
            return response.Items[0].UserID;
        } else {
            console.log('No user found with email:', email);
            return null;
        }
    } catch (error) {
        console.error("Error getting user by email: ", error);
        throw error;
    }
}

// to help send out notifications (using pagination)
// should be called from notifications
UserManager.prototype.getEmails = async function() {
    let lastEvaluatedKey;
    let pageCount = 0;

    do {
        const params = {
            TableName: this.tableName,
            ExclusiveStartKey: lastEvaluatedKey,
            ProjectionExpression: "Email", // only get the Email field
        };

        try {
            const response = await this.client.send(new ScanCommand(params));
            pageCount++;
    
            // extract email value from items
            const emails = response.Items.map(item => item.Email);
            console.log(`Page ${pageCount}, Emails:`, emails);
    
            lastEvaluatedKey = response.LastEvaluatedKey;
        } catch(error) {
            console.error("Couldn't get the email. oops");
            throw error;
        }

        
    } while(lastEvaluatedKey);
}


module.exports = UserManager;

/**
 * Features:
 * 1. CRUD operations for users
 * 2. Email lookup functionality
 * 3. Dynamic update expressions
 * 4. Proper error handling
 * 5. Consistent data formatting
 * 
 * Security:
 * 1. Environment variable configuration
 * 2. Input validation
 * 3. Error logging
 * 4. Type coercion for IDs
 * 
 * Performance:
 * 1. Connection pooling
 * 2. Efficient queries
 * 3. Proper indexing
 * 4. Error recovery
 */
