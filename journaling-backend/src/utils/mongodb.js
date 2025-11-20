/**
 * MongoDB Connection Manager
 * Handles MongoDB Atlas connection and provides connection utilities
 */

const mongoose = require('mongoose');
require('dotenv').config();

class MongoDBConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }

    /**
     * Connect to MongoDB Atlas
     * @returns {Promise<mongoose.Connection>}
     */
    async connect(retries = 3) {
        if (this.isConnected && this.connection) {
            console.log('✅ Using existing MongoDB connection');
            return this.connection;
        }

        let lastError = null;

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const uri = process.env.MONGODB_URI;
                
                if (!uri) {
                    throw new Error('MONGODB_URI is not defined in environment variables');
                }

                console.log(`🔄 Connecting to MongoDB Atlas... (Attempt ${attempt}/${retries})`);
                
                // Enhanced connection options for Render and MongoDB Atlas
                const connectionOptions = {
                    // Parser and topology options
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    
                    // Timeout settings - more generous for Render's network
                    serverSelectionTimeoutMS: 30000, // 30 seconds (increased from 5)
                    socketTimeoutMS: 45000,
                    connectTimeoutMS: 30000,
                    
                    // Retry settings
                    retryWrites: true,
                    retryReads: true,
                    maxPoolSize: 10,
                    minPoolSize: 2,
                    
                    // SSL/TLS settings - critical for MongoDB Atlas
                    tls: true,
                    tlsAllowInvalidCertificates: false,
                    tlsAllowInvalidHostnames: false,
                    
                    // Heartbeat and monitoring
                    heartbeatFrequencyMS: 10000,
                    
                    // Compression
                    compressors: ['zlib'],
                };

                await mongoose.connect(uri, connectionOptions);

                this.connection = mongoose.connection;
                this.isConnected = true;

                console.log('✅ Successfully connected to MongoDB Atlas');
                console.log(`   Database: ${this.connection.db.databaseName}`);
                console.log(`   Host: ${this.connection.host}`);

                // Handle connection events
                mongoose.connection.on('error', (err) => {
                    console.error('❌ MongoDB connection error:', err);
                    this.isConnected = false;
                });

                mongoose.connection.on('disconnected', () => {
                    console.log('⚠️  MongoDB disconnected');
                    this.isConnected = false;
                });

                mongoose.connection.on('reconnected', () => {
                    console.log('✅ MongoDB reconnected');
                    this.isConnected = true;
                });

                return this.connection;
            } catch (error) {
                lastError = error;
                console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed:`, error.message);
                
                if (error.message.includes('tlsv1 alert') || error.message.includes('SSL')) {
                    console.error('⚠️  TLS/SSL Error detected. This usually means:');
                    console.error('   1. MongoDB Atlas IP whitelist is blocking Render IPs');
                    console.error('   2. Connection string is incorrect');
                    console.error('   3. MongoDB Atlas cluster is paused or unavailable');
                }
                
                if (attempt < retries) {
                    const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 10000);
                    console.log(`   Retrying in ${backoffDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffDelay));
                } else {
                    console.error('❌ All connection attempts failed');
                }
                
                this.isConnected = false;
            }
        }

        throw lastError;
    }

    /**
     * Disconnect from MongoDB
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (this.connection) {
            await mongoose.disconnect();
            this.isConnected = false;
            console.log('MongoDB disconnected');
        }
    }

    /**
     * Check if connected to MongoDB
     * @returns {boolean}
     */
    isHealthy() {
        return this.isConnected && mongoose.connection.readyState === 1;
    }

    /**
     * Get connection instance
     * @returns {mongoose.Connection|null}
     */
    getConnection() {
        return this.connection;
    }
}

// Export singleton instance
const mongoConnection = new MongoDBConnection();

module.exports = mongoConnection;

