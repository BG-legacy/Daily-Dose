const path = require('path');
const dotenv = require('dotenv');
const envPath = path.resolve(__dirname, '../../../.env');
const result = dotenv.config({ path: envPath });

const { DynamoDBClient} = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient, 
    PutCommand, 
    GetCommand, 
    UpdateCommand, 
    DeleteCommand, 
    QueryCommand, 
    ScanCommand }  = require('@aws-sdk/lib-dynamodb')


const { DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function describeTable() {
    const command = new DescribeTableCommand({
        TableName: "Users"
    });
    
    try {
        const response = await client.send(command);
        console.log("Table Key Schema:", response.Table.KeySchema);
        console.log("Table Attributes:", response.Table.AttributeDefinitions);
        return response.Table;
    } catch (error) {
        console.error("Error describing table:", error);
        throw error;
    }
}

describeTable();


const docClient = DynamoDBDocumentClient.from(client);

// add user 
async function addUser(userID, name, email) {
    const item = {
        UserID: String(userID),  // Ensure UserID is a string
        Name: String(name),
        Email: String(email),
        CreationDate: new Date().toISOString()
    };

    const command = new PutCommand({
        TableName: "Users",
        Item: item
    });

    try {
        const response = await docClient.send(command);
        console.log("User added successfully");
    } 
    catch(error) {
        if (error.name === 'AccessDeniedException') {
            console.error('Access Denied. Please check your IAM permissions.');
            console.error('Required permissions: dynamodb:PutItem');
            console.error('Table: Users');
        } else if (error.name === 'ResourceNotFoundException') {
            console.error('Table not found. Please check if the table exists.');
        } else if (error.name === 'ValidationException') {
            console.error('Validation error. Please check your input data.');
        }
        console.error("Error adding user: ", error);
        throw error;
    }
}


// get user
async function getUser(userID) {
    const command = new GetCommand({
        TableName: "Users",
        Key: {
            UserID: String(userID),
            CreationDate: new Date().toISOString()
        }
    });

    try {
        const response = await docClient.send(command);
        return response.Item;
    } catch (error) {
        console.error("Error in getUser:", error);
        throw error;
    }


 
}

// async function updateUser(userID, updateData) {
//     const command = new UpdateCommand({
//         TableName: 'Users',
//         Key: {
//             UserID: userID
//         },
//         UpdateExpression: 'set #name = :n, #email = :e',
//         ExpressionAttributeNames: {
//             '#name': 'Name',
//             '#email': 'Email'
//         },
//         ExpressionAttributeValues: {
//             ':n': updateData.name,
//             ':e': updateData.email
//         },
//         ReturnValues: 'UPDATED_NEW'
//     });

//     try {
//         const response = await docClient.send(client);
//         return response.Attributes;
//     } catch(error) {
//         console.error("Error updating user: ", error);
//         throw error;
//     }
// }


// async function deleteUser(userID) {
//     const command = new DeleteCommand({
//         TableName: 'Users',
//         Key: {
//             UserID: userID
//         }
//     });

//     try {
//         await docClient.send(command);
//         console.log("User deleted successfully");
//     } catch(error) {
//         console.error("Error deleting user: ", error);
//         throw error;
//     }
// }




async function main() {
    try {
        // create new user
        await addUser({
            UserID: "desola",
            Name: "Desola",
            Email: "dfujah@dd.com"
        });

        // get user
        const user = await getUser("desola");
        console.log("Retrieved user: ", user);
    } catch(error) {
        console.error("Error: ", error);
    }
}

main();