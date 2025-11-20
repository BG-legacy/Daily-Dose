// Script to update DynamoDB provisioned throughput for load testing
const { DynamoDBClient, UpdateTableCommand } = require('@aws-sdk/client-dynamodb');

// Read AWS credentials from environment variables
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

// Verify credentials are available
if (!accessKeyId || !secretAccessKey || !region) {
  console.error('Error: AWS credentials not found in environment variables.');
  console.error('Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION');
  process.exit(1);
}

// Configure AWS SDK
const client = new DynamoDBClient({
  region: region,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey
  }
});

// Tables to update
const tables = [
  {
    name: 'Dosers',  // Users table
    readCapacity: 200,
    writeCapacity: 200
  },
  {
    name: 'Journals', // Journals table
    readCapacity: 400,
    writeCapacity: 400
  }
];

// Function to update a single table's capacity
async function updateTableCapacity(tableName, readCapacity, writeCapacity) {
  console.log(`Updating table ${tableName} to Read: ${readCapacity}, Write: ${writeCapacity} capacity units`);
  
  const params = {
    TableName: tableName,
    ProvisionedThroughput: {
      ReadCapacityUnits: readCapacity,
      WriteCapacityUnits: writeCapacity
    }
  };
  
  try {
    const command = new UpdateTableCommand(params);
    const response = await client.send(command);
    console.log(`Table ${tableName} update initiated. Current status: ${response.TableDescription.TableStatus}`);
    return response;
  } catch (err) {
    console.error(`Error updating table ${tableName}:`, err);
    throw err;
  }
}

// Update all tables
async function updateAllTables() {
  console.log('Starting DynamoDB capacity update for load testing...');
  
  for (const table of tables) {
    try {
      await updateTableCapacity(table.name, table.readCapacity, table.writeCapacity);
    } catch (err) {
      console.error(`Failed to update table ${table.name}. Continuing with other tables.`);
    }
  }
  
  console.log('Capacity update completed.');
}

// Run the update
updateAllTables(); 