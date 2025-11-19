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
    async connect() {
        if (this.isConnected && this.connection) {
            console.log('✅ Using existing MongoDB connection');
            return this.connection;
        }

        try {
            const uri = process.env.MONGODB_URI;
            
            if (!uri) {
                throw new Error('MONGODB_URI is not defined in environment variables');
            }

            console.log('🔄 Connecting to MongoDB Atlas...');
            
            await mongoose.connect(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            this.connection = mongoose.connection;
            this.isConnected = true;

            console.log('✅ Successfully connected to MongoDB Atlas');

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
            console.error('❌ Error connecting to MongoDB:', error.message);
            this.isConnected = false;
            throw error;
        }
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

